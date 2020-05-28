const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    token_fb: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    email: {
        type: String,
        required: true,
        max: 225,
        min: 6
    },
    name_refferal: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    password:{
        type: String,
        required: true,
        max: 1024,
        min:6
    },
    handphone: {
        type: String
    },
    profil:  {
        type: String,
        required: true,
    },
    bukti: {
        type: String,
        required: true
    },
    bukti_tgl: {
        type: String,
        required: true
    },
    bukti_bank: {
        type: String,
        required: true
    },
    bukti_an: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true,
    },
    lastseen: {
        type: Date,
        default: Date.now
    },
    my_addresses: [],
    my_carts: [],
    my_notifications: [],
    my_ratings: [],
    my_wishlists: [],
    my_nota: [],
   
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('User',userSchema);