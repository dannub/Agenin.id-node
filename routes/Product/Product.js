const router = require('express').Router();
const verify = require('../User/verifytoken')
const Products = require('../../model/Product/Product')
const {toTextArea,toTitle} = require('../../validation')

const mongoose = require('mongoose');
const fs = require('fs')

const multer = require("multer")
const storage = multer.diskStorage({
    destination: function (req,file,cb) {
        cb(null,"./public/assets/uploads/products")
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

    const resPerPage = parseInt(req.query.limit); // results per page
    const page = parseInt(req.query.page || 1); 
    var numOfProducts,numOfpage  
  

    if(req.query.search!=undefined && req.query.search!=""){
       
        try {
            
            
            const product =await Products.find(
            {
                $or:
                    [ 
                        { title_product : new RegExp(req.query.search ,'i')},
                        {tags : new RegExp(req.query.search ,'i')},
                        {category : new RegExp(req.query.search ,'i')},
                        {sent_from : new RegExp(req.query.search ,'i')},
                        {decription : new RegExp(req.query.search ,'i')},
                      
                    ]
                
            }).skip((resPerPage * page) - resPerPage)
            .limit(resPerPage)



            numOfProducts = await Products.find(
                {
                    $or:
                        [ 
                            { title_product : new RegExp(req.query.search ,'i')},
                            {tags : new RegExp(req.query.search ,'i')},
                            {category : new RegExp(req.query.search ,'i')},
                            {sent_from : new RegExp(req.query.search ,'i')},
                            {decription : new RegExp(req.query.search ,'i')},
                           
                        ]
                    
                }).countDocuments()

             numOfpage = Math.ceil(numOfProducts / resPerPage) //jumlah halaman
            
        
            res.status(200).json({
                products : product,
                page : numOfpage,
                currentPage: page, 
                totalProducts: numOfProducts
            })
        } catch (error) {
            res.status(400).json({message: error})
        }   
    }else{
         try {
            
            
            //All Product
            const product = await Products.find() .skip((resPerPage * page) - resPerPage)
            .limit(resPerPage);
            numOfProducts = await Products.find().countDocuments()
           
            //console.log(numOfProducts)
            numOfpage = Math.ceil(numOfProducts / resPerPage) //jumlah halaman
            
            
        
            res.status(200).json({
                products : product,
                page : numOfpage,
                currentPage: page, 
                totalProducts: numOfProducts
            })
    
        } catch (error) {
            res.status(400).json({message: error})
        }
    }

})


//GET ALL Product
router.get('/search/',async(req,res)=>{

   
  
        try {
         
            const product =await Products.find(
            {
                $or:
                    [ 
                        { title_product : new RegExp(req.query.search ,'i')},
                        {category : new RegExp(req.query.search ,'i')},
                        {sent_from : new RegExp(req.query.search ,'i')},
                        {decription : new RegExp(req.query.search ,'i')},
                        {tags : new RegExp(req.query.search ,'i')},
                    ]
                
            })

            res.status(200).json(product)
        } catch (error) {
            res.status(400).json({message: error})
        }   
})



//SUBMITS A Product
router.post('/create',upload.fields([
    {
    name: 'image'
  }]),verify,async(req,res,next)=>{


    // res.header('Access-Control-Allow-Origin', "https://agenin.herokuapp.com/api/products/create");
    // res.header('Access-Control-Allow-Headers', 'Origin,X-Requested,Content-Type,Accept,Authorization');
    // res.header('Access-Control-Allow-Credentials', 'true');
    // res.header('Access-Control-Expose-Headers', 'Content-Length');
    // if(req.method ==='OPTIONS'){
    //   res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    //   return res.status(200).json({});
    // }

    var imageArray = []
    req.files.image.forEach(function(image) {
         imageArray.push("assets/uploads/products/"+image.filename)
        /* etc etc */ })
    const product = new Products({

        title_product: toTitle(req.body.title_product),
        image: imageArray,
        incharge:"",
        category: req.body.category,
        price: req.body.price,
        cutted_price: req.body.cutted_price,
        satuan: req.body.satuan,
        min_order:req.body.min_order,
        berat:req.body.berat,
        sent_from: req.body.sent_from,
        estimation: req.body.estimation,
        tags: req.body.tags,
        star_1: 0,
        star_2:  0,
        star_3: 0,
        star_4:  0,
        star_5:  0,
        average_rating: "0.0",
        total_ratings: 0,
        in_stock: true,
        description: toTextArea(req.body.description),
        no_pedagang: req.body.no_pedagang
    })

    try {
 
        const savedProduct = await product.save(async function(err, doc) {
            if (err) return console.error(err);
            
            try{
                const updatedProduct =await Products.findOneAndUpdate(
                    {_id: mongoose.Types.ObjectId(doc._id)},
                    {$set:{   
                        incharge: doc._id
                    }},
                    {  upsert: true,new:true },
                    function(err, doc) {
                        if (err) return console.error(err);
                       
                      }
                )   
               res.status(200).json(updatedProduct)
               next()
            } catch (error) {
                res.status(400).json({message: error})
            }
          });
     
       
       
    } catch (error) {
        res.status(400).json({message: error})
    }
  
})

//SPECIFIC PRODUCT
router.get('/id/:productId',async(req,res)=>{

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
                    fs.unlinkSync('./public/'+val)
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
router.patch('/update/:productId',upload.fields([
    {
    name: 'image'
  }]),verify,async(req,res,next)=>{

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed

        if(req.files.image!=undefined){
                

            const product =await Products.findById(req.params.productId)
            try {

                for (var i in product.image) {
                    val = product.image[i];
                    fs.unlinkSync('./public/'+val)
                } 


            
                var imageArray = []
                req.files.image.forEach(function(image) {
                    imageArray.push("assets/uploads/products/"+image.filename)
                    /* etc etc */ })
                //file removed
                const updatedProduct =await Products.updateOne(
                    {_id: req.params.productId},
                    {$set:{   
                        title_product: toTitle(req.body.title_product),
                        image: imageArray,
                        category: req.body.category,
                        price: req.body.price,
                        cutted_price: req.body.cutted_price,
                        satuan: req.body.satuan,
                        min_order:req.body.min_order,
                        berat:req.body.berat,
                        sent_from: req.body.sent_from,
                        estimation: req.body.estimation,
                        tags: req.body.tags,
                        in_stock: req.body.in_stock,
                        decription: toTextArea(req.body.decription),
                        no_pedagang: req.body.no_pedagang
                    }}
                )   
                res.status(200).json(updatedProduct)
                next()
            } catch(err) {
                console.error(err)
            }

        }else{
            
            try {

                const updatedProduct =await Products.updateOne(
                    {_id: req.params.productId},
                    {$set:{   
                        title_product: toTitle(req.body.title_product),
                        category: req.body.category,
                        price: req.body.price,
                        cutted_price: req.body.cutted_price,
                        satuan: req.body.satuan,
                        min_order:req.body.min_order,
                         berat:req.body.berat,
                        sent_from: req.body.sent_from,
                        estimation: req.body.estimation,
                        tags: req.body.tags,
                        in_stock: req.body.in_stock,
                        decription: toTextArea(req.body.decription),
                        no_pedagang: req.body.no_pedagang
                    }}
                )   
                res.status(200).json(updatedProduct)
                next()
            } catch(err) {
                console.error(err)
            }
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
                    
                    if(result[0].in_stock){
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

// var path = require('path');
// var mime = require('mime');
// var fs = require('fs');

// app.get('/download', function(req, res){

//   var file = __dirname + '/upload-folder/dramaticpenguin.MOV';

//   var filename = path.basename(file);
//   var mimetype = mime.lookup(file);

//   res.setHeader('Content-disposition', 'attachment; filename=' + filename);
//   res.setHeader('Content-type', mimetype);

//   var filestream = fs.createReadStream(file);
//   filestream.pipe(res);
// });


module.exports = router