const router = require('express').Router({mergeParams: true})
const verify = require('../../User/verifytoken')
const item = require('./item/Item')

const mongoose = require('mongoose');

const AdBanner = require('../../../model/Category/TopDeals/AdBanner/AdBanner')
const HorisontalViews = require('../../../model/Category/TopDeals/HorisontalView/HorisontalViews')
const GridViews = require('../../../model/Category/TopDeals/GridView/GridViews')
const MoveBanners = require('../../../model/Category/TopDeals/MoveBanner/MoveBanners')


const Category = require('../../../model/Category/Category')

const {isHex} = require('../../../validation')

const fs = require('fs')

const multer = require("multer")
const storage = multer.diskStorage({
    destination: function (req,file,cb) {
        cb(null,"./public/assets/uploads/topdeals")
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



//const MongoClient = require('mongodb').MongoClient;
//const conn = require('../../../connection').connect


//GET ALL TopDeal
// router.get('/',async(req,res)=>{

//     try {
//         //All TopDeal
       

//         await Category.aggregate([
//             {"$unwind":"$top_deals"}, 
//             {
//                 $match: { slug : req.params.slugCategory }
//               },
//             { $replaceRoot: { newRoot:"$top_deals"}}
//         ])
//         .exec((err, result) => {
//             if (err) throw res.status(400).json({message: err});
//             res.status(200).json(result)
//         });
//         //res.status(200).json(topdeals[0].top_deals)
   
//     } catch (error) {
//         res.status(400).json({message: error})
//     }

// })

//GET ALL info TopDeal
router.get('/',async(req,res)=>{

    try {
        //All TopDeal
       

        await Category.aggregate([
            { "$unwind": "$top_deals" },
            {
                $match: { slug : req.params.slugCategory }
              },
              
           { $replaceRoot: { newRoot:  { $mergeObjects: [ { top_id: "$_id",status: "$status",slug: "$slug"},"$top_deals" ] } }},
             {
                $lookup:
                    {
                        from: "products",
                        localField: 'grid_view.product_ID', 
                        foreignField: 'incharge',
                     
                        as: "grid_view"
                    }
             },
             {
                $lookup:
                    {
                        from: "products",
                        localField: 'horisontal_view.product_ID', 
                        foreignField: 'incharge',
                     
                        as: "horisontal_view"
                    }
             },
                {
                    $project: { 
                    "top_id":1,
                    "status":1,
                    "slug":1,
                    "move_banner":1,
                    "_id":1,
                    "view_type":1,
                    "grid_view._id": 1,
                    "grid_view.image": 1,
                    "grid_view.title_product":1,
                    "grid_view.price":1,
                    "horisontal_view._id":1,
                    "horisontal_view.image":1,
                    "horisontal_view.title_product":1,
                    "horisontal_view.price":1,
                    "horisontal_view.cutted_price":1,
                    "layout_background":1,
                    "title_background":1,
                    "background":1,
                    "strip_ad_banner":1,
                        

                    }
                    
                },
                {
                    "$addFields": {
                        "grid_view":   { $cond : [ { $eq : [ "$grid_view", [] ] },"$$REMOVE", 
                         {
                          "$map": {
                            "input": { $slice: [ "$grid_view", 8 ] },
                            "as": "g",
                            "in": {
                              
                              "_id": "$$g._id",
                              "title_product":"$$g.title_product",
                              "price":"$$g.price",
                              "image": {'$arrayElemAt': ['$$g.image', 0] } 
                            }
                          }
                        } ]},
                        "horisontal_view":  { $cond : [ { $eq : [ "$horisontal_view", [] ] },"$$REMOVE", 
                        {
                            "$map": {
                              "input": { $slice: [ "$horisontal_view", 8 ] },
                              "as": "h",
                              "in": {
                                "_id": "$$h._id",
                                "title_product":"$$h.title_product",
                                "price":"$$h.price",
                                "cutted_price":"$$h.cutted_price",
                                "image":{'$arrayElemAt': ['$$h.image', 0] } 
                              }
                            }
                         } ]}
                    }
                },
                { 
                    "$group": {
                        _id : "$top_id",
                        status: { "$first": "$status" },
                        category: { "$first": "$slug" },
                        top_deals: { $push: "$$ROOT"}
                    }
                },
                {
                    $project: { 
                    "top_deals.top_id":0,
                    "top_deals.status":0,
                    "top_deals.slug":0,
                    "_id":0
                   
                    }
                }
                
        ])
        .exec((err, result) => {
            if (err) throw res.status(400).json({message: err});
            res.status(200).json(result)
        });
       
       
   
    } catch (error) {
        res.status(400).json({message: error})
    }

})

//SUBMITS A TopDeal
router.post('/create/:viewtypeId',upload.any(),verify,async(req,res)=>{



    var top_deal ={}
    if(req.params.viewtypeId == 0){
     
        top_deal= new MoveBanners({
            move_banner: [],
            view_type: req.params.viewtypeId
        })
    }else if(req.params.viewtypeId == 1){
        top_deal= new AdBanner({
            background: req.body.background,
            strip_ad_banner:"assets/uploads/topdeals/"+req.files[0].filename,
            view_type: req.params.viewtypeId
        })
    }else if(req.params.viewtypeId == 2){
     
        top_deal= new GridViews({
            layout_background: req.body.layout_background,
            title_background:req.body.title_background,
            grid_view: [],
            view_type: req.params.viewtypeId
        })

    }else if(req.params.viewtypeId == 3){
        top_deal= new HorisontalViews({
            layout_background: req.body.layout_background,
            title_background:req.body.title_background,
            view_type: req.params.viewtypeId
            
        })
    }else{
        res.status(400).json("Input View Type Salah")
    }



    try {
        const addTopDeal =  await Category.findOneAndUpdate(
            {
                slug :  req.params.slugCategory
            },
            { $push: { top_deals: top_deal } }
            ,
            { upsert: true, new: true }
        );
        res.status(200).json(addTopDeal)
    } catch (error) {
        res.status(400).json({message: error})
    }

   


  
})

//SPECIFIC CATEGORY
router.get('/:topdealId',async(req,res)=>{

    const {error} = isHex(req.params.topdealId)
    if(error) {
        return res.status(400).send("Top Deal id Salah");
    }
    await Category.aggregate([
        {"$unwind":"$top_deals"}, 
        {"$match":{ 
            slug : req.params.slugCategory,
            "top_deals._id" : mongoose.Types.ObjectId(req.params.topdealId)}},
            { $replaceRoot: { newRoot:  { $mergeObjects: [ { top_id: "$_id",status: "$status",slug: "$slug"},"$top_deals" ] } }},
            {
            $lookup:
                {
                    from: "products",
                    localField: 'grid_view.product_ID', 
                    foreignField: 'incharge',
                 
                    as: "grid_view_info"
                }
         },
         {
            $lookup:
                {
                    from: "products",
                    localField: 'horisontal_view.product_ID', 
                    foreignField: 'incharge',
                 
                    as: "horisontal_view_info"
                }
         },
            {
                $project: { 
                    "top_id":1,
                    "status":1,
                    "slug":1,
                   "move_banner":1,
                   " _id":1,
                   "view_type":1,
                   "grid_view._id": 1,
                   "grid_view.product_ID": 1,
                   "grid_view_info._id": 1,
                    "grid_view_info.image": 1,
                    "grid_view_info.title_product":1,
                    "grid_view_info.price":1,
                    "grid_view_info.incharge":1,
                    "horisontal_view._id": 1,
                   "horisontal_view.product_ID": 1,
                    "horisontal_view_info._id":1,
                    "horisontal_view_info.incharge":1,
                    "horisontal_view_info.image":1,
                    "horisontal_view_info.title_product":1,
                    "horisontal_view_info.price":1,
                    "horisontal_view_info.cutted_price":1,
                    "layout_background":1,
                    "title_background":1,
                    "background":1,
                    "strip_ad_banner":1,
                    

                }
                
            },
            
            {"$unwind":
            {
                path: "$grid_view",
                preserveNullAndEmptyArrays: true
              }
            }, 
            {"$unwind":
            {
                path: "$grid_view_info",
                preserveNullAndEmptyArrays: true
              }
            }, 
            {"$unwind":
                {
                    path: "$horisontal_view",
                    preserveNullAndEmptyArrays: true
                }
            }, 
            {"$unwind":
                {
                    path: "$horisontal_view_info",
                    preserveNullAndEmptyArrays: true
                }
            }, 
            { "$group": { 
                "_id": "$_id",
                "top_id": { "$first":"$top_id"},
                "status": { "$first":"$status"},
                "slug": { "$first":"$slug"},
                "layout_background": { "$first":"$layout_background"},
                "title_background": { "$first":"$title_background"},
                "view_type": { "$first":"$view_type"},
                "background": { "$first":"$background"},
                "strip_ad_banner": { "$first":"$strip_ad_banner"},
                "move_banner": { "$first":"$move_banner"},
                "grid_view": { "$push": {
                    "$cond": [
                        { "$eq": [ "$grid_view.product_ID", "$grid_view_info.incharge" ] },
                        { "_id":"$grid_view._id",
                          "product_ID": "$grid_view_info._id",
                          "title_product": "$grid_view_info.title_product",
                          "price": "$grid_view_info.price",
                          "image": "$grid_view_info.image",
                        },"$$REMOVE"]
                }},
                "horisontal_view": { "$push": {
                    "$cond": [
                        { "$eq": [ "$horisontal_view.product_ID", "$horisontal_view_info.incharge" ] },
                        { "_id":"$horisontal_view._id",
                          "product_ID": "$horisontal_view_info._id",
                          "title_product": "$horisontal_view_info.title_product",
                          "price": "$horisontal_view_info.price",
                          "image": "$horisontal_view_info.image",
                        },"$$REMOVE"]
                }},

            }},
            {
                "$addFields": {
                    "grid_view":   { $cond : [ { $eq : [ { $arrayElemAt: [ "$grid_view", 0 ] }, {} ] },
                    { $cond : [ { $eq : ["$view_type", 2] } ,[],"$$REMOVE"]}, 
                     {
                      "$map": {
                        "input": "$grid_view",
                        "as": "g",
                        "in": {
                          
                          "_id": "$$g._id",
                          "product_ID":"$$g.product_ID",
                          "title_product":"$$g.title_product",
                          "price":"$$g.price",
                          "image": {'$arrayElemAt': ['$$g.image', 0] } 
                        }
                      }
                    } ]},
                    "layout_background":   { $cond : [ { $eq : [ "$layout_background", null ] },"$$REMOVE", "$layout_background"]},
                    "title_background":   { $cond : [ { $eq : [ "$title_background", null ] },"$$REMOVE", "$title_background"]},
                    "background":   { $cond : [ { $eq : [ "$background", null ] },"$$REMOVE", "$background"]},
                    "strip_ad_banner":   { $cond : [ { $eq : [ "$strip_ad_banner", null ] },"$$REMOVE", "$strip_ad_banner"]},
                    "move_banner":   { $cond : [ { $eq : [ "$move_banner", null ] },"$$REMOVE", "$move_banner"]},
                    "horisontal_view":  { $cond : [ { $eq : [ { $arrayElemAt: [ "$horisontal_view", 0 ] }, {} ] },
                    { $cond : [ { $eq : ["$view_type", 3] } ,[],"$$REMOVE"]},  
                    {
                        "$map": {
                          "input": "$horisontal_view",
                          "as": "h",
                          "in": {
                            "_id": "$$h._id",
                            "product_ID":"$$h.product_ID",
                            "title_product":"$$h.title_product",
                            "price":"$$h.price",
                            "cutted_price":"$$h.cutted_price",
                            "image": {'$arrayElemAt': ['$$h.image', 0] } 
                          }
                        }
                     } ]}
                }
            },
                { 
                    "$group": {
                        _id : "$top_id",
                        status: { "$first": "$status" },
                        category: { "$first": "$slug" },
                        top_deals: { $push: "$$ROOT"}
                    }
                },
                {
                    $project: { 
                    "top_deals.top_id":0,
                    "top_deals.status":0,
                    "top_deals.slug":0,
                    "_id":0
                   
                    }
                },
               
    ])
    .exec((err, result) => {
        if (err) throw res.status(400).json({message: error});
        res.status(200).json(result)
    });

})

//DeleteTopDeal
router.delete('/delete/:topdealId',verify,async(req,res,next)=>{


    const {error} = isHex(req.params.topdealId)
    if(error) return res.status(400).send("Top Deal id Salah");

    //Check id is exist
    const TopDealsExist = await Category.findOne(  
        { 
            slug : req.params.slugCategory,
            "top_deals._id" : mongoose.Types.ObjectId(req.params.topdealId )},
            {new: true},
        { array: 1 }
    );
    if(!TopDealsExist) return res.status(400).send('Top Deals tidak ditemukan');
   
    try {
       
        await Category.aggregate([
            {"$unwind":"$top_deals"}, 
            {"$match":{ 
                slug : req.params.slugCategory,
                "top_deals._id" : mongoose.Types.ObjectId(req.params.topdealId)}},
            { $replaceRoot: { newRoot:"$top_deals"}}
        ])
        .exec(async(err, result) => {
            if (err) throw res.status(400).json({message: error});

            
            try {
                if (result[0].view_type == 1){
                    fs.unlinkSync('./public/'+result[0].strip_ad_banner)
                }
                const deleteTopDeal = await  Category.updateOne(
                {
                    slug : req.params.slugCategory
                },
                { $pull: { top_deals: {  _id: mongoose.Types.ObjectId(req.params.topdealId)}  } }
                ,{ multi: true })
     
                res.status(200).json(deleteTopDeal)
            } catch (error) {
                res.status(400).json({message: error})
            }
        });
      
        //res.status(200).json(topdeals[0].top_deals)
   
    } catch (error) {
        res.status(400).json({message: error})
    }

    

  
})

//Update a topdeal
router.patch('/:topdealId/update/:viewtypeId',upload.any(),verify,async(req,res)=>{

    const {error} = isHex(req.params.topdealId)
    if(error) return res.status(400).send("Top Deal id Salah");

     //Check id is exist
     const TopDealsExist = await Category.findOne(  
        { 
            slug : req.params.slugCategory,
            "top_deals._id" : mongoose.Types.ObjectId(req.params.topdealId )},
        { array: 1 }
    );
    if(!TopDealsExist) return res.status(400).send('Top Deals tidak ditemukan');



     //Check id is exist
    await Category.aggregate([
        {"$unwind":"$top_deals"}, 
        {"$match":{
            slug : req.params.slugCategory,
            "top_deals._id" : mongoose.Types.ObjectId(req.params.topdealId)}},
        { $replaceRoot: { newRoot:"$top_deals"}}
    ])
    .exec(async(err, result) => {
        if (err) throw res.status(400).json("Id tidak diketahui");
        if(req.files[0]!=undefined){
            if (result[0].view_type == 1){
                fs.unlinkSync('./public/'+result[0].strip_ad_banner)
            }
        }
    });

    var top_deals ={}
    if(req.params.viewtypeId == 0){
       

        top_deals= new MoveBanners({
            move_banner: [],
            view_type: req.params.viewtypeId
        })
        try {



            const updateTopDeal =    await  Category.updateOne({
                    slug : req.params.slugCategory,
                    'top_deals._id': mongoose.Types.ObjectId(req.params.topdealId)
                  }, { $set: { 'top_deals.$': top_deals }})
                  .exec();
                res.status(200).json(updateTopDeal)
            
        } catch (error) {
            res.status(400).json({message: error})
        }
    }else if(req.params.viewtypeId == 1){

        if(req.files[0]!=undefined){
         
            top_deals= new AdBanner({
                background: req.body.background,
                strip_ad_banner:"assets/uploads/topdeals/"+req.files[0].filename,
                view_type: req.params.viewtypeId
            })
            try {



                const updateTopDeal =    await  Category.updateOne({
                        slug : req.params.slugCategory,
                        'top_deals._id': mongoose.Types.ObjectId(req.params.topdealId)
                    }, { $set: { 'top_deals.$': top_deals }})
                    .exec();
                    res.status(200).json(updateTopDeal)
                
            } catch (error) {
                res.status(400).json({message: error})
            }
        }else{
            try {



                const updateTopDeal =    await  Category.updateOne({
                        slug : req.params.slugCategory,
                        'top_deals._id': mongoose.Types.ObjectId(req.params.topdealId)
                    }, { $set: { 'top_deals.$.background': req.body.background }})
                    .exec();
                    res.status(200).json(updateTopDeal)
                
            } catch (error) {
                res.status(400).json({message: error})
            }
        }
    }else if(req.params.viewtypeId == 2){
    
        top_deals= new GridViews({
            layout_background: req.body.layout_background,
            title_background:req.body.title_background,
            grid_view: [],
            view_type: req.params.viewtypeId
        })
        try {



            const updateTopDeal =    await  Category.updateOne({
                    slug : req.params.slugCategory,
                    'top_deals._id': mongoose.Types.ObjectId(req.params.topdealId)
                  }, { $set: { 'top_deals.$': top_deals }})
                  .exec();
                res.status(200).json(updateTopDeal)
            
        } catch (error) {
            res.status(400).json({message: error})
        }
    }else if(req.params.viewtypeId == 3){
        top_deals= new HorisontalViews({
            layout_background: req.body.layout_background,
            title_background:req.body.title_background,
            view_type: req.params.viewtypeId
            
        })
        try {



            const updateTopDeal =    await  Category.updateOne({
                    slug : req.params.slugCategory,
                    'top_deals._id': mongoose.Types.ObjectId(req.params.topdealId)
                  }, { $set: { 'top_deals.$': top_deals }})
                  .exec();
                res.status(200).json(updateTopDeal)
            
        } catch (error) {
            res.status(400).json({message: error})
        }
    }else{
        res.status(400).json("Input View Type Salah")
    }


   

   
    
})


router.use('/:topdealId/item/',item)

module.exports = router