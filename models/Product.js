const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discountPrice: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        required: true
    },
    images: [String],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    reviews: [{
        user: mongoose.Schema.Types.ObjectId,
        name: String,
        rating: Number,
        comment: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    weight: String,
    metal: String,
    gemstone: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);
