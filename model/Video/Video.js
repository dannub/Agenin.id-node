const mongoose = require('mongoose');

const VideoSchema = mongoose.Schema({
  
   
    img_Url:{
        type: String,
        required:true
    },
    title:{
        type: String,
        required:true
    },
    videoId:{
        type: String,
        required:true
    },
    date: {
        type: Date,
        default: Date.now
    }
})



module.exports = mongoose.model('Videos',VideoSchema)