const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId, //this actual order id from order service
      required: true,
    },
    paymentId: {
      //this is the id from payment gateway like razorpay, stripe etc
      type: String,
    },
    razorpayOrderId: {
      //this is the id from payment gateway like razorpay, stripe etc
      type: String,
      required: true,
    },
    signature: {
      //this is the signature from payment gateway like razorpay, stripe etc
      type: String,
    },
    status: {
      //this is the status of the payment, it can be pending, completed or failed
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId, // this is the id of the user who made the payment
      required: true,
    },
    price: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        required: true,
        default: "INR",
        enum: ["INR", "USD"],
      },
    },
  },
  { timestamps: true },
);

const PaymentModel = mongoose.model("payment", paymentSchema);

module.exports = PaymentModel;
