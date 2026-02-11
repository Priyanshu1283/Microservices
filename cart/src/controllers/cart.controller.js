const cartModel = require('../models/cart.model');


async function addItemToCart(req, res) {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    let cart = await cartModel.findOne({ user: userId });
    if (!cart) {
        cart = new cartModel({ user: userId, items: [] });
    }
    const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (existingItemIndex >= 0) {
        cart.items[existingItemIndex].quantity += quantity;
    } else {
        cart.items.push({ product: productId, quantity });
    }
    await cart.save();
    res.status(200).json({
        message: 'Item added to cart',
        cart });
}

module.exports = {
    addItemToCart,

};