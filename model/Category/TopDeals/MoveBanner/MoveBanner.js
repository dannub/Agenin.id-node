const mongoose = require('mongoose');


const MoveBannerSchema = mongoose.Schema({
    banner: {
        type: String,
        required:true
    },
    banner_background:{
        type: String,
        required:true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('MoveBanner',MoveBannerSchema)