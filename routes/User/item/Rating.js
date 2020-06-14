const router = require('express').Router({mergeParams: true})
const verify = require('../verifytoken')


const mongoose = require('mongoose');

const Rating = require('../../../model/User/item/Rating')
const Products = require('../../../model/Product/Product')

const User = require('../../../model/User/User')

const {isHex} = require('../../../validation')



//GET ALL Wishlist
router.get('/',verify,async(req,res)=>{

    try {
        //All Wishlist

        await User.aggregate([
            {"$unwind":"$my_ratings"}, 
            {
                $match: { _id : mongoose.Types.ObjectId(req.params.userId) }
              },
            { $replaceRoot: { newRoot:"$my_ratings"}},
            { $project: {   date:0} },
            {
            $group: {
                _id: null,
                count: { $sum: 1 },
                ratings: { $push: "$$ROOT"}
            }
            },
            { $project: {   _id:0} },

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


// // //GET count
// router.get('/count',verify,async(req,res)=>{

//     try {
//         //All Cart

//         await User.aggregate([
//             {"$unwind":"$my_wishlists"}, 
//             {
//                 $match: { _id : mongoose.Types.ObjectId(req.params.userId) }
//               },
//             { $replaceRoot: { newRoot:"$my_wishlists"}},
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
//                 $group: {
//                    _id: null,
//                    count: { $sum: 1 }
//                 }
//               }
            
//         ])
//         .exec((err, result) => {
//             if (err) throw res.status(400).json({message: err});
//             res.status(200).json(result[0].count)
//         });
//         //res.status(200).json(topdeals[0].top_deals)
   
//     } catch (error) {
//         res.status(400).json({message: error})
//     }

// })


//SUBMITS A Rating
router.post('/create/:productId/:rating',verify,async(req,res,next)=>{


    const {error} = isHex(req.params.productId)
    if(error) return res.status(400).send("Product id Salah");

    //Check id is exist
    try {
        // Rating

        await User.aggregate([
            {"$unwind":"$my_ratings"}, 
            {
                $match: { 
                    _id : mongoose.Types.ObjectId(req.params.userId),
                    "my_ratings.product_ID" : req.params.productId,
                }
              },
            { $replaceRoot: { newRoot:"$my_ratings"}},
        ])
        .exec(async(err, result) => {
            if (err) throw res.status(400).json({message: err});
            if(result.length!=0){ 

                var star_before = result[0].rating
               const updateRating = await  User.updateOne({
                    _id : mongoose.Types.ObjectId(req.params.userId),
                    "my_ratings.product_ID" : req.params.productId 
                      }, { $set: { 'my_ratings.$.rating': parseInt(req.params.rating)  }})
                      .exec(async(err, result) => {
                        if(err){
                            console.log("Something wrong when updating data!");
                        };       
                        

                        try {
                            //const product =await Products.findById(req.params.productId)

                            const product =await Products.find(
                            { 
                                _id : mongoose.Types.ObjectId(req.params.productId)
                            },
                            {
                                star_1:1,
                                star_2:1,
                                star_3:1,
                                star_4:1,
                                star_5:1,
                                total_ratings:1
                            }).exec(async(err, result) => {
                                
                                
                                var average_rating 
                                var next_star_name = "star_"+req.params.rating;
                                var star_before_name = "star_"+star_before
                                var next_star
                                if(req.params.rating==1){
                                    if(star_before==1){
                                        average_rating =( 
                                            (1*result[0].star_1)
                                            +(2*result[0]. star_2)
                                            +(3*result[0]. star_3)
                                            +(4*result[0]. star_4)
                                            +(5*result[0]. star_5))/(result[0].total_ratings)
                                            next_star=result[0].star_1
                                            star_before = result[0].star_1
                                    }else if(star_before==2){
                                        average_rating =( 
                                            (1*(result[0].star_1+1)) //tambah satu
                                            +(2*(result[0]. star_2-1))//kurang satu
                                            +(3*result[0]. star_3)
                                            +(4*result[0]. star_4)
                                            +(5*result[0]. star_5))/(result[0].total_ratings)
                                            next_star=result[0].star_1+1
                                            star_before = result[0].star_2-1
                                    }else if(star_before==3){
                                        average_rating =( 
                                            (1*(result[0].star_1+1)) //tambah satu
                                            +(2*result[0]. star_2)
                                            +(3*(result[0]. star_3-1))//kurang satu
                                            +(4*result[0]. star_4)
                                            +(5*result[0]. star_5))/(result[0].total_ratings)
                                            next_star=result[0].star_1+1
                                            star_before = result[0].star_3-1
                                    }else if(star_before==4){
                                        average_rating =( 
                                            (1*(result[0].star_1+1)) //tambah satu
                                            +(2*result[0]. star_2)
                                            +(3*result[0]. star_3)
                                            +(4*(result[0]. star_4-1))//kurang satu
                                            +(5*result[0]. star_5))/(result[0].total_ratings)
                                            next_star=result[0].star_1+1
                                            star_before = result[0].star_4-1
                                    }else if(star_before==5){
                                        average_rating =( 
                                            (1*(result[0].star_1+1)) //tambah satu
                                            +(2*result[0]. star_2)
                                            +(3*result[0]. star_3)
                                            +(4*result[0]. star_4)
                                            +(5*(result[0]. star_5-1)))/(result[0].total_ratings)//kurang satu
                                            next_star=result[0].star_1+1
                                            star_before = result[0].star_5-1
                                    }
                               
                               
                                }else if(req.params.rating==2){
                                    if(star_before==1){
                                        average_rating =( 
                                            (1*(result[0].star_1-1))//kurang satu
                                            +(2*(result[0].star_2+1))//tambah satu
                                            +(3*result[0]. star_3)
                                            +(4*result[0]. star_4)
                                            +(5*result[0]. star_5))/(result[0].total_ratings)
                                            next_star=result[0].star_2+1
                                            star_before = result[0].star_1-1
                                    }else if(star_before==2){
                                        average_rating =( 
                                            (1*result[0].star_1) 
                                            +(2*result[0].star_2)
                                            +(3*result[0]. star_3)
                                            +(4*result[0]. star_4)
                                            +(5*result[0]. star_5))/(result[0].total_ratings)
                                            next_star=result[0].star_2
                                            star_before = result[0].star_2
                                    }else if(star_before==3){
                                        average_rating =( 
                                            (1*result[0].star_1) 
                                            +(2*(result[0].star_2+1))//tambah satu
                                            +(3*(result[0]. star_3-1))//kurang satu
                                            +(4*result[0]. star_4)
                                            +(5*result[0]. star_5))/(result[0].total_ratings)
                                            next_star=result[0].star_2+1
                                            star_before = result[0].star_3-1
                                    }else if(star_before==4){
                                        average_rating =( 
                                            (1*result[0].star_1) 
                                            +(2*(result[0].star_2+1))//tambah satu
                                            +(3*result[0]. star_3)
                                            +(4*(result[0]. star_4-1))//kurang satu
                                            +(5*result[0]. star_5))/(result[0].total_ratings)
                                            next_star=result[0].star_2+1
                                            star_before = result[0].star_4-1
                                    }else if(star_before==5){
                                        average_rating =( 
                                            (1*result[0].star_1) 
                                            +(2*(result[0].star_2+1))//tambah satu
                                            +(3*result[0]. star_3)
                                            +(4*result[0]. star_4)
                                            +(5*(result[0]. star_5-1)))/(result[0].total_ratings)//kurang satu
                                            next_star=result[0].star_2+1
                                            star_before = result[0].star_5-1
                                    }
                                }else if(req.params.rating==3){
                                    if(star_before==1){
                                        average_rating =( 
                                            (1*(result[0].star_1-1))//kurang satu
                                            +(2*result[0].star_2)
                                            +(3*(result[0]. star_3+1))//tambah satu
                                            +(4*result[0]. star_4)
                                            +(5*result[0]. star_5))/(result[0].total_ratings)
                                            next_star=result[0].star_3+1
                                            star_before = result[0].star_1-1
                                    }else if(star_before==2){
                                        average_rating =( 
                                            (1*result[0].star_1) 
                                            +(2*(result[0].star_2-1))//kurang satu
                                            +(3*(result[0]. star_3+1))//tambah satu
                                            +(4*result[0]. star_4)
                                            +(5*result[0]. star_5))/(result[0].total_ratings)
                                            next_star=result[0].star_3+1
                                            star_before = result[0].star_2-1
                                    }else if(star_before==3){
                                        average_rating =( 
                                            (1*result[0].star_1) 
                                            +(2*result[0].star_2)
                                            +(3*result[0]. star_3)
                                            +(4*result[0]. star_4)
                                            +(5*result[0]. star_5))/(result[0].total_ratings)
                                            next_star=result[0].star_3
                                            star_before = result[0].star_3
                                    }else if(star_before==4){
                                        average_rating =( 
                                            (1*result[0].star_1) 
                                            +(2*result[0].star_2)
                                            +(3*(result[0]. star_3+1))//tambah satu
                                            +(4*(result[0]. star_4-1))//kurang satu
                                            +(5*result[0]. star_5))/(result[0].total_ratings)
                                            next_star=result[0].star_3+1
                                            star_before = result[0].star_4-1
                                    }else if(star_before==5){
                                        average_rating =( 
                                            (1*result[0].star_1) 
                                            +(2*result[0].star_2)
                                            +(3*(result[0]. star_3+1))//tambah satu
                                            +(4*result[0]. star_4)
                                            +(5*(result[0]. star_5-1)))/(result[0].total_ratings)//kurang satu
                                            next_star=result[0].star_3+1
                                            star_before = result[0].star_5-1
                                    }
                                    
                                }else if(req.params.rating==4){
                                    if(star_before==1){
                                        average_rating =( 
                                            (1*(result[0].star_1-1))//kurang satu
                                            +(2*result[0].star_2)
                                            +(3*result[0]. star_3)
                                            +(4*(result[0]. star_4+1))//tambah satu
                                            +(5*result[0]. star_5))/(result[0].total_ratings)
                                            next_star=result[0].star_4+1
                                            star_before = result[0].star_1-1
                                    }else if(star_before==2){
                                        average_rating =( 
                                            (1*result[0].star_1) 
                                            +(2*(result[0].star_2-1))//kurang satu
                                            +(3*result[0]. star_3)
                                            +(4*(result[0]. star_4+1))//tambah satu
                                            +(5*result[0]. star_5))/(result[0].total_ratings)
                                            next_star=result[0].star_4+1
                                            star_before = result[0].star_2-1
                                    }else if(star_before==3){
                                        average_rating =( 
                                            (1*result[0].star_1) 
                                            +(2*result[0].star_2)
                                            +(3*(result[0]. star_3-1))//kurang satu
                                            +(4*(result[0]. star_4+1))//tambah satu
                                            +(5*result[0]. star_5))/(result[0].total_ratings)
                                            next_star=result[0].star_4+1
                                            star_before = result[0].star_3-1
                                    }else if(star_before==4){
                                        average_rating =( 
                                            (1*result[0].star_1) 
                                            +(2*result[0].star_2)
                                            +(3*result[0]. star_3)
                                            +(4*result[0]. star_4)
                                            +(5*result[0]. star_5))/(result[0].total_ratings)
                                            next_star=result[0].star_4
                                            star_before = result[0].star_4
                                    }else if(star_before==5){
                                        average_rating =( 
                                            (1*result[0].star_1) 
                                            +(2*result[0].star_2)
                                            +(3*result[0]. star_3)
                                            +(4*(result[0]. star_4+1))//tambah satu
                                            +(5*(result[0]. star_5-1)))/(result[0].total_ratings)//kurang satu
                                            next_star=result[0].star_4+1
                                            star_before = result[0].star_5-1
                                    }
                                    
                                }else if(req.params.rating==5){
                                    if(star_before==1){
                                        average_rating =( 
                                            (1*(result[0].star_1-1))//kurang satu
                                            +(2*result[0].star_2)
                                            +(3*result[0]. star_3)
                                            +(4*result[0]. star_4)
                                            +(5*(result[0]. star_5+1)))/(result[0].total_ratings)//tambah satu
                                            next_star=result[0].star_5+1
                                            star_before = result[0].star_1-1
                                    }else if(star_before==2){
                                        average_rating =( 
                                            (1*result[0].star_1) 
                                            +(2*(result[0].star_2-1))//kurang satu
                                            +(3*result[0]. star_3)
                                            +(4*result[0]. star_4)
                                            +(5*(result[0]. star_5+1)))/(result[0].total_ratings)//tambah satu
                                            next_star=result[0].star_5+1
                                            star_before = result[0].star_2-1
                                    }else if(star_before==3){
                                        average_rating =( 
                                            (1*result[0].star_1) 
                                            +(2*result[0].star_2)
                                            +(3*(result[0]. star_3-1))//kurang satu
                                            +(4*result[0]. star_4)
                                            +(5*(result[0]. star_5+1)))/(result[0].total_ratings)//tambah satu
                                            next_star=result[0].star_5+1
                                            star_before = result[0].star_3-1
                                    }else if(star_before==4){
                                        average_rating =( 
                                            (1*result[0].star_1) 
                                            +(2*result[0].star_2)
                                            +(3*result[0]. star_3)
                                            +(4*(result[0]. star_4-1))//kurang satu
                                            +(5*(result[0]. star_5+1)))/(result[0].total_ratings)//tambah satu
                                            next_star=result[0].star_5+1
                                            star_before = result[0].star_4-1
                                    }else if(star_before==5){
                                        average_rating =( 
                                            (1*result[0].star_1) 
                                            +(2*result[0].star_2)
                                            +(3*result[0]. star_3)
                                            +(4*result[0]. star_4)
                                            +(5*result[0]. star_5))/(result[0].total_ratings)
                                            next_star=result[0].star_5
                                            star_before = result[0].star_5
                                    }
                                }

                                average_rating= average_rating.toFixed(1).toString()

                                const updateRating = await  Products.updateOne({
                                    _id : mongoose.Types.ObjectId(req.params.productId) 
                                      }, 
                                      { $set: 
                                        { 
                                            [next_star_name]: next_star, 
                                            [star_before_name]:star_before,
                                            average_rating:average_rating,
                                            total_ratings:result[0].total_ratings  }})
                                      .exec(async(err, result) => {         
                                            res.status(200).json(result)
                                            next()
                                      })
                                      
                            })
                            } catch (error) {
                                res.status(400).json({message: error})
                            }
                        
                    
                    })
                    
                
            }else{

                const  rating= new Rating({
                    product_ID: req.params.productId,
                    rating: req.params.rating
                    })
            
            
            
                try {
                     await User.findOneAndUpdate(
                        {
                             _id : mongoose.Types.ObjectId(req.params.userId) 
                        },
                        { $push: { my_ratings: rating } }
                        ,
                        { upsert: true, new: true }).exec(async(err, result) => {
                            if(err){
                                console.log("Something wrong when updating data!");
                            }
                           
                        
                            try {
                                //const product =await Products.findById(req.params.productId)

                                const product =await Products.find(
                                { 
                                    _id : mongoose.Types.ObjectId(req.params.productId)
                                },
                                {
                                    star_1:1,
                                    star_2:1,
                                    star_3:1,
                                    star_4:1,
                                    star_5:1,
                                    total_ratings:1
                                }).exec(async(err, result) => {
                                    
                                    
                                    var average_rating 
                                    var next_star_name = "star_"+req.params.rating;
                                    var next_star
                                    if(req.params.rating==1){
                                    average_rating =( 
                                        (1*(result[0].star_1+1)) //tambah satu
                                        +(2*result[0]. star_2)
                                        +(3*result[0]. star_3)
                                        +(4*result[0]. star_4)
                                        +(5*result[0]. star_5))/(result[0].total_ratings+1)
                                        next_star=result[0].star_1+1
                                   
                                    }else if(req.params.rating==2){
                                        average_rating =( 
                                            (1*result[0].star_1) 
                                            +(2*(result[0].star_2+1))//tambah satu
                                            +(3*result[0].star_3)
                                            +(4*result[0].star_4)
                                            +(5*result[0].star_5))/(result[0].total_ratings+1)
                                            next_star=result[0].star_2+1
                                    }else if(req.params.rating==3){
                                        average_rating =( 
                                            (1*result[0].star_1) 
                                            +(2*result[0].star_2)
                                            +(3*(result[0].star_3+1)) //tambah satu
                                            +(4*result[0].star_4)
                                            +(5*result[0].star_5))/(result[0].total_ratings+1)
                                            next_star=result[0].star_3+1
                                    }else if(req.params.rating==4){
                                        average_rating =( 
                                            (1*result[0].star_1) 
                                            +(2*result[0].star_2)
                                            +(3*result[0].star_3)
                                            +(4*(result[0].star_4+1))//tambah satu
                                            +(5*result[0].star_5))/(result[0].total_ratings+1)
                                            next_star=result[0].star_4+1
                                    }else if(req.params.rating==5){
                                        average_rating =( 
                                            (1*result[0].star_1) 
                                            +(2*result[0].star_2)
                                            +(3*result[0].star_3)
                                            +(4*result[0].star_4)
                                            +(5*(result[0].star_5+1)))/(result[0].total_ratings+1)//tambah satu
                                            next_star=result[0].star_5+1
                                    }
                                    average_rating= average_rating.toFixed(1).toString()
                                    const updateRating = await  Products.updateOne({
                                        _id : mongoose.Types.ObjectId(req.params.productId) 
                                          }, 
                                          { $set: 
                                            { 
                                                [next_star_name]: next_star, 
                                                average_rating:average_rating,
                                                total_ratings:result[0].total_ratings+1  }})
                                          .exec(async(err, result) => {      
                                              
                                                res.status(200).json(result)
                                          })
                                })
                        
                                
                                // const productRating = await  Products.updateOne({
                                //     _id : mongoose.Types.ObjectId(req.params.productId) 
                                //       }, { $set: { 'my_ratings.$.rating': req.params.rating  }})
                                //       .exec();   
                                //       res.status(200).json(productRating)
                            } catch (error) {
                                res.status(400).json({message: error})
                            }
                           
                        });
                             
                   
                   
                } catch (error) {
                    res.status(400).json({message: error})
                }

              
            }
        });
       
    } catch (error) {
        res.status(400).json({message: error})
    }

   

   
})

// //SPECIFIC Wishlist
// router.get('/:wishlistId', verify,async(req,res)=>{

//     const {error} = isHex(req.params.wishlistID)
//     if(error) {
//         return res.status(400).send("Wishlist id Salah");
//     }



//     try {
//         // Wishlist

//         await User.aggregate([
//             {"$unwind":"$my_wishlists"}, 
//             {
//                 $match: { 
//                     _id : mongoose.Types.ObjectId(req.params.userId),
//                     "my_wishlists._id" : mongoose.Types.ObjectId(req.params.wishlistID),
//                 }
//               },
//             { $replaceRoot: { newRoot:"$my_wishlists"}},
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
//             { $project: {  product_ID: 0} }
//         ])
//         .exec((err, result) => {
//             if (err) throw res.status(400).json({message: err});
//             res.status(200).json(result)
//         });
       
//     } catch (error) {
//         res.status(400).json({message: error})
//     }

// })

// // //DeleteCart
// router.delete('/delete/:wishlistId',verify,async(req,res,next)=>{


//     const {error} = isHex(req.params.wishlistId)
//     if(error) return res.status(400).send("Wishlist id Salah");

//     //Check id is exist
//     const WishlistExist = await User.findOne(  
//         { 
//             _id : req.params.userId,
//             "my_wishlists._id" : mongoose.Types.ObjectId(req.params.wishlistId )},
//             {new: true},
//         { array: 1 }
//     );
//     if(!WishlistExist) return res.status(400).send('Wishlist tidak ditemukan');
   
//     try {
       
//         const deleteWishlist = await  User.updateOne(
//         {
//             _id : req.params.userId
//         },
//         { $pull: { my_wishlists: {  _id: mongoose.Types.ObjectId(req.params.wishlistId)}  } }
//         ,{ multi: true })

//         res.status(200).json(deleteWishlist)
    
   
//     } catch (error) {
//         res.status(400).json({message: error})
//     }

    

  
//  })

// //Update a cart
// router.patch('/update/:wishlistId',verify,async(req,res)=>{

//     const {error} = isHex(req.params.wishlistId)
//     if(error) return res.status(400).send("Wishlist id Salah");

//      //Check id is exist
//      const WishlistExist = await User.findOne(  
//         { 
//             _id : req.params.userId,
//             "my_wishlists._id" : mongoose.Types.ObjectId(req.params.wishlistId )},
//         { array: 1 }
//     );
//     if(!WishlistExist) return res.status(400).send('Address Id tidak ditemukan');



//      //Check id is exist
//     await User.aggregate([
//         {"$unwind":"$my_wishlists"}, 
//         {"$match":{
//             _id : req.params.userId,
//             "my_wishlists._id" : mongoose.Types.ObjectId(req.params.wishlistId )},
//         },
//         { $replaceRoot: { newRoot:"$my_wishlists"}}
//     ])
//     .exec(async(err, result) => {
//         if (err) throw res.status(400).json("Wishlist Id tidak diketahui");
         
//     });

  
//     var  wishlist= new Wishlist({
//         product_ID: req.body.product_ID
//         })


//     try {



//         const updateWishlist =    await  User.updateOne({
//             _id : req.params.userId,
//             "my_wishlists._id" : mongoose.Types.ObjectId(req.params.wishlistId )
//               }, { $set: { 'my_wishlists.$': wishlist }})
//               .exec();
//             res.status(200).json(updateWishlist)
        
//     } catch (error) {
//         res.status(400).json({message: error})
//     }

   
    
// })



module.exports = router