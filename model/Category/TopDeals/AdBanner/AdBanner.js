const mongoose = require('mongoose');


const AdBannerSchema = mongoose.Schema({
    background: {
        type: String,
        required:true
    },
    strip_ad_banner:{
        type: String,
        required:true
    } ,
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

module.exports = mongoose.model('AdBanner',AdBannerSchema)