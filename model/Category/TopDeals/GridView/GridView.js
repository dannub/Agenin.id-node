const mongoose = require('mongoose');


const GridViewSchema = mongoose.Schema({
    product_ID: {
        type: String,
        required:true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('GridView',GridViewSchema)