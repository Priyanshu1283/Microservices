const paymentModel = require("../models/payment.model");
const axios = require('axios');

require('dotenv').config();
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function createPayment(req, res) {
    const token = req.cookies.token || req.headers?.authorization?.split(' ')[1]; // Extract token from Authorization header or cookiesq


    try {
        const orderId = req.params.orderId; // Assuming orderId is passed as a URL parameter
        // Fetch order details from order service
        const orderResponse = await axios.get("http://localhost:3003/api/orders/" + orderId, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const price = orderResponse.data.order.totalPrice;
        console.log("Order data fetched from order service:", price);

        //Integrate Razorpay
        const razorpayOrderOptions = {
            amount: Math.round(price.amount * 100), // convert to paisa
            currency: price.currency || "INR",
            receipt: `receipt_${orderId}`
        };

        console.log("Creating Razorpay Order with options:", razorpayOrderOptions);
        console.log("Using Razorpay Key ID:", process.env.RAZORPAY_KEY_ID);

        const order = await razorpay.orders.create(razorpayOrderOptions);
        const payment = await paymentModel.create({
            order: orderId,
            razorpayOrderId: order.id,
            user: req.user.id,
            price: {
                amount: order.amount,
                currency: order.currency,
            }
        })
        return res.status(201).json({ message: 'Payment created successfully', payment });

    } catch (error) {
        console.error('Error creating payment:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function verifyPayment(req, res) {
    const { razorpayOrderId, paymentId, signature } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    try {
        const { validatePaymentVerification } = require('razorpay/dist/utils/razorpay-utils.js')
        const isValid = validatePaymentVerification({ 
            "order_id": razorpayOrderId, 
            "payment_id": paymentId 
        }, signature, secret);

        if (!isValid) {
            return res.status(400).json({ message: 'Invalid payment verification' });
        }
        // Update payment status in the database
        const payment = await paymentModel.findOne({ razorpayOrderId, status: 'PENDING' });
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        payment.paymentId = paymentId;
        payment.signature = signature;
        payment.status = 'COMPLETED';
        await payment.save();

        // Update Order status in Order service
        try {
            const token = req.cookies.token || req.headers?.authorization?.split(' ')[1];
            await axios.patch(`http://localhost:3003/api/orders/${payment.order}`, 
                { status: 'COMPLETED' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (orderErr) {
            console.error("Failed to update order status:", orderErr.message);
        }

        console.log(`✅ Payment successful for Order ID: ${payment.order}. Razorpay Payment ID: ${paymentId}`);
        res.status(200).json({ message: 'Payment verified successfully', payment });

    } catch (error) {
        console.error('Error verifying payment:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}


module.exports = {
    createPayment,
    verifyPayment
}