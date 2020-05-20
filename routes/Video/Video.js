const router = require('express').Router();
const verify = require('../User/verifytoken')
const Video = require('../../model/Video/Video')
const {toTitle} = require('../../validation')


const mongoose = require('mongoose');

const fs = require('fs')

const multer = require("multer")

const storage= multer.diskStorage({
    destination: function (req,file,cb) {
        cb(null,"./public/uploads/video/")
    },
    filename: function (req,file,cb) {
        cb(null, new Date().toISOString()+ file.originalname)
    }
})

const fileFilter = (req,file,cb)=>{
    if(file.mimetype == 'image/jpeg' ||file.mimetype == 'image/png' ){
        cb(null,true)
    }else{
        cb(null,false)
    }
    
    
}

const upload = multer({
    storage : storage,
    limit:{
        fileSize: 1024*1024 *5
    },
    fileFilter : fileFilter
})

//GET ALL Video
router.get('/',async(req,res)=>{

    try {
        //All Video
        const videos = await Video.find();
        res.status(200).json(videos)
   
    } catch (error) {
        res.status(400).json({message: error})
    }

})

//SUBMITS A Product
router.post('/create',upload.fields([
    {
    name: 'image'
  }]),verify,async(req,res)=>{

    
    const video = new Video({
        img_Url: "video/"+req.files.image[0].filename,
        title: toTitle(req.body.title),
        videoId: req.body.videoId
    })

    try {
        const savedVideo = await video.save();
        res.status(200).json(savedVideo)
       
    } catch (error) {
        res.status(400).json({message: error})
    }
  
})

//SPECIFIC Video
router.get('/:videoId',async(req,res)=>{

    try {
        const video =await Video.findById(req.params.videoId)

        res.status(200).json(video)
    } catch (error) {
        res.status(400).json({message: error})
    }
})

//DeleteProduct
router.delete('/delete/:videoId',verify,async(req,res)=>{

    try {
       
        try {
            const video =await Video.findById(req.params.videoId)
            
            try {
                fs.unlinkSync('./'+video.img_Url)
             
  
                //file removed
                const removedVideo =await Video.deleteOne({_id: mongoose.Types.ObjectId(req.params.videoId)})
                res.status(200).json(removedVideo)
              } catch(err) {
                console.error(err)
              }
        } catch (error) {
            res.status(400).json({message: error})
        }

      
    } catch (error) {
        res.status(400).json({message: error})
    }
})

//Update a video
router.patch('/update/:videoId',upload.fields([
    {
    name: 'image'
  }]),verify,async(req,res)=>{

    try {


        const video =await Video.findById(req.params.videoId)
        try {

            fs.unlinkSync('./public/uploads/'+video.img_Url)
          
            //file removed
            const updatedVideo =await Video.updateOne(
                {_id: req.params.videoId},
                {$set:{   
                    title: toTitle(req.body.title),
                    img_Url: "video/"+req.files.image[0].filename,
                    vid_Id: req.body.vid_Id
                }}
            )   
            res.status(200).json(updatedVideo)
          } catch(err) {
            console.error(err)
          }

       
    } catch (error) {
        res.status(400).json({message: error})
    }
})



module.exports = router