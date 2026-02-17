const mongoose = require("mongoose");

const addressesSchema = new mongoose.Schema({
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
    phone: String,
    isDefault: { type: Boolean, default: false },
});


const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        currency: {
          type: String,
          required: true,
          enum: ["USD", "INR"],
        },
      },
    },
  ],
  totalPrice: {
    aamount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      enum: ["USD", "INR"],
    },
  },
  status: {
    type: String,
    enum: ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"],
    default: "PENDING",
  },

  shipingAddress: addressesSchema,
//   billingAddress: addressesSchema,
}, { timestamps: true });   

const orderModel = mongoose.model("order", orderSchema);

module.exports = orderModel;
