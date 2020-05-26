const router = require('express').Router({mergeParams: true});
const verify = require('../../../User/verifytoken')
const mongoose = require('mongoose');

const HorisontalView = require('../../../../model/Category/TopDeals/HorisontalView/HorisontalView')

const GridView = require('../../../../model/Category/TopDeals/GridView/GridView')

const MoveBanner = require('../../../../model/Category/TopDeals/MoveBanner/MoveBanner')


const Category = require('../../../../model/Category/Category')

const {isHex} = require('../../../../validation')


const fs = require('fs')

const multer = require("multer")
const storage = multer.diskStorage({
    destination: function (req,file,cb) {
        cb(null,"./public/assets/uploads/item/")
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


//GET ALL Item
router.get('/',async(req,res)=>{

    try {
        //All Item
       


        await Category.aggregate([
            {"$unwind":"$top_deals"}, 
            {
                $match: { 
                    slug : req.params.slugCategory,
                    "top_deals._id": mongoose.Types.ObjectId(req.params.topdealId)
                }
              },
              {$project : {
                item : 
                    {
                        $cond: {
                            if: { $eq: [ 0, "$top_deals.view_type" ] },
                            then: "$top_deals.move_banner",
                            else: 
                            {
                                $cond: {
                                   if: { $eq: [ 2, "$Items.view_type" ] },
                                   then: "$top_deals.grid_view",
                                   else: 
                                   {
                                        $cond: {
                                        if: { $eq: [ 3, "$top_deals.view_type" ] },
                                        then: "$top_deals.horisontal_view",
                                        else: 
                                             "$top_deals"   
                                        }
                                    }
                                }
                             }
                        }
                    }
                
                }
            }
        ])
        .exec((err, result) => {
            if (err) throw res.status(400).json({message: err});
            res.status(200).json(result[0].item)
        });
   
    } catch (error) {
        res.status(400).json({message: error})
    }

})

//SUBMITS A Item
router.post('/create',upload.any(),verify,async(req,res)=>{



    var viewtypeId ={}

    await Category.aggregate([
        {"$unwind":"$top_deals"}, 
        {
            $match: { 
                slug : req.params.slugCategory,
                "top_deals._id": mongoose.Types.ObjectId(req.params.topdealId)
            }
          },
          {
              $project : {
                    type_view : "$top_deals.view_type"
              
             }
    
        }
    ])
    .exec(async(err, result) => {
     if (err) throw res.status(400).json({message: err});
    
        viewtypeId = result[0].type_view;



        var item ={}
        if(viewtypeId == 0){
        
            item= new MoveBanner({
                banner: "assets/uploads/item/"+req.files[0].filename,
                banner_background: req.body.banner_background
            })
            try {
                const addItem =  await Category.updateOne(
                    {
                        slug :  req.params.slugCategory,
                        "top_deals._id" :  mongoose.Types.ObjectId(req.params.topdealId)
                    },
                    { $push: { "top_deals.$.move_banner": item } }
                    ,{ multi: true }
                );
                res.status(200).json(addItem)
            } catch (error) {
                res.status(400).json({message: error})
            }
    
        }else if(viewtypeId == 1){
            res.status(400).json("Ini adalah ads");
        }else if(viewtypeId == 2){
            item = new GridView({
                product_ID: req.body.product_ID
            })
            try {
                const addItem =  await Category.updateOne(
                    {
                        slug :  req.params.slugCategory,
                        "top_deals._id" :  mongoose.Types.ObjectId(req.params.topdealId)
                    },
                    { $push: { "top_deals.$.grid_view": item } }
                    ,{ multi: true }
                );
                res.status(200).json(addItem)
            } catch (error) {
                res.status(400).json({message: error})
            }

        }else if(viewtypeId == 3){
            item = new HorisontalView({
                product_ID: req.body.product_ID
            })

            try {
                const addItem =  await Category.updateOne(
                    {
                        slug :  req.params.slugCategory,
                        "top_deals._id" :  mongoose.Types.ObjectId(req.params.topdealId)
                    },
                    { $push: { "top_deals.$.horisontal_view": item } }
                    ,{ multi: true }
                );
                res.status(200).json(addItem)
            } catch (error) {
                res.status(400).json({message: error})
            }
        }else{
            res.status(400).json("Input View Type Salah")
        }



     
    });

    

   


  
})

//SPECIFIC CATEGORY
router.get('/:itemId',async(req,res)=>{

    //Cek Top Deal ID
    const {error} = isHex(req.params.topdealId)
    if(error) {
        return res.status(400).send("Top Deal id Salah");
    }
     //Cek Item ID
    const {error_item} = isHex(req.params.itemId)
    if(error_item) {
        return res.status(400).send("Item id Salah");
    }

    await Category.aggregate([ {"$unwind":"$top_deals"}, 
    {
        $match: { 
            slug : req.params.slugCategory,
            "top_deals._id": mongoose.Types.ObjectId(req.params.topdealId)
        }
      },
      {$project : {
        item : 
            {
                $cond: {
                    if: { $eq: [ 0, "$top_deals.view_type" ] },
                    then: "$top_deals.move_banner",
                    else: 
                    {
                        $cond: {
                           if: { $eq: [ 2, "$top_deals.view_type" ] },
                           then: "$top_deals.grid_view",
                           else: 
                           {
                                $cond: {
                                if: { $eq: [ 3, "$top_deals.view_type" ] },
                                then: "$top_deals.horisontal_view",
                                else: 
                                     "$top_deals"   
                                }
                            }
                        }
                     }
                }
            }
        
        }
    }
    ,{"$unwind":"$item"}
    ,{ $replaceRoot: { newRoot:"$item"}}
    , {
        $match: { 
           "_id": mongoose.Types.ObjectId(req.params.itemId)
        }
      }
      
    ])
    .exec((err, result) => {
        if (err) throw res.status(400).json({message: error});
        res.status(200).json(result)
    });

})

//DeleteItem
router.delete('/delete/:itemId',verify,async(req,res)=>{


    //Cek Top Deal ID
    const {error} = isHex(req.params.topdealId)
    if(error) {
        return res.status(400).send("Top Deal id Salah");
    }
     //Cek Item ID
    const {error_item} = isHex(req.params.itemId)
    if(error_item) {
        return res.status(400).send("Item id Salah");
    }

   
    


    //Check Top Deal id is exist
    const TopDealsExist = await Category.findOne(  
        { $and:[
            {"slug" :req.params.slugCategory},
            {"top_deals" : {"$elemMatch": {"_id":mongoose.Types.ObjectId(req.params.topdealId )}}},
            {
                $or:[
                        {'top_deals.move_banner':{"$elemMatch":{ "_id" : mongoose.Types.ObjectId(req.params.itemId)}}},
                        {'top_deals.grid_view':{"$elemMatch":{ "_id" : mongoose.Types.ObjectId(req.params.itemId)}}},
                        {'top_deals.horisontal_view':{"$elemMatch":{ "_id" : mongoose.Types.ObjectId(req.params.itemId)}}}
                ]
            }
        ]
        },
            {new: true},
        { array: 1 }
    );
    if(!TopDealsExist) return res.status(400).send('Top Deals atau item ID tidak ditemukan');


    var cursor = await Category.aggregate([ {"$unwind":"$top_deals"}, 
    {
        $match: { 
            slug : req.params.slugCategory,
            "top_deals._id": mongoose.Types.ObjectId(req.params.topdealId)
        }
      },
      {$project : {
        item_view : "$top_deals.view_type"
        
        }
    } ]);
    
    var  itemviewId = cursor.map(function (doc) { return doc.item_view; });


   

    try {

        var deleteItem = {}

        if(itemviewId == 0){
        
            await Category.aggregate([ {"$unwind":"$top_deals"}, 
            {
                $match: { 
                    slug : req.params.slugCategory,
                    "top_deals._id": mongoose.Types.ObjectId(req.params.topdealId)
                }
              },
              {$project : {
                item : "$top_deals.move_banner"
                }
            }
            ,{"$unwind":"$item"}
            ,{ $replaceRoot: { newRoot:"$item"}}
            , {
                $match: { 
                   "_id": mongoose.Types.ObjectId(req.params.itemId)
                }
              }
              
            ])
            .exec(async(err, result) => {
                if (err) throw res.status(400).json({message: error});
                    if(result[0].banner!=""){
                        fs.unlinkSync('./public/'+result[0].banner)
                    }
                    deleteItem = await  Category.updateOne(
                        {
                            
                            slug : req.params.slugCategory,
                            "top_deals._id" : mongoose.Types.ObjectId(req.params.topdealId)
                            
                        },
                        { $pull: { 'top_deals.$.move_banner': { "_id" : mongoose.Types.ObjectId(req.params.itemId)}  } }
                        ,{ multi: true })
                    res.status(200).json(deleteItem)
            });

           
                
        }else if(itemviewId == 2){
            deleteItem = await  Category.updateOne(
                {
                    
                    slug : req.params.slugCategory,
                    "top_deals._id" : mongoose.Types.ObjectId(req.params.topdealId)
                    
                },
                { $pull: { 'top_deals.$.grid_view': { "_id" : mongoose.Types.ObjectId(req.params.itemId)}  } }
                ,{ multi: true })
                res.status(200).json(deleteItem)

        }else if(itemviewId == 3){
            deleteItem = await  Category.updateOne(
                {
                    
                    slug : req.params.slugCategory,
                    "top_deals._id" : mongoose.Types.ObjectId(req.params.topdealId)
                    
                },
                { $pull: { 'top_deals.$.horisontal_view': { "_id" : mongoose.Types.ObjectId(req.params.itemId)}  } }
                ,{ multi: true })
                res.status(200).json(deleteItem)
        }else{
            res.status(400).json("Input View Type Salah")
        }
       
     
        


    } catch (error) {
        res.status(400).json({message: error})
    }

  
})

//Update a item
router.patch('/update/:itemId',upload.any(),verify,async(req,res)=>{

  
    //Cek Top Deal ID
    const {error} = isHex(req.params.topdealId)
    if(error) {
        return res.status(400).send("Top Deal id Salah");
    }
     //Cek Item ID
    const {error_item} = isHex(req.params.itemId)
    if(error_item) {
        return res.status(400).send("Item id Salah");
    }

   
    
     //Check id is exist
    await Category.aggregate([
        {"$unwind":"$Items"}, 
        {"$match":{
            slug : req.params.slugCategory,
            "Items._id" : mongoose.Types.ObjectId(req.params.itemId)}},
        { $replaceRoot: { newRoot:"$Items"}}
    ])
    .exec((err, result) => {
        if (err) throw res.status(400).json("Id tidak diketahui");
    });


    //Check Top Deal id is exist
    const TopDealsExist = await Category.findOne(  
        { $and:[
            {"slug" :req.params.slugCategory},
            {"top_deals" : {"$elemMatch": {"_id":mongoose.Types.ObjectId(req.params.topdealId )}}},
            {
                $or:[
                        {'top_deals.move_banner':{"$elemMatch":{ "_id" : mongoose.Types.ObjectId(req.params.itemId)}}},
                        {'top_deals.grid_view':{"$elemMatch":{ "_id" : mongoose.Types.ObjectId(req.params.itemId)}}},
                        {'top_deals.horisontal_view':{"$elemMatch":{ "_id" : mongoose.Types.ObjectId(req.params.itemId)}}}
                ]
            }
        ]
        },
            {new: true},
        { array: 1 }
    );
    if(!TopDealsExist) return res.status(400).send('Top Deals atau item ID tidak ditemukan');



    var cursor = await Category.aggregate([ {"$unwind":"$top_deals"}, 
    {
        $match: { 
            slug : req.params.slugCategory,
            "top_deals._id": mongoose.Types.ObjectId(req.params.topdealId)
        }
      },
      {$project : {
        item_view : "$top_deals.view_type"
        
        }
    } ]);
    
    var  itemviewId = cursor.map(function (doc) { return doc.item_view; });


   
    try {

        var Item ={}
   

        if(itemviewId == 0){
            if(req.files[0]!=undefined){
                Item= new MoveBanner({
                    banner:  "assets/uploads/item/"+req.files[0].filename,
                    banner_background: req.body.banner_background
                })

                await Category.aggregate([ {"$unwind":"$top_deals"}, 
                {
                    $match: { 
                        slug : req.params.slugCategory,
                        "top_deals._id": mongoose.Types.ObjectId(req.params.topdealId)
                    }
                },
                {$project : {
                    item : "$top_deals.move_banner"
                    }
                }
                ,{"$unwind":"$item"}
                ,{ $replaceRoot: { newRoot:"$item"}}
                , {
                    $match: { 
                    "_id": mongoose.Types.ObjectId(req.params.itemId)
                    }
                }
                
                ])
                .exec(async(err, result) => {
                    if (err) throw res.status(400).json({message: error});
                        if(result[0].banner!=""){
                            fs.unlinkSync('./public/'+result[0].banner)
                        }
                        const updateItem =  await  Category.updateOne(
                            {
                            "slug" :req.params.slugCategory
                                
                            }
                            ,{ $set:  {'top_deals.$[i].move_banner.$[j]': Item }}
                            , {arrayFilters: [{"i._id": mongoose.Types.ObjectId(req.params.topdealId )}, {"j._id":  mongoose.Types.ObjectId(req.params.itemId)}]} 
                        ).exec()
                            res.status(200).json(updateItem)
                })
            }else{

                await Category.aggregate([ {"$unwind":"$top_deals"}, 
                {
                    $match: { 
                        slug : req.params.slugCategory,
                        "top_deals._id": mongoose.Types.ObjectId(req.params.topdealId)
                    }
                },
                {$project : {
                    item : "$top_deals.move_banner"
                    }
                }
                ,{"$unwind":"$item"}
                ,{ $replaceRoot: { newRoot:"$item"}}
                , {
                    $match: { 
                    "_id": mongoose.Types.ObjectId(req.params.itemId)
                    }
                }
                
                ])
                .exec(async(err, result) => {
                    if (err) throw res.status(400).json({message: error});
                     
                        const updateItem =  await  Category.updateOne(
                            {
                            "slug" :req.params.slugCategory
                                
                            }
                            ,{ $set:  {'top_deals.$[i].move_banner.$[j].banner_background': req.body.banner_background }}
                            , {arrayFilters: [{"i._id": mongoose.Types.ObjectId(req.params.topdealId )}, {"j._id":  mongoose.Types.ObjectId(req.params.itemId)}]} 
                        ).exec()
                            res.status(200).json(updateItem)
                })
            }
                
           
        }else if(itemviewId == 2){
            Item= new GridView({
                product_ID: req.body.product_ID
            })

            const updateItem =  await  Category.updateOne(
                {
                   "slug" :req.params.slugCategory
                      
                }
                ,{ $set:  {'top_deals.$[i].grid_view.$[j]': Item }}
                , {arrayFilters: [{"i._id": mongoose.Types.ObjectId(req.params.topdealId )}, {"j._id":  mongoose.Types.ObjectId(req.params.itemId)}]} 
               ).exec()

          
                res.status(200).json(updateItem)
        }else if(itemviewId == 3){
            Item= new HorisontalView({
                product_ID: req.body.product_ID
            })


            const updateItem =  await  Category.updateOne(
                {
                   "slug" :req.params.slugCategory
                      
                }
                ,{ $set:  {'top_deals.$[i].horisontal_view.$[j]': Item }}
                , {arrayFilters: [{"i._id": mongoose.Types.ObjectId(req.params.topdealId )}, {"j._id":  mongoose.Types.ObjectId(req.params.itemId)}]} 
               ).exec()

           
                res.status(200).json(updateItem)
        }else{
            res.status(400).json("Item tidak bisa diupdate")
        }
      
    } catch (error) {
        res.status(400).json({message: error})
    }

    
})


module.exports = router