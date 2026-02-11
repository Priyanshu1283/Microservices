const {body, validationResult} = require('express-validator');
const mongoose = require('mongoose');


function validateResult(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}


const validateAddItemToCart = [
    body('productId')
    .isString()
    .withMessage('Invalid product ID')
    .custom(value => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid product ID format'),
    body('quantity')
    .isInt({ gt: 0 })
    .withMessage('Quantity must be a positive integer'),
validateResult,  
];


module.exports = {
    validateAddItemToCart
};