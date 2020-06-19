const router = require('express').Router({mergeParams: true})
const verify = require('../../User/verifytoken')


const mongoose = require('mongoose');

const Cart = require('../../../model/User/item/Cart')


const User = require('../../../model/User/User')

const {isHex} = require('../../../validation')


//GET ALL Cart
router.get('/',verify,async(req,res)=>{

    try {
        //All Cart

        await User.aggregate([
            {"$unwind":"$my_carts"}, 
            {
                $match: { _id : mongoose.Types.ObjectId(req.params.userId) }
              },
             
            { $replaceRoot: { newRoot: { $mergeObjects: [ { user_id: "$_id"},"$my_carts" ] }}},
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
                            { $project: {  title_product: 1,image : {'$arrayElemAt': ['$image', 0] },price:1,in_stock:1,cutted_price:1,satuan:1,average_rating:1,berat:1 } }
                        ],
                        as: "product"
                    }
            },
            { $project: {  product_ID: 0} },
                { 
                    "$group": {
                        _id : "$user_id",
                        user_id: { "$first": "$user_id" },
                        carts: { $push: "$$ROOT"},
                    }
                },
                {
                    "$addFields": {
                        "carts":   { $cond : [ { $eq : [ "$carts", [] ] },"$$REMOVE", 
                         {
                          "$map": {
                            "input": "$carts",
                            "as": "c",
                            "in": {
                                "_id": '$$c._id',
                                "product_ID": {'$arrayElemAt': ['$$c.product._id', 0] } ,
                                "in_stock": {'$arrayElemAt': ['$$c.product.in_stock', 0] } ,
                                "jumlah": '$$c.jumlah' ,
                                "title_product": {'$arrayElemAt': ['$$c.product.title_product', 0] },
                                "price":  {'$arrayElemAt': ["$$c.product.price", 0] } ,
                                "cutted_price":  {'$arrayElemAt': ["$$c.product.cutted_price", 0] }  ,
                                "satuan":  {'$arrayElemAt': ["$$c.product.satuan", 0] },
                                "berat":  {'$arrayElemAt': ["$$c.product.berat", 0] },
                                "average_rating":  {'$arrayElemAt': ["$$c.product.average_rating", 0] },
                                "image":  {'$arrayElemAt': ["$$c.product.image", 0] } ,
                            
                            }
                          }
                        } ]}
                    }
                },
                { $project: {  _id: 0} }


        ])
        .exec((err, result) => {
            if (err) throw res.status(400).json({message: err});
            res.status(200).json(result[0])
        });
        //res.status(200).json(topdeals[0].top_deals)
   
    } catch (error) {
        res.status(400).json({message: error})
    }

})


//GET count
router.get('/count',verify,async(req,res)=>{

    try {
        //All Cart

        await User.aggregate([
            {"$unwind":"$my_carts"}, 
            {
                $match: { _id : mongoose.Types.ObjectId(req.params.userId) }
              },
            { $replaceRoot: { newRoot:"$my_carts"}},
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
                            { $project: {  title_product: 1,image : {'$arrayElemAt': ['$image', 0] },price:1,cutted_price:1,satuan:1 } }
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


//SUBMITS A Cart
router.post('/create',verify,async(req,res)=>{



    var  cart= new Cart({
        product_ID: req.body.product_ID,
        jumlah: req.body.jumlah
        })



    try {
        const addCart =  await User.findOneAndUpdate(
            {
                 _id : req.params.userId 
            },
            { $push: { my_carts: cart } }
            ,
            { upsert: true, new: true }
        );
        res.status(200).json(addCart)
    } catch (error) {
        res.status(400).json({message: error})
    }

   
})

//SUBMITS A Cart
router.post('/create/:productId',verify,async(req,res)=>{


    const {error} = isHex(req.params.productId)
    if(error) return res.status(400).send("Product id Salah");

    //Check id is exist
    try {
        // Wishlist

        await User.aggregate([
            {"$unwind":"$my_carts"}, 
            {
                $match: { 
                    _id : mongoose.Types.ObjectId(req.params.userId),
                    "my_carts.product_ID" : req.params.productId,
                }
              },
            { $replaceRoot: { newRoot:"$my_carts"}},
        ])
        .exec(async(err, result) => {
            if (err) throw res.status(400).json({message: err});
            if(result.length!=0){             
                res.status(200).json("Barang Sudah di Keranjang")
                
            }else{

                var  cart= new Cart({
                    product_ID: req.params.productId,
                    jumlah: 1
                    })
            
            
            
                try {
                    const addCart =  await User.findOneAndUpdate(
                        {
                             _id : req.params.userId 
                        },
                        { $push: { my_carts: cart } }
                        ,
                        { upsert: true, new: true }
                    );
                    res.status(200).json(addCart)
                } catch (error) {
                    res.status(400).json({message: error})
                }

              
            }
        });
       
    } catch (error) {
        res.status(400).json({message: error})
    }

   

   
})

//SPECIFIC Cart
router.get('/:cartId', verify,async(req,res)=>{

    const {error} = isHex(req.params.cartId)
    if(error) {
        return res.status(400).send("Cart id Salah");
    }



    try {
        //= Cart

        await User.aggregate([
            {"$unwind":"$my_carts"}, 
            {
                $match: { 
                    _id : mongoose.Types.ObjectId(req.params.userId),
                    "my_carts._id" : mongoose.Types.ObjectId(req.params.cartId),
                }
              },
            { $replaceRoot: { newRoot:"$my_carts"}},
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
                            { $project: {  title_product: 1,image : {'$arrayElemAt': ['$image', 0] },in_stock:1,price:1,cutted_price:1,satuan:1 } }
                        ],
                        as: "product"
                    }
            },
            { $project: {  product_ID: 0} },
            { 
                "$group": {
                    _id : "$_id",
                    product_ID:{ "$first": {'$arrayElemAt': ['$product._id', 0] } },
                    in_stock: { "$first": {'$arrayElemAt': ['$product.in_stock', 0] } },
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
        //res.status(200).json(topdeals[0].top_deals)
   
    } catch (error) {
        res.status(400).json({message: error})
    }

 

})

// //DeleteCart
router.delete('/delete/:cartId',verify,async(req,res,next)=>{


    const {error} = isHex(req.params.cartId)
    if(error) return res.status(400).send("Cart id Salah");

    //Check id is exist
    const CartExist = await User.findOne(  
        { 
            _id : req.params.userId,
            "my_carts._id" : mongoose.Types.ObjectId(req.params.cartId )},
            {new: true},
        { array: 1 }
    );
    if(!CartExist) return res.status(400).send('Cart tidak ditemukan');
   
    try {
       
        const deleteCart = await  User.updateOne(
        {
            _id : req.params.userId
        },
        { $pull: { my_carts: {  _id: mongoose.Types.ObjectId(req.params.cartId)}  } }
        ,{ multi: true })

        res.status(200).json(deleteCart)
    
   
    } catch (error) {
        res.status(400).json({message: error})
    }

    

  
 })

//Update a cart
router.patch('/update/:productId',verify,async(req,res)=>{

    const {error} = isHex(req.params.productId)
    if(error) return res.status(400).send("Product id Salah");

     //Check id is exist
     const CartExist = await User.findOne(  
        { 
            _id : req.params.userId,
            "my_carts.product_ID" : req.params.productId},
        { array: 1 }
    );
    if(!CartExist) return res.status(400).send('Cart Id tidak ditemukan');




     //Check id is exist
    await User.aggregate([
        {"$unwind":"$my_carts"}, 
        {"$match":{
            _id : req.params.userId,
            "my_carts.product_ID" : req.params.productId },
        },
        { $replaceRoot: { newRoot:"$my_carts"}}
    ])
    .exec(async(err, result) => {
        if (err) throw res.status(400).json("Cart tidak ada");
        
    });

  

    try {



          await  User.updateOne({
            _id : req.params.userId,
            "my_carts.product_ID" : req.params.productId 
              }, { $set: { 'my_carts.$.jumlah': req.body.jumlah }})
              .exec();
        try{
              await User.aggregate([
                {"$unwind":"$my_carts"}, 
                {
                    $match: { _id : mongoose.Types.ObjectId(req.params.userId) }
                  },
                 
                { $replaceRoot: { newRoot: { $mergeObjects: [ { user_id: "$_id"},"$my_carts" ] }}},
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
                                { $project: {  title_product: 1,image : {'$arrayElemAt': ['$image', 0] },in_stock:1,price:1,cutted_price:1,satuan:1,berat:1 } }
                            ],
                            as: "product"
                        }
                },
                { $project: {  product_ID: 0} },
                    { 
                        "$group": {
                            _id : "$user_id",
                            user_id: { "$first": "$user_id" },
                            carts: { $push: "$$ROOT"},
                        }
                    },
                    {
                        "$addFields": {
                            "carts":   { $cond : [ { $eq : [ "$carts", [] ] },"$$REMOVE", 
                             {
                              "$map": {
                                "input": "$carts",
                                "as": "c",
                                "in": {
                                    "_id": '$$c._id',
                                    "product_ID": {'$arrayElemAt': ['$$c.product._id', 0] } ,
                                    "in_stock":{'$arrayElemAt': ['$$c.product.in_stock', 0] },
                                    "jumlah": '$$c.product.jumlah',
                                    "title_product": {'$arrayElemAt': ['$$c.product.title_product', 0] },
                                    "price":  {'$arrayElemAt': ["$$c.product.price", 0] } ,
                                    "cutted_price":  {'$arrayElemAt': ["$$c.product.cutted_price", 0] }  ,
                                    "satuan":  {'$arrayElemAt': ["$$c.product.satuan", 0] },
                                    "berat":  {'$arrayElemAt': ["$$c.product.berat", 0] },
                                    "image":  {'$arrayElemAt': ["$$c.product.image", 0] } ,
                                
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
           // res.status(200).json(updateCart)
        
    } catch (error) {
        res.status(400).json({message: error})
    }

   
    
})

//get count cart



module.exports = router