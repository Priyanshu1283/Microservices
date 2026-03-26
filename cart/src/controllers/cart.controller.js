const cartModel = require('../models/cart.model');

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';

function lineProductId(item) {
    const id = item.productId ?? item.product;
    return id && id.toString ? id.toString() : String(id);
}

/**
 * Loads product details from the product service and returns lines the order service can use
 * without calling the product service again.
 */
async function buildCheckoutLines(items) {
    const lines = await Promise.all(
        (items || []).map(async (item) => {
            const productId = lineProductId(item);
            const res = await fetch(`${PRODUCT_SERVICE_URL}/api/products/${productId}`);
            if (!res.ok) {
                throw new Error(`Product ${productId} could not be loaded`);
            }
            const body = await res.json();
            const product = body.data;
            const lineTotal = product.price.amount * item.quantity;
            return {
                productId,
                quantity: item.quantity,
                product: {
                    title: product.title,
                    price: product.price,
                    stock: product.stock,
                },
                lineTotal,
            };
        })
    );

    let totalAmount = 0;
    let currency = 'INR';
    for (const line of lines) {
        totalAmount += line.lineTotal;
        if (line.product?.price?.currency) {
            currency = line.product.price.currency;
        }
    }

    return { lines, totalAmount, currency };
}

async function getCart(req, res) {
    const user = req.user;

    let cart = await cartModel.findOne({ user: user.id });

    if (!cart) {
        cart = new cartModel({ user: user.id, items: [] });
        await cart.save();
    }

    let checkout;
    try {
        checkout = await buildCheckoutLines(cart.items);
    } catch (err) {
        return res.status(502).json({
            message: 'Could not load product details for cart',
            error: err.message,
        });
    }

    res.status(200).json({
        cart,
        totals: {
            itemCount: cart.items.length,
            totalQuantity: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        },
        checkout,
    });
}


async function addItemToCart(req, res) {

    const { productId, qty } = req.body;

    const user = req.user

    let cart = await cartModel.findOne({ user: user.id });

    if (!cart) {
        cart = new cartModel({ user: user.id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (existingItemIndex >= 0) {
        cart.items[ existingItemIndex ].quantity += qty;
    } else {
        cart.items.push({ productId, quantity: qty });
    }

    await cart.save();

    res.status(200).json({
        message: 'Item added to cart',
        cart,
    });

}

async function updateItemQuantity(req, res) {
    const { productId } = req.params;
    const { qty } = req.body;
    const user = req.user;
    const cart = await cartModel.findOne({ user: user.id });
    if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
    }
    const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (existingItemIndex < 0) {
        return res.status(404).json({ message: 'Item not found' });
    }
    cart.items[ existingItemIndex ].quantity = qty;
    await cart.save();
    res.status(200).json({ message: 'Item updated', cart });
}

module.exports = {
    addItemToCart,
    updateItemQuantity,
    getCart
};