const express = require('express');
const authController = require('../controllers/auth.controller');
const { registerUserValidations, loginUserValidations ,addUserAddressValidations} = require('../middlewares/validator.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
// const { validate } = require('../modules/user.model');

const router = express.Router();

router.post('/register',
  registerUserValidations,
  authController.registerUser
);

router.post('/login',
  loginUserValidations,
  authController.loginUser
);

router.get('/me',
    authMiddleware.authMiddleware,
     authController.getCurrentUser
    );

router.get('/logout', 
     authController.logoutUser
    );

router.get('/users/me/addresses',
    authMiddleware.authMiddleware,
    authController.getUserAddresses
);

router.post('/users/me/addresses',
    addUserAddressValidations,
    authMiddleware.authMiddleware,
    authController.addUserAddress
);  

router.delete('/users/me/addresses/:addressId',
    authMiddleware.authMiddleware,
    authController.deleteUserAddress
);

module.exports = router;
