const mongoose = require('mongoose');

const whishlistSchema = new mongoose.Schema({
    
    product_ID: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Wishlist',whishlistSchema);