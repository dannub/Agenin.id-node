const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');

mongoose.set('useCreateIndex', true)
mongoose.plugin(slug);

const CategorySchema = mongoose.Schema({
    category_name: {
        type: String,
        required:true
    },
    icon:{
        type: String,
    },
    top_deals: [],
    slug:{
        type: String, slug: "category_name"
    },
    status:{
        type: Boolean,
        required:true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Category',CategorySchema)