const mongoose = require('mongoose');

const notaSchema = new mongoose.Schema({
    //send
    bukti: {
        type: String,
        required: true,
    },
    atas_nama: {
        type: String,
        required: true,
    },
    bank: {
        type: String,
        required: true,
    },
    tgl_transfer: {
        type: String,
        required: true,
    },
    //proses
    ordered_date: {
        type: Date,
        default: Date.now
    },
    confirmed: {
        type: Boolean,
        required: true,
        default: false
    },
    confirmed_date: {
        type: Date,
        default: Date.now
    },
    packed: {
        type: Boolean,
        required: true,
        default: false
    },
    packed_date: {
        type: Date,
        default: Date.now
    },
    shipped: {
        type: Boolean,
        required: true,
        default: false
    },
    shipped_date: {
        type: Date,
        default: Date.now
    },
    delivered: {
        type: Boolean,
        required: true,
        default: false
    },
    delivered_date: {
        type: Date,
        default: Date.now
    },
    canceled: {
        type: Boolean,
        required: true,
        default: false,
    },
    canceled_date: {
        type: Date,
        default: Date.now
    },
    
    //ket kirim
    ket_kirim:{
        type: String,
        required: true,
        default: "",
    },
    metode_kirim:{
        type: String,
        required: true,
        default: ""
    },
    //address
    full_address: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    detail_address: {
        type: String,
        required: true,
    },
    kode_pos:{
        type: String,
        required: true,
    },
    //ongkir
    total_ongkir:{
        type: Number,
        required: true,
    },
    total_item_price:{
        type: Number,
        required: true,
    },
    total_amount:{
        type: Number,
        required: true,
    },
    save_ongkir:{
        type: Number,
        required: true,
    },
    items: [],

    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Nota',notaSchema);