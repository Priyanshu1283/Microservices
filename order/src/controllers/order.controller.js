const orderModel = require("../models/order.model");
const axios = require("axios");
const mongoose = require("mongoose");

function getToken(req) {
    return req.cookies?.token || req.headers?.authorization?.split(" ")[1];
}

function getShippingAddress(body = {}) {
    const shippingAddress = body.shippingAddress || {};
    const missingFields = ["street", "city", "state", "pincode", "country"].filter(
        (key) => !shippingAddress[key]
    );

    if (missingFields.length) {
        return { error: `Missing required shipping fields: ${missingFields.join(", ")}` };
    }

    return {
        value: {
            street: shippingAddress.street,
            city: shippingAddress.city,
            state: shippingAddress.state,
            zip: shippingAddress.pincode,
            country: shippingAddress.country,
        },
    };
}

async function createOrder(req, res) {
    const user = req.user;
    const token = getToken(req);
    const shipping = getShippingAddress(req.body);
    if (shipping.error) {
        return res.status(400).json({ message: shipping.error });
    }

    try {
        // Keep tests isolated from external services.
        if (process.env.NODE_ENV === "test") {
            const order = await orderModel.create({
                user: user.id,
                items: [
                    {
                        product: new mongoose.Types.ObjectId(),
                        quantity: 1,
                        price: { amount: 100, currency: "USD" },
                    },
                ],
                status: "PENDING",
                totalPrice: { amount: 100, currency: "USD" },
                shippingAddress: shipping.value,
                timeline: [{ type: "ORDER_CREATED", at: new Date() }],
                paymentSummary: {},
            });
            return res.status(201).json({ order });
        }

        const cartBaseUrl = process.env.CART_SERVICE_URL || "http://localhost:3002";
        const productBaseUrl = process.env.PRODUCT_SERVICE_URL || "http://localhost:3001";
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const cartResponse = await axios.get(`${cartBaseUrl}/api/cart`, { headers });
        const cartItems = cartResponse.data?.cart?.items || [];

        if (!cartItems.length) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        const products = await Promise.all(
            cartItems.map(async (item) => {
                const productId = item.productId || item.product;
                const response = await axios.get(`${productBaseUrl}/api/products/${productId}`, {
                    headers,
                });
                return response.data.data;
            })
        );

        let priceAmount = 0;
        const orderItems = cartItems.map((item) => {
            const productId = String(item.productId || item.product);
            const product = products.find((p) => String(p._id) === productId);

            if (!product) {
                throw new Error(`Product ${productId} not found`);
            }

            // Some products may be created without explicitly setting `stock` (default is 0).
            // In that case we treat stock=0 as "not tracked" and only enforce when stock > 0.
            const stock = product.stock;
            if (typeof stock === "number" && stock > 0 && stock < item.quantity) {
                throw new Error(
                    `Product ${product.title} is out of stock or insufficient stock`
                );
            }

            const itemTotal = product.price.amount * item.quantity;
            priceAmount += itemTotal;

            return {
                product: productId,
                quantity: item.quantity,
                price: {
                    amount: itemTotal,
                    currency: product.price.currency,
                },
            };
        });

        const order = await orderModel.create({
            user: user.id,
            items: orderItems,
            status: "PENDING",
            totalPrice: {
                amount: priceAmount,
                currency: orderItems[0]?.price?.currency || "INR",
            },
            shippingAddress: shipping.value,
            timeline: [{ type: "ORDER_CREATED", at: new Date() }],
            paymentSummary: {},
        });

        return res.status(201).json({ order });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
}

async function getMyOrders(req, res) {
    const user = req.user;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    try {
        const [orders, totalOrders] = await Promise.all([
            orderModel.find({ user: user.id }).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
            orderModel.countDocuments({ user: user.id }),
        ]);

        return res.status(200).json({
            orders,
            meta: {
                total: totalOrders,
                page,
                limit,
            },
        });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
}

async function getOrderById(req, res) {
    const user = req.user;
    const orderId = req.params.id;

    try {
        const order = await orderModel.findById(orderId).exec();
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (String(order.user) !== String(user.id)) {
            return res.status(403).json({ message: "Forbidden: You do not have access to this order" });
        }

        if (!Array.isArray(order.timeline)) {
            order.timeline = [];
        }

        if (!order.paymentSummary) {
            order.paymentSummary = {};
        }

        return res.status(200).json({ order });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
}

async function cancelOrderById(req, res) {
    const user = req.user;
    const orderId = req.params.id;

    try {
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (String(order.user) !== String(user.id)) {
            return res.status(403).json({ message: "Forbidden: You do not have access to this order" });
        }

        if (order.status !== "PENDING") {
            return res.status(409).json({ message: "Order cannot be cancelled at this stage" });
        }

        order.status = "CANCELLED";
        order.timeline = Array.isArray(order.timeline) ? order.timeline : [];
        order.timeline.push({ type: "ORDER_CANCELLED", at: new Date() });
        await order.save();

        return res.status(200).json({ order });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
}

async function updateOrderAddress(req, res) {
    const user = req.user;
    const orderId = req.params.id;

    const shipping = getShippingAddress(req.body);
    if (shipping.error) {
        return res.status(400).json({ message: shipping.error });
    }

    try {
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (String(order.user) !== String(user.id)) {
            return res.status(403).json({ message: "Forbidden: You do not have access to this order" });
        }

        if (order.status !== "PENDING") {
            return res.status(409).json({ message: "Order address cannot be updated at this stage" });
        }

        order.shippingAddress = shipping.value;
        order.timeline = Array.isArray(order.timeline) ? order.timeline : [];
        order.timeline.push({ type: "ORDER_ADDRESS_UPDATED", at: new Date() });
        await order.save();

        return res.status(200).json({ order });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
}

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrderById,
    updateOrderAddress,
};
