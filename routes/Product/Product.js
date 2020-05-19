const router = require('express').Router();
const verify = require('../User/verifytoken')
const Products = require('../../model/Product/Product')
const {toTextArea,toTitle} = require('../../validation')

const fs = require('fs')

const multer = require("multer")
const storage = multer.diskStorage({
    destination: function (req,file,cb) {
        cb(null,"./public/uploads/products")
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

//GET ALL Product
router.get('/',async(req,res)=>{

    try {
        //All Product
        const products = await Products.find();
        res.status(200).json(products)
   
    } catch (error) {
        res.status(400).json({message: error})
    }

})

//SUBMITS A Product
router.post('/create',upload.any(),verify,async(req,res)=>{

    
    const product = new Products({
        title_product: toTitle(req.body.title_product),
        image: req.files,
        category: req.body.category,
        price: req.body.price,
        cutted_price: req.body.cutted_price,
        satuan: req.body.satuan,
        berat:req.body.berat,
        sent_from: req.body.sent_from,
        estimation: req.body.estimation,
        tags: req.body.tags,
        star_1: req.body.star_1,
        star_2:  req.body.star_2,
        star_3: req.body.star_3,
        star_4:  req.body.star_4,
        star_5:  req.body.star_5,
        average_rating: req.body.average_rating,
        total_ratings: req.body.total_ratings,
        in_stock: req.body.in_stock,
        decription: toTextArea(req.body.decription),
        no_pedagang: req.body.no_pedagang
    })

    try {
        const savedProduct = await product.save();
       
        try{
            const updatedProduct =await Products.findOneAndUpdate(
                {_id: savedProduct._id},
                {$set:{   
                    incharge: savedProduct._id
                }},
                {  upsert: true,new:true }
            )   
           res.status(200).json(updatedProduct)
        } catch (error) {
            res.status(400).json({message: error})
        }
       
    } catch (error) {
        res.status(400).json({message: error})
    }
  
})

//SPECIFIC PRODUCT
router.get('/:productId',async(req,res)=>{

    try {
        const product =await Products.findById(req.params.productId)

        res.status(200).json(product)
    } catch (error) {
        res.status(400).json({message: error})
    }
})

//DeleteProduct
router.delete('/delete/:productId',verify,async(req,res)=>{

    try {
       
        try {
            const product =await Products.findById(req.params.productId)
            try {
                for (var i in product.image) {
                    val = product.image[i];
                     fs.unlinkSync('./'+val.path)
                } 
  
                //file removed
                const removedProduct =await Products.deleteOne({_id: req.params.productId})
                res.status(200).json(removedProduct)
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
router.patch('/update/:productId',upload.any(),verify,async(req,res)=>{

    try {


        const product =await Products.findById(req.params.products)
        try {

            for (var i in product.image) {
                val = product.image[i];
                 fs.unlinkSync('./'+val.path)
            } 

          
            //file removed
            const updatedProduct =await Products.updateOne(
                {_id: req.params.productId},
                {$set:{   
                    title_product: toTitle(req.body.title_product),
                    image: req.files,
                    category: req.body.category,
                    price: req.body.price,
                    cutted_price: req.body.cutted_price,
                    satuan: req.body.satuan,
                    berat:req.body.berat,
                    sent_from: req.body.sent_from,
                    estimation: req.body.estimation,
                    tags: req.body.tags,
                    star_1: req.body.star_1,
                    star_2:  req.body.star_2,
                    star_3: req.body.star_3,
                    star_4:  req.body.star_4,
                    star_5:  req.body.star_5,
                    average_rating: req.body.average_rating,
                    total_ratings: req.body.total_ratings,
                    in_stock: req.body.in_stock,
                    decription: toTextArea(req.body.decription),
                    no_pedagang: req.body.no_pedagang
                }}
            )   
            res.status(200).json(updatedProduct)
          } catch(err) {
            console.error(err)
          }

       
    } catch (error) {
        res.status(400).json({message: error})
    }
})

//Update in stock
router.patch('/updateInStock/:productId',verify,async(req,res)=>{

    try {

        var in_stock
        try{
           in_stock= await Products.find({_id :req.params.productId},
            {
                in_stock:1,
              
            })  
            .exec(async(err, result) => {
                if (err) throw res.status(400).json({message: err});
            
                var newinstock
                try {
                    //file removed
                    
                    if(in_stock){
                      newinstock = false
                    }else{
                        newinstock = true
                    }
                    const updatedProduct =await Products.updateOne(
                        {_id: req.params.productId},
                        {$set:{   
                            in_stock: newinstock,
                        }}
                    )   
                    res.status(200).json(updatedProduct)
                  } catch(err) {
                    console.error(err)
                  }

            });
          
        } catch (error) {
            res.status(400).json({message: error})
        }

       

       
    } catch (error) {
        res.status(400).json({message: error})
    }
})


module.exports = router