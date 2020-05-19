const mongoose = require('mongoose');

const itemNotaSchema = new mongoose.Schema({
    product_ID: {
        type: String,
        required: true,
    },
    jumlah: {
        type: Number,
        required: true,
    },
    ongkir: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('ItemNota',itemNotaSchema);