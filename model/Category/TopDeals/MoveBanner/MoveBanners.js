const mongoose = require('mongoose');


const MoveBannersSchema = mongoose.Schema({
    move_banner: {
        type: []
    },
    view_type:{
        type: Number,
        required:true
    },
    index:{
        type: Number,
        required:true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('MoveBanners',MoveBannersSchema)