const router = require('express').Router({mergeParams: true})
const crypto = require('crypto')
const verify = require('../../User/verifytoken')


const mongoose = require('mongoose');

const Notification = require('../../../model/User/item/Notification')

const {admin} = require('../../../connection')

const User = require('../../../model/User/User')

const {isHex} = require('../../../validation')



const fs = require('fs')

const multer = require("multer")
const storage = multer.diskStorage({
    destination: function (req,file,cb) {
        cb(null,"./public/assets/uploads/notifications/")
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



//GET ALL Cart
router.get('/',verify,async(req,res)=>{

    try {
        //All Cart

        await  User.updateMany({
            _id : mongoose.Types.ObjectId(req.params.userId)
              }, { $set: { 'my_notifications.$[].readed': true }},
              { "multi": true })
              .exec(async(err, result) => {
                    if (err) throw res.status(400).json({message: err});
                   
                   await User.aggregate([
                    {"$unwind":"$my_notifications"}, 
                    {
                        $match: { _id : mongoose.Types.ObjectId(req.params.userId) }
                      },
                     
                    { $replaceRoot: { newRoot: { $mergeObjects: [ { user_id: "$_id"},"$my_notifications" ] }}},
                     { 
                            "$group": {
                                _id : "$user_id",
                                user_id: { "$first": "$user_id" },
                                carts: { $push: "$$ROOT"},
                            }
                        },
                        
                        { $project: {  _id: 0} }
        
        
                ])
                .exec((err, result) => {
                    if (err) throw res.status(400).json({message: err});
                    res.status(200).json(result)
                });
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
            {"$unwind":"$my_notifications"}, 
            { $match: { $and: [ { _id : mongoose.Types.ObjectId(req.params.userId) }
                , { "my_notifications.readed" : false } ] } },
            
            { $replaceRoot: { newRoot:"$my_notifications"}},
            { $project: {   date:0} },
            
            {
                $group: {
                   _id: null,
                   count: { $sum: 1 }
                }
              }
            
        ])
        .exec((err, result) => {
            if (err) throw res.status(400).json({message: err});
            console.log(result)
            
            if(typeof result !== 'undefined' && result.length > 0){
                res.status(200).json(result[0].count)
            }else{
                res.status(200).json(0)
            }
            
        });
        // res.status(200).json(topdeals[0].top_deals)
   
    } catch (error) {
        res.status(400).json({message: error})
    }

})


//SUBMITS A Notification
router.post('/create',upload.fields([
    {
    name: 'icon'
  }])
  ,verify,async(req,res)=>{

    var id = crypto.randomBytes(16).toString('hex');

    var  notification= new Notification({
        id_pesan:id,
        title: req.body.title,
        body: req.body.body,
        icon: "assets/uploads/notifications/"+req.files.icon[0].filename,
        readed: false,
      
        })

        var payload = {
            notification:{
                title:notification.title,
                body: notification.body
            }
        }

        var options = {
            priority:"high",
            timeToLive: 60*60*24
        }

        try {
            
            try {
                const addNotification =  await User.updateMany(
                {},
                { $push: { my_notifications: notification } }
                ,
                {upsert:false,
                multi:true}
            ).find({}) .exec(async(err, result) => {
                if (err) throw res.status(400).json({message: err})
    
                result.forEach(async function(notif) {
                    admin.messaging().sendToDevice(notif.token_fb, payload, options)
                    .then(function(response) {
                      console.log("Successfully sent message:", response);
                    })
                    .catch(function(error) {
                      console.log("Error sending message:", error);
                    });
                  
                })
                
            });

           
          
          

                res.status(200).json(addNotification)
            } catch (error) {
                res.status(400).json({message: error})
            }
        } catch (error) {
            res.status(400).json({message: error})
        }


    

   
})


router.post('/create/:userIdNotif',upload.fields([
    {
    name: 'icon'
  }])
  ,verify,async(req,res)=>{

    var id = crypto.randomBytes(16).toString('hex');

    var  notification= new Notification({
        id_pesan:id,
        title: req.body.title,
        body: req.body.body,
        icon: "assets/uploads/notifications/"+req.files.icon[0].filename,
        readed: false,
      
        })

        var payload = {
            notification:{
                title:notification.title,
                body: notification.body
            }
        }

        var options = {
            priority:"high",
            timeToLive: 60*60*24
        }

        try {
            
            try {
                const addNotification =  await User.updateOne(
                { 
                    _id:mongoose.Types.ObjectId(req.params.userIdNotif)
                },
                { $push: { my_notifications: notification } }
                ,
                {upsert:false,
                multi:true}
            ).find({ _id:mongoose.Types.ObjectId(req.params.userIdNotif)}) .exec(async(err, result) => {
                if (err) throw res.status(400).json({message: err})
    
                result.forEach(async function(notif) {
                    admin.messaging().sendToDevice(notif.token_fb, payload, options)
                    .then(function(response) {
                      console.log("Successfully sent message:", response);
                    })
                    .catch(function(error) {
                      console.log("Error sending message:", error);
                    });
                  
                })
                
            });;

                res.status(200).json(addNotification)
            } catch (error) {
                res.status(400).json({message: error})
            }
        } catch (error) {
            res.status(400).json({message: error})
        }


    

   
})
// //SUBMITS A Cart
// router.post('/create/:productId',verify,async(req,res)=>{


//     const {error} = isHex(req.params.productId)
//     if(error) return res.status(400).send("Product id Salah");

//     //Check id is exist
//     try {
//         // Wishlist

//         await User.aggregate([
//             {"$unwind":"$my_carts"}, 
//             {
//                 $match: { 
//                     _id : mongoose.Types.ObjectId(req.params.userId),
//                     "my_carts.product_ID" : req.params.productId,
//                 }
//               },
//             { $replaceRoot: { newRoot:"$my_carts"}},
//         ])
//         .exec(async(err, result) => {
//             if (err) throw res.status(400).json({message: err});
//             if(result.length!=0){             
//                 res.status(200).json("Barang Sudah di Keranjang")
                
//             }else{

//                 var  cart= new Cart({
//                     product_ID: req.params.productId,
//                     jumlah: 1
//                     })
            
            
            
//                 try {
//                     const addCart =  await User.findOneAndUpdate(
//                         {
//                              _id : req.params.userId 
//                         },
//                         { $push: { my_carts: cart } }
//                         ,
//                         { upsert: true, new: true }
//                     );
//                     res.status(200).json(addCart)
//                 } catch (error) {
//                     res.status(400).json({message: error})
//                 }

              
//             }
//         });
       
//     } catch (error) {
//         res.status(400).json({message: error})
//     }

   

   
// })

// //SPECIFIC Cart
// router.get('/:cartId', verify,async(req,res)=>{

//     const {error} = isHex(req.params.cartId)
//     if(error) {
//         return res.status(400).send("Cart id Salah");
//     }



//     try {
//         //= Cart

//         await User.aggregate([
//             {"$unwind":"$my_carts"}, 
//             {
//                 $match: { 
//                     _id : mongoose.Types.ObjectId(req.params.userId),
//                     "my_carts._id" : mongoose.Types.ObjectId(req.params.cartId),
//                 }
//               },
//             { $replaceRoot: { newRoot:"$my_carts"}},
//             { $project: {   date:0} },
//             {
//                 $lookup:
//                     {
//                         from: "products",
//                         let: { product_ID: "$product_ID"},
//                         pipeline: [
//                             { $match:
//                                { 
//                                     $expr:
//                                        { $eq: [ "$incharge",  "$$product_ID" ] }
                                
//                                }
//                             },
//                             { $project: {  title_product: 1,image : {'$arrayElemAt': ['$image.path', 0] },price:1,cutted_price:1,satuan:1 } }
//                         ],
//                         as: "product"
//                     }
//             },
//             { $project: {  product_ID: 0} },
//             { 
//                 "$group": {
//                     _id : "$_id",
//                     product_ID:{ "$first": {'$arrayElemAt': ['$product._id', 0] } },
//                     title_product: { "$first": {'$arrayElemAt': ['$product.title_product', 0] }},
//                     price: { "$first":  {'$arrayElemAt': ["$product.price", 0] } },
//                     cutted_price: { "$first": {'$arrayElemAt': ["$product.cutted_price", 0] }  },
//                     satuan: { "$first": {'$arrayElemAt': ["$product.satuan", 0] }  },
//                     image: { "$first": {'$arrayElemAt': ["$product.image", 0] } },
//                 }
//             }
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

// //DeleteCart
router.delete('/deleteAllbyIdPesan/:notificationId',verify,async(req,res,next)=>{


    const {error} = isHex(req.params.notificationId)
    if(error) return res.status(400).send("Notification id Salah");

   
    try {
       
        

           //Check id is exist
        await User.aggregate([
            {"$unwind":"$my_notifications"}, 
            {"$match":
                {
                    "my_notifications.id_pesan" :  req.params.notificationId 
                },
            }
            ,{ $replaceRoot: { newRoot:{ $mergeObjects: [ { user_id: "$_id"},"$my_notifications" ] }}}
        ])
        .exec(async(err, result) => {
            if (err) throw res.status(400).json({message: err})

            result.forEach(async function(notif) {
                fs.unlinkSync('./public/'+notif.icon)
                 await  User.updateOne(
                    {
                        _id:  mongoose.Types.ObjectId(notif.user_id),
                        "my_notifications.id_pesan" :  req.params.notificationId
                     }
                    ,{ $pull: { "my_notifications": { _id : mongoose.Types.ObjectId(notif._id)}  } }
                    ) 
            
            })
            res.status(200).json("Deleted Sukses")
        });
   
    } catch (error) {
        res.status(400).json({message: error})
    }

    

  
 })

 router.delete('/delete/:notificationId',verify,async(req,res,next)=>{


    const {error} = isHex(req.params.notificationId)
    if(error) return res.status(400).send("Notification id Salah");

   
    try {
       
        

           //Check id is exist
           await  User.updateOne(
            {
                _id:  mongoose.Types.ObjectId(req.params.userId )
             }
            ,{ $pull: { "my_notifications": { _id : mongoose.Types.ObjectId(req.params.notificationId)}  } }
            ) 
        .exec(async(err, result) => {
            if (err) throw res.status(400).json({message: err})

            
            res.status(200).json(result)
        });
   
    } catch (error) {
        res.status(400).json({message: error})
    }

    

  
 })

// //Update a cart
// router.patch('/update/:productId',verify,async(req,res)=>{

//     const {error} = isHex(req.params.productId)
//     if(error) return res.status(400).send("Product id Salah");

//      //Check id is exist
//      const CartExist = await User.findOne(  
//         { 
//             _id : req.params.userId,
//             "my_carts.product_ID" : req.params.productId},
//         { array: 1 }
//     );
//     if(!CartExist) return res.status(400).send('Cart Id tidak ditemukan');




//      //Check id is exist
//     await User.aggregate([
//         {"$unwind":"$my_carts"}, 
//         {"$match":{
//             _id : req.params.userId,
//             "my_carts.product_ID" : req.params.productId },
//         },
//         { $replaceRoot: { newRoot:"$my_carts"}}
//     ])
//     .exec(async(err, result) => {
//         if (err) throw res.status(400).json("Cart tidak ada");
        
//     });

  

//     try {



//           await  User.updateOne({
//             _id : req.params.userId,
//             "my_carts.product_ID" : req.params.productId 
//               }, { $set: { 'my_carts.$.jumlah': req.body.jumlah }})
//               .exec();
//         try{
//               await User.aggregate([
//                 {"$unwind":"$my_carts"}, 
//                 {
//                     $match: { _id : mongoose.Types.ObjectId(req.params.userId) }
//                   },
                 
//                 { $replaceRoot: { newRoot: { $mergeObjects: [ { user_id: "$_id"},"$my_carts" ] }}},
//                 { $project: {   date:0} },
//                 {
//                     $lookup:
//                         {
//                             from: "products",
//                             let: { product_ID: "$product_ID"},
//                             pipeline: [
//                                 { $match:
//                                    { 
//                                         $expr:
//                                            { $eq: [ "$incharge",  "$$product_ID" ] }
                                    
//                                    }
//                                 },
//                                 { $project: {  title_product: 1,image : {'$arrayElemAt': ['$image.path', 0] },price:1,cutted_price:1,satuan:1,berat:1 } }
//                             ],
//                             as: "product"
//                         }
//                 },
//                 { $project: {  product_ID: 0} },
//                     { 
//                         "$group": {
//                             _id : "$user_id",
//                             user_id: { "$first": "$user_id" },
//                             carts: { $push: "$$ROOT"},
//                         }
//                     },
//                     {
//                         "$addFields": {
//                             "carts":   { $cond : [ { $eq : [ "$carts", [] ] },"$$REMOVE", 
//                              {
//                               "$map": {
//                                 "input": "$carts",
//                                 "as": "c",
//                                 "in": {
//                                     "_id": '$$c._id',
//                                     "product_ID": {'$arrayElemAt': ['$$c.product._id', 0] } ,
//                                     "jumlah": '$$c.product.jumlah',
//                                     "title_product": {'$arrayElemAt': ['$$c.product.title_product', 0] },
//                                     "price":  {'$arrayElemAt': ["$$c.product.price", 0] } ,
//                                     "cutted_price":  {'$arrayElemAt': ["$$c.product.cutted_price", 0] }  ,
//                                     "satuan":  {'$arrayElemAt': ["$$c.product.satuan", 0] },
//                                     "berat":  {'$arrayElemAt': ["$$c.product.berat", 0] },
//                                     "image":  {'$arrayElemAt': ["$$c.product.image", 0] } ,
                                
//                                 }
//                               }
//                             } ]}
//                         }
//                     },
//                     { $project: {  _id: 0} }
    
    
//             ])
//             .exec((err, result) => {
//                 if (err) throw res.status(400).json({message: err});
//                 res.status(200).json(result)
//             });
//             //res.status(200).json(topdeals[0].top_deals)
       
//         } catch (error) {
//             res.status(400).json({message: error})
//         }
//            // res.status(200).json(updateCart)
        
//     } catch (error) {
//         res.status(400).json({message: error})
//     }

   
    
// })

//get count cart



module.exports = router