const mongoose = require('mongoose');

const cartsSchema = new mongoose.Schema({
    product_ID: {
        type: String,
        required: true,
    },
    jumlah: {
        type: Number,
        required: true,
    },
    
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Cart',cartsSchema);