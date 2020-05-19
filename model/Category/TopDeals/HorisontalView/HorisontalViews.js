
const mongoose = require('mongoose');
const HorisontalView = require('./HorisontalView')


const HorisontalViewsSchema = mongoose.Schema({

    layout_background: {
        type: String
    },
    title_background:{
        type: String,
        required:true
    },
    horisontal_view:{
        type: [],
        required:true
    },
    view_type:{
        type: Number,
        required:true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('HorisontalViews',HorisontalViewsSchema)
