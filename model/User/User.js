const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    token_fb: {
        type: String
      
    },
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    role: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        max: 225,
        min: 6
    },
    name_refferal: {
        type: String,
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
        type: String
    },
    bukti: {
        type: String
    },
    bukti_tgl: {
        type: String
    },
    bukti_bank: {
        type: String
    },
    bukti_an: {
        type: String
    },
    status: {
        type: Boolean
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