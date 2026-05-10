const mongoose = require('mongoose');
const cartModel = require('../models/cart.model');
const axios = require('axios');

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';

function lineProductId(item) {
    const id = item.productId ?? item.product;
    return id ? id.toString() : null;
}

/**
 * Loads product details from the product service and returns lines the order service can use
 * without calling the product service again.
 */
async function buildCheckoutLines(items) {
    console.log(`🛠️ Building checkout lines for ${items?.length || 0} items`);
    const linesResults = await Promise.all(
        (items || []).map(async (item) => {
            const productId = lineProductId(item);
            if (!productId) return null;
            
            try {
                const res = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/${productId}`);
                const product = res.data.data;
                
                if (!product) {
                    console.log(`⚠️ Product ${productId} not found in Product Service`);
                    return null;
                }

                const lineTotal = product.price.amount * item.quantity;
                return {
                    productId,
                    quantity: item.quantity,
                    product: {
                        title: product.title,
                        price: product.price,
                        stock: product.stock,
                        images: product.images
                    },
                    lineTotal,
                };
            } catch (err) {
                console.error(`❌ Error fetching product ${productId}:`, err.message);
                return null;
            }
        })
    );

    const lines = linesResults.filter(line => line !== null);
    console.log(`✅ Built ${lines.length} valid checkout lines`);

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
    console.log(`🛒 Fetching cart for user: ${user.id}`);

    let cart = await cartModel.findOne({ user: user.id });

    if (!cart) {
        console.log(`🆕 Creating new cart for user: ${user.id}`);
        cart = new cartModel({ user: user.id, items: [] });
        await cart.save();
    }

    let checkout;
    try {
        checkout = await buildCheckoutLines(cart.items);
        
        // Sync database if items were filtered out (only if we have items but no valid lines)
        if (cart.items.length > 0 && checkout.lines.length === 0) {
             console.log(`⚠️ All items in cart are invalid. Cleaning up.`);
             cart.items = [];
             await cart.save();
        } else if (checkout.lines.length !== cart.items.length) {
            console.log(`🔄 Syncing cart DB: ${cart.items.length} -> ${checkout.lines.length}`);
            const validProductIds = new Set(checkout.lines.map(l => l.productId));
            cart.items = cart.items.filter(item => validProductIds.has(lineProductId(item)));
            await cart.save();
        }
    } catch (err) {
        console.error("❌ getCart error:", err.message);
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
    try {
        const { productId, qty } = req.body;
        const user = req.user;
        const quantity = Number(qty) || 1;

        console.log(`➕ Adding to cart: User=${user.id}, Product=${productId}, Qty=${quantity}`);

        let cart = await cartModel.findOne({ user: user.id });

        if (!cart) {
            cart = new cartModel({ user: user.id, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(item => lineProductId(item) === String(productId));
        console.log(`🔍 Existing item index: ${existingItemIndex}`);

        if (existingItemIndex >= 0) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({ productId: new mongoose.Types.ObjectId(String(productId)), quantity });
        }

        await cart.save();
        console.log(`💾 Cart saved. Total items: ${cart.items.length}`);

        return await getCart(req, res);
    } catch (err) {
        console.error("❌ Add to cart error:", err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
}

async function updateItemQuantity(req, res) {
    try {
        const { productId } = req.params;
        const { qty } = req.body;
        const user = req.user;
        const cart = await cartModel.findOne({ user: user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        const existingItemIndex = cart.items.findIndex(item => lineProductId(item) === String(productId));
        if (existingItemIndex < 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        cart.items[existingItemIndex].quantity = Number(qty);
        await cart.save();
        return await getCart(req, res);
    } catch (err) {
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
}

async function clearCart(req, res) {
    const user = req.user;
    await cartModel.findOneAndUpdate({ user: user.id }, { items: [] });
    res.status(200).json({ message: 'Cart cleared' });
}

async function removeItemFromCart(req, res) {
    try {
        const { productId } = req.params;
        const user = req.user;
        const cart = await cartModel.findOne({ user: user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        
        const initialLength = cart.items.length;
        cart.items = cart.items.filter(item => lineProductId(item) !== String(productId));
        
        if (cart.items.length === initialLength) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }
        
        await cart.save();
        console.log(`🗑️ Item ${productId} removed from cart. Remaining: ${cart.items.length}`);
        return await getCart(req, res);
    } catch (err) {
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
}

module.exports = {
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    getCart,
    clearCart
};