const router = require('express').Router({mergeParams: true})
const verify = require('../../User/verifytoken')


const mongoose = require('mongoose');

const Wishlist = require('../../../model/User/item/Wishlist')


const User = require('../../../model/User/User')

const {isHex} = require('../../../validation')



//GET ALL Wishlist
router.get('/',verify,async(req,res)=>{

    try {
        //All Wishlist

        await User.aggregate([
            {"$unwind":"$my_wishlists"}, 
            {
                $match: { _id : mongoose.Types.ObjectId(req.params.userId) }
              },
            { $replaceRoot: { newRoot: { $mergeObjects: [ { user_id: "$_id"},"$my_wishlists" ] }}},
            { $project: {   date:0} },
            {
                $lookup:
                    {
                        from: "products",
                        let: { product_ID: "$product_ID"},
                        pipeline: [
                            { $match:
                               { 
                                    $expr:
                                       { $eq: [ "$incharge",  "$$product_ID" ] }
                                
                               }
                            },
                            { $project: {  title_product: 1,image : {'$arrayElemAt': ['$image.path', 0] },price:1,in_stock:1,cutted_price:1,satuan:1 } }
                        ],
                        as: "product"
                    }
            },
            { $project: {  product_ID: 0} },
            { 
                "$group": {
                    _id : "$user_id",
                    user_id: { "$first": "$user_id" },
                    wishlist: { $push: "$$ROOT"},
                }
            },
            {
                "$addFields": {
                    "wishlist":   { $cond : [ { $eq : [ "$wishlist", [] ] },"$$REMOVE", 
                     {
                      "$map": {
                        "input": "$wishlist",
                        "as": "w",
                        "in": {
                            "_id": '$$w._id',
                            "product_ID": {'$arrayElemAt': ['$$w.product._id', 0] } ,
                            "in_stock": {'$arrayElemAt': ['$$c.product.in_stock', 0] } ,
                            "title_product": {'$arrayElemAt': ['$$w.product.title_product', 0] },
                            "price":  {'$arrayElemAt': ["$$w.product.price", 0] } ,
                            "cutted_price":  {'$arrayElemAt': ["$$w.product.cutted_price", 0] }  ,
                            "satuan":  {'$arrayElemAt': ["$$w.product.satuan", 0] }  ,
                            "image":  {'$arrayElemAt': ["$$w.product.image", 0] } ,
                        
                        }
                      }
                    } ]}
                }
            },
            { $project: {  _id: 0} }
        ])
        .exec((err, result) => {
            if (err) throw res.status(400).json({message: err});
            res.status(200).json(result)
        });
        //res.status(200).json(topdeals[0].top_deals)
   
    } catch (error) {
        res.status(400).json({message: error})
    }

})


// //GET count
router.get('/count',verify,async(req,res)=>{

    try {
        //All Cart

        await User.aggregate([
            {"$unwind":"$my_wishlists"}, 
            {
                $match: { _id : mongoose.Types.ObjectId(req.params.userId) }
              },
            { $replaceRoot: { newRoot:"$my_wishlists"}},
            { $project: {   date:0} },
            {
                $lookup:
                    {
                        from: "products",
                        let: { product_ID: "$product_ID"},
                        pipeline: [
                            { $match:
                               { 
                                    $expr:
                                       { $eq: [ "$incharge",  "$$product_ID" ] }
                                
                               }
                            },
                            { $project: {  title_product: 1,image : {'$arrayElemAt': ['$image.path', 0] },price:1,cutted_price:1,satuan:1 } }
                        ],
                        as: "product"
                    }
            },
            { $project: {  product_ID: 0} },
            {
                $group: {
                   _id: null,
                   count: { $sum: 1 }
                }
              }
            
        ])
        .exec((err, result) => {
            if (err) throw res.status(400).json({message: err});
            res.status(200).json(result[0].count)
        });
        //res.status(200).json(topdeals[0].top_deals)
   
    } catch (error) {
        res.status(400).json({message: error})
    }

})


//SUBMITS A Wishlist
router.post('/create',verify,async(req,res)=>{



    var  wishlist= new Wishlist({
        product_ID: req.body.product_ID
        })



    try {
        const addWishlist =  await User.findOneAndUpdate(
            {
                 _id : req.params.userId 
            },
            { $push: { my_wishlists: wishlist } }
            ,
            { upsert: true, new: true }
        );
        res.status(200).json(addWishlist)
    } catch (error) {
        res.status(400).json({message: error})
    }

   
})



// //wish list product 
router.post('/create/:productId',verify,async(req,res,next)=>{


    const {error} = isHex(req.params.productId)
    if(error) return res.status(400).send("Product id Salah");

    //Check id is exist
    try {
        // Wishlist

        await User.aggregate([
            {"$unwind":"$my_wishlists"}, 
            {
                $match: { 
                    _id : mongoose.Types.ObjectId(req.params.userId),
                    "my_wishlists.product_ID" : req.params.productId,
                }
              },
            { $replaceRoot: { newRoot:"$my_wishlists"}},
        ])
        .exec(async(err, result) => {
            if (err) throw res.status(400).json({message: err});
            if(result.length!=0){
                try {
       
                    const deleteWishlist = await  User.updateOne(
                    {
                        _id : req.params.userId
                    },
                    { $pull: { my_wishlists: {  _id: mongoose.Types.ObjectId(result[0]._id)}  } }
                    ,{ multi: true })
            
                    res.status(200).json(deleteWishlist)
                
                
                } catch (error) {
                    res.status(400).json({message: error})
                }
            }else{
                var  wishlist= new Wishlist({
                    product_ID: req.params.productId
                    })
            
            
            
                try {
                    const addWishlist =  await User.findOneAndUpdate(
                        {
                             _id : req.params.userId 
                        },
                        { $push: { my_wishlists: wishlist } }
                        ,
                        { upsert: true, new: true }
                    );
                    res.status(200).json(addWishlist)
                } catch (error) {
                    res.status(400).json({message: error})
                }
            }
        });
       
    } catch (error) {
        res.status(400).json({message: error})
    }
   
  
 })


//SPECIFIC Wishlist
router.get('/:wishlistId', verify,async(req,res)=>{

    const {error} = isHex(req.params.wishlistID)
    if(error) {
        return res.status(400).send("Wishlist id Salah");
    }



    try {
        // Wishlist

        await User.aggregate([
            {"$unwind":"$my_wishlists"}, 
            {
                $match: { 
                    _id : mongoose.Types.ObjectId(req.params.userId),
                    "my_wishlists._id" : mongoose.Types.ObjectId(req.params.wishlistID),
                }
              },
            { $replaceRoot: { newRoot:"$my_wishlists"}},
            { $project: {   date:0} },
            {
                $lookup:
                    {
                        from: "products",
                        let: { product_ID: "$product_ID"},
                        pipeline: [
                            { $match:
                               { 
                                    $expr:
                                       { $eq: [ "$incharge",  "$$product_ID" ] }
                                
                               }
                            },
                            { $project: {  title_product: 1,image : {'$arrayElemAt': ['$image.path', 0] },price:1,cutted_price:1,in_stock:1,satuan:1 } }
                        ],
                        as: "product"
                    }
            },
            { $project: {  product_ID: 0} },
            { 
                "$group": {
                    _id : "$_id",
                    product_ID:{ "$first": {'$arrayElemAt': ['$product._id', 0] } },
                    in_stock: {'$arrayElemAt': ['$$c.product.in_stock', 0] } ,
                    title_product: { "$first": {'$arrayElemAt': ['$product.title_product', 0] }},
                    price: { "$first":  {'$arrayElemAt': ["$product.price", 0] } },
                    cutted_price: { "$first": {'$arrayElemAt': ["$product.cutted_price", 0] }  },
                    satuan: { "$first": {'$arrayElemAt': ["$product.satuan", 0] }  },
                    image: { "$first": {'$arrayElemAt': ["$product.image", 0] } },
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





// //DeleteCart
router.delete('/delete/:wishlistId',verify,async(req,res,next)=>{


    const {error} = isHex(req.params.wishlistId)
    if(error) return res.status(400).send("Wishlist id Salah");

    //Check id is exist
    const WishlistExist = await User.findOne(  
        { 
            _id : req.params.userId,
            "my_wishlists._id" : mongoose.Types.ObjectId(req.params.wishlistId )},
            {new: true},
        { array: 1 }
    );
    if(!WishlistExist) return res.status(400).send('Wishlist tidak ditemukan');
   
    try {
       
        const deleteWishlist = await  User.updateOne(
        {
            _id : req.params.userId
        },
        { $pull: { my_wishlists: {  _id: mongoose.Types.ObjectId(req.params.wishlistId)}  } }
        ,{ multi: true })

        res.status(200).json(deleteWishlist)
    
   
    } catch (error) {
        res.status(400).json({message: error})
    }

    

  
 })




//Update a cart
router.patch('/update/:wishlistId',verify,async(req,res)=>{

    const {error} = isHex(req.params.wishlistId)
    if(error) return res.status(400).send("Wishlist id Salah");

     //Check id is exist
     const WishlistExist = await User.findOne(  
        { 
            _id : req.params.userId,
            "my_wishlists._id" : mongoose.Types.ObjectId(req.params.wishlistId )},
        { array: 1 }
    );
    if(!WishlistExist) return res.status(400).send('Address Id tidak ditemukan');



     //Check id is exist
    await User.aggregate([
        {"$unwind":"$my_wishlists"}, 
        {"$match":{
            _id : req.params.userId,
            "my_wishlists._id" : mongoose.Types.ObjectId(req.params.wishlistId )},
        },
        { $replaceRoot: { newRoot:"$my_wishlists"}}
    ])
    .exec(async(err, result) => {
        if (err) throw res.status(400).json("Wishlist Id tidak diketahui");
         
    });

  
    var  wishlist= new Wishlist({
        product_ID: req.body.product_ID
        })


    try {



        const updateWishlist =    await  User.updateOne({
            _id : req.params.userId,
            "my_wishlists._id" : mongoose.Types.ObjectId(req.params.wishlistId )
              }, { $set: { 'my_wishlists.$': wishlist }})
              .exec();
            res.status(200).json(updateWishlist)
        
    } catch (error) {
        res.status(400).json({message: error})
    }

   
    
})



module.exports = router