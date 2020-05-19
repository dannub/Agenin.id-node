const mongoose = require('mongoose');


const HorisontalViewSchema = mongoose.Schema({
    product_ID: {
        type: String,
        required:true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('HorisontalView',HorisontalViewSchema)