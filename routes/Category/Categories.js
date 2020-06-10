const router = require('express').Router();
const verify = require('../User/verifytoken')
const Category = require('../../model/Category/Category')
const TopDeals = require('./TopDeals/TopDeals')

const fs = require('fs')
var slugify = require('slugify')

const multer = require("multer")
const storage = multer.diskStorage({
    destination: function (req,file,cb) {
        cb(null,"./public/assets/uploads/categories/")
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

//GET ALL Category
router.get('/',async(req,res)=>{

    if(!req.query.isdropdown||req.query.isdropdown==undefined){
       
        try {
            //All Category
            const categories = await Category.find({},
                {
                    _id:1,
                    category_name:1,
                    icon: 1,
                    status:1,
                    slug: 1,
                });
            res.status(200).json(categories)
    
        } catch (error) {
            res.status(400).json({message: error})
        }
    }else{
        try {
            //All Category
            const categories = await Category.find({
                category_name: { $ne: "Home" }
            },
                {
                    _id:1,
                    category_name:1,
                    icon: 1,
                    status:1,
                    slug: 1,
                }) ;
            res.status(200).json(categories)
    
        } catch (error) {
            res.status(400).json({message: error})
        }
    }
    

})

//SUBMITS A Category
router.post('/create',upload.single('icon'),verify,async(req,res)=>{

    //Checking if category is already in database
    const categoryExist = await Category.findOne({category_name: req.body.category_name})
    if(categoryExist) return res.status(400).send('Category already exist');


    var path ={}
    if(req.method == "POST"){
     path = "assets/uploads/categories/"+req.file.filename
    }else{
        path = req.body.icon
    }
    
    const category = new Category({
        category_name: req.body.category_name,
        icon: path,
        status: req.body.status
    })

    try {
        const savedCategory = await category.save();
        res.status(200).json(savedCategory)
    } catch (error) {
        res.status(400).json({message: error})
    }
  
})

//SPECIFIC CATEGORY
router.get('/:categoryId',async(req,res)=>{

    try {
        const category =await Category.findById(req.params.categoryId)
        res.status(200).json(category)
    } catch (error) {
        res.status(400).json({message: error})
    }
})

//DeleteCategory
router.delete('/delete/:categoryId',verify,async(req,res)=>{

    try {
       
        try {
            const category =await Category.findById(req.params.categoryId)
            try {
                fs.unlinkSync('./public/'+category.icon)
                console.log(category.icon)
                //file removed
                const removedCategory =await Category.deleteOne({_id: req.params.categoryId})
                res.status(200).json(removedCategory)
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

//Update a category
router.patch('/update/:categoryId',upload.single('icon'),verify,async(req,res)=>{

   var path ={}
        
        if(req.file!=undefined){
            
            path = "assets/uploads/categories/"+req.file.filename
         const category =await Category.findById(req.params.categoryId)
         try {
             if (category.icon != ""){
                 
                 fs.unlinkSync('./public/'+category.icon)
 
             }
             //file removed
             const updatedCategory =await Category.updateOne(
                 {_id: req.params.categoryId},
                 {$set:{   
                     category_name: req.body.category_name,
                     icon: path,
                     slug:slugify(req.body.category_name)
                 }}
             )
             res.status(200).json(updatedCategory)
           } catch(err) {
             console.error(err)
           }
 
        }else{
            try{
                //file removed
                const updatedCategory =await Category.updateOne(
                    {_id: req.params.categoryId},
                    {$set:{   
                        category_name: req.body.category_name,
                        slug:slugify(req.body.category_name)
                    }}
                )
                res.status(200).json(updatedCategory)
              } catch(err) {
                console.error(err)
              }
        }


    
       
   
})

//Update a category
router.patch('/update-status/:categoryId',verify,async(req,res)=>{

    try {


        const category =await Category.findById(req.params.categoryId)
        try {
            // if (category.icon != ""){
            //     fs.unlinkSync('./'+category.icon)
            // }
            var status
            if(category.status){
                status = false
            }else{
                status = true
            }
            //file removed
            const updatedCategory =await Category.updateOne(
                {_id: req.params.categoryId},
                {$set:{   
                    status : status
                }}
            )
            res.status(200).json(updatedCategory)
          } catch(err) {
            console.error(err)
          }

       
    } catch (error) {
        res.status(400).json({message: error})
    }
})

router.use('/:slugCategory/topdeals',TopDeals)

module.exports = router