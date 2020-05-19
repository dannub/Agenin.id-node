const mongoose = require('mongoose');

const ratingsSchema = new mongoose.Schema({
    
    product_ID: {
        type: String,
        required: true,
    },
    rating:{
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Rating',ratingsSchema);