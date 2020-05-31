const mongoose = require('mongoose');
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;
const ProductSchema = mongoose.Schema({
  
    incharge:{
        type: String
    },
    title_product:{
        type: String,
        required:true
    },
    image:{
        type: [],
        required:true
    },
    category:{
        type: String,
        required:true
    },
    price:{
        type: String,
        required:true
    },
    cutted_price:{
        type: String
    },
    satuan:{
        type: String
    },
    min_order:{
        type: Number,
        required:true
    },
    berat:{
        type: SchemaTypes.Double,
        required:true
    },
    sent_from:{
        type: String,
        required:true
    },
    estimation:{
        type: String
    },
    tags:{
        type: [],
        required:true
    },
    star_1: {
        type: Number,
        required:true
    },
    star_2: {
        type: Number,
        required:true
    },
    star_3: {
        type: Number,
        required:true
    },
    star_4: {
        type: Number,
        required:true
    },
    star_5: {
        type: Number,
        required:true
    },
    average_rating:{
        type: String,
        required:true
    },
    total_ratings:{
        type: Number,
        required:true
    },
    in_stock:{
        type: Boolean,
        required:true
    },
    decription:{
        type: String
    },
    no_pedagang:{
        type: String
    },
   
    date: {
        type: Date,
        default: Date.now
    }
})



module.exports = mongoose.model('Products',ProductSchema)