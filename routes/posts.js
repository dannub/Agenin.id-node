const router = require('express').Router();
const verify = require('./verifytoken')
const Post = require('../model/Post')

//GET ALL POST
router.get('/',verify,async(req,res)=>{

    try {
        //All Post
        const posts = await Post.find();
        //Sort by date ascending 
        // const posts = await Post.find().sort({'date': 1});
        //Sort by date descending
        // const posts = await Post.find().sort({'date': -1});
        res.status(200).json(posts)
   
    } catch (error) {
        res.status(400).json({message: error})
    }

})

//SUBMITS A POST
router.post('/',verify,async(req,res)=>{
    const post = new Post({
        title: req.body.title,
        description: req.body.description
    })

    try {
        const savedPost = await post.save();
        res.status(200).json(savedPost)
    } catch (error) {
        res.status(400).json({message: error})
    }
  
})

//SPECIFIC POST
router.get('/:postId',verify,async(req,res)=>{

    try {
        const post =await Post.findById(req.params.postId)
        res.status(200).json(post)
    } catch (error) {
        res.status(400).json({message: error})
    }
})

//DeletePost
router.delete('/:postId',verify,async(req,res)=>{

    try {
        const removedPost =await Post.remove({_id: req.params.postId})
        res.status(200).json(removedPost)
    } catch (error) {
        res.status(400).json({message: error})
    }
})

//Update a post
router.patch('/:postId',verify,async(req,res)=>{

    try {
        const updatedPost =await Post.updateOne(
            {_id: req.params.postId},
            {$set:{title: req.body.title,description: req.body.description}}
        )
        res.status(200).json(updatedPost)
    } catch (error) {
        res.status(400).json({message: error})
    }
})

module.exports = router