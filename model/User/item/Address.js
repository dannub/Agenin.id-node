const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    nama: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    no_telepon: {
        type: String,
        required: true,
    },
    no_alternatif: {
        type: String,
        required: true,
    },
    provinsi: {
        type: String,
        required: true,
    },
    kabupaten: {
        type: String,
        required: true,
    },
    kecamatan: {
        type: String,
        required: true,
    },
    kodepos: {
        type: String,
        required: true,
    },
    detail: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Address',addressSchema);