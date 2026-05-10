
const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    price: {
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            enum: [ 'USD', 'INR' ],
            default: 'INR'
        }
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    images: [
        {
            url: String,
            thumbnail: String,
            id: String
        }
    ],
    category: {
        type: String,
        default: 'General'
    },
    originalPrice: {
        type: Number
    },
    rating: {
        type: Number,
        default: 4.5
    },
    numReviews: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        default: 0
    }
})

productSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('product', productSchema);
