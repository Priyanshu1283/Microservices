const express = require('express');
const router = express.Router();
const createAuthMiddleware = require('../middlewares/auth.middleware');
const cartController = require('../controllers/cart.controller');
const validation = require('../middlewares/validation.middleware');


router.post('/items',
    validation.validateAddItemToCart,
     createAuthMiddleware(["user"]),
      cartController.addItemToCart);

module.exports = router;