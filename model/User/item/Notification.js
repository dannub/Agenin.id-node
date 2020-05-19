const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    id_pesan: {
        type: String,
        required: true,
    },
    title:{
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
    },
    readed: {
        type: Boolean,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Notification',notificationSchema);