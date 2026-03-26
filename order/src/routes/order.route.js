const express = require("express");
const createAuthMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();
const orderController = require("../controllers/order.controller");

// Order routes:
// Keep these before `/:id` route to avoid Express treating `me`/`seller` as an `:id`.

router.post("/", createAuthMiddleware(["user"]), orderController.createOrder);

router.get("/me", createAuthMiddleware(["user"]), orderController.getMyOrders);

router.get("/:id", createAuthMiddleware(["user"]), orderController.getOrderById);

router.post(
    "/:id/cancel",
    createAuthMiddleware(["user"]),
    orderController.cancelOrderById
);

router.patch(
    "/:id/address",
    createAuthMiddleware(["user"]),
    orderController.updateOrderAddress
);

module.exports = router;