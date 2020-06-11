
const mongoose = require('mongoose');


const GridViewsSchema = mongoose.Schema({

    layout_background: {
        type: String
    },
    title_background:{
        type: String,
        required:true
    },
    grid_view:{
        type: [],
        required:true
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

module.exports = mongoose.model('GridViews',GridViewsSchema)
