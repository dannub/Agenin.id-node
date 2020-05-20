const router = require('express').Router({mergeParams: true})
const verify = require('../../User/verifytoken')


const mongoose = require('mongoose');

const Nota = require('../../../model/User/item/Nota')
const {getDate,isHex} = require('../../../validation')


const User = require('../../../model/User/User')

const ItemNota  = require('./itemNota/ItemNota')


const fs = require('fs')

const multer = require("multer")

const storage = multer.diskStorage({
    destination: function (req,file,cb) {
        cb(null,"./public/uploads/bukti/nota/")
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

//GET ALL Nota
router.get('/',verify,async(req,res)=>{

    try {
        //All Nota

        await User.aggregate([
            {"$unwind":"$my_nota"}, 
         
            { $replaceRoot: { newRoot: { $mergeObjects: [ { user_id: "$_id"},"$my_nota" ] }}},
            {
                $match: { 
                   
                "$and": [
                    {date: {$gte:new Date(getDate(req.body.from)+"T00:00:00.000Z") }},
                    {date: {$lt:new Date(getDate(req.body.to)+"T23:59:59.999Z") }}
                    ]
                            
              },
            }, 
           { $project: {  
               user_id: 1,
               confirmed:1,
               packed:1,
               shipped:1,
               delivered:1,
               canceled:1,
               bukti:1,
               atas_nama:1,
               bank:1,
               ordered_date:1,
               confirmed_date:1,
               packed_date:1,
               shipped_date:1,
               delivered_date:1,
               canceled_date:1,
               date:1,
            } }
        ]).sort({ 
            confirmed: -1,
            packed: -1,
            shipped: -1,
            delivered: -1,
            canceled: -1,
            date: 1, 
        })
        .exec((err, result) => {
            if (err) throw res.status(400).json({message: err});
            res.status(200).json(result)
        });
       
   
    } catch (error) {
        res.status(400).json({message: error})
    }

})

router.get('/user',verify,async(req,res)=>{

    try {
        // Nota

        await User.aggregate([
           {"$unwind":"$my_nota"},
            {
                $match: { 
                    _id : mongoose.Types.ObjectId(req.params.userId),
                }
              },
             { "$unwind": "$my_nota.items" },
              {
                $lookup:
                    {
                        from: "products",
                        localField: 'my_nota.items.product_ID', 
                        foreignField: 'incharge',
                     
                        as: "my_nota.items.product_ID"
                    }
             },
             { "$unwind": "$my_nota.items.product_ID" },
           
            { $replaceRoot: { newRoot: { $mergeObjects: [ { user_id: "$_id",my_ratings: "$my_ratings"},"$my_nota.items"  ]} }},
               {
                "$group": {
                    "_id" : "$user_id", 
                    "my_ratings" : { "$first": "$my_ratings" },
                    "items": { $push: "$$ROOT"}
                    
                }
            },
            {
                $project: { 
                "items.my_ratings":0,
                "items.user_id":0,
                "_id":0
               
                }
            }
        ])
        .exec((err, result) => {
            if (err) throw res.status(400).json({message: err});
            var items =  result[0].items,my_ratings =result[0].my_ratings;

          
            for (i = 0; i <  items.length; i++) { 
                for (j = 0; j <  my_ratings.length; j++) {
                    if(items[i].product_ID.incharge==my_ratings[j].product_ID){
                        items[i].rating=my_ratings[j].rating
                    }
                }
            } 
            res.status(200).json(items)
        });
       
    } catch (error) {
        res.status(400).json({message: error})
    }
})



//SUBMITS A Nota
router.post('/create',upload.fields([
    {
    name: 'bukti'
  }]),verify,async(req,res)=>{



    var  nota= new Nota({
        //send
        bukti: "nota/"+req.files.bukti[0].filename,
        atas_nama: req.body.atas_nama,
        bank: req.body.bank,
        tgl_transfer: req.body.tgl_transfer,
        //address
        full_address: req.body.full_address,
        phone: req.body.phone,
        detail_address: req.body.detail_address,
        kode_pos:req.body.kode_pos,
        //ongkir
        total_ongkir:req.body.total_ongkir,
        total_item_price:req.body.total_item_price,
        total_amount:req.body.total_amount,
        save_ongkir:req.body.save_ongkir,
        items: [],
        })



    try {
        const addNota =  await User.findOneAndUpdate(
            {
                 _id : req.params.userId 
            },
            { $push: { my_nota: nota } }
            ,
            { upsert: true, new: true }
        );
        res.status(200).json(addNota)
    } catch (error) {
        res.status(400).json({message: error})
    }

   
})




// //SPECIFIC nota
router.get('/:notaId', verify,async(req,res)=>{

    const {error} = isHex(req.params.notaId)
    if(error) {
        return res.status(400).send("Nota id Salah");
    }



    try {
        // Nota

        await User.aggregate([
           {"$unwind":"$my_nota"},
            {
                $match: { 
                    _id : mongoose.Types.ObjectId(req.params.userId),
                   "my_nota._id" : mongoose.Types.ObjectId(req.params.notaId),
                }
              },
             { "$unwind": "$my_nota.items" },
              {
                $lookup:
                    {
                        from: "products",
                        localField: 'my_nota.items.product_ID', 
                        foreignField: 'incharge',
                     
                        as: "my_nota.items.product_ID"
                    }
             },
             { "$unwind": "$my_nota.items.product_ID" },
             {
                "$group": {
                    "_id" : "$my_nota._id", 
                    "user_id":{ "$first": "$_id" },
                    "name": { "$first": "$name" },
                    "email":{ "$first": "$email" },
                    "confirmed": { "$first": "$my_nota.confirmed" }, 
                    "packed": { "$first": "$my_nota.packed" }, 
                    "shipped": { "$first": "$my_nota.shipped" }, 
                    "delivered": { "$first": "$my_nota.delivered" }, 
                    "canceled": { "$first": "$my_nota.canceled" }, 
                    "ket_kirim": { "$first": "$my_nota.ket_kirim" }, 
                    "metode_kirim": { "$first": "$my_nota.metode_kirim" }, 
                    "bukti": { "$first": "$my_nota.bukti" }, 
                    "atas_nama": { "$first": "$my_nota.atas_nama" }, 
                    "bank": { "$first": "$my_nota.bank" }, 
                    "tgl_transfer": { "$first": "$my_nota.tgl_transfer" }, 
                    "full_address": { "$first": "$my_nota.full_address" }, 
                    "phone": { "$first": "$my_nota.phone" }, 
                    "detail_address": { "$first": "$my_nota.detail_address" }, 
                    "kode_pos": { "$first": "$my_nota.kode_pos" }, 
                    "total_ongkir": { "$first": "$my_nota.total_ongkir" }, 
                    "total_item_price": { "$first": "$my_nota.total_item_price" }, 
                    "total_amount": { "$first": "$my_nota.total_amount" }, 
                    "save_ongkir": { "$first": "$my_nota.save_ongkir" }, 
                    "ordered_date": { "$first": "$my_nota.ordered_date" }, 
                    "confirmed_date": { "$first": "$my_nota.confirmed_date" }, 
                    "packed_date": { "$first": "$my_nota.packed_date" }, 
                    "shipped_date": { "$first": "$my_nota.shipped_date" }, 
                    "delivered_date": { "$first": "$my_nota.delivered_date" }, 
                    "canceled_date": { "$first": "$my_nota.canceled_date" }, 
                    "date": { "$first": "$my_nota.date" }, 
                   
                    "items": { "$push": "$my_nota.items" }            
                }
            },
           
        ])
        .exec((err, result) => {
            if (err) throw res.status(400).json({message: err});
            res.status(200).json(result)
        });
       
    } catch (error) {
        res.status(400).json({message: error})
    }

})





// // //Delete Nota
router.delete('/delete/:notaId',verify,async(req,res,next)=>{

    const {error} = isHex(req.params.notaId)
    if(error) return res.status(400).send("Nota id Salah");

    //Check id is exist
    const NotaExist = await User.findOne(  
        { 
            _id : req.params.userId,
            "my_nota._id" : mongoose.Types.ObjectId(req.params.notaId )
        },
        {new: true},
        { array: 1 }
    );
    if(!NotaExist) return res.status(400).send('Nota tidak ditemukan');
   
    try {
       
        const deleteNota = await  User.updateOne(
        {
            _id : req.params.userId
        },
        { $pull: { my_nota: {  _id: mongoose.Types.ObjectId(req.params.notaId)}  } }
        ,{ multi: true })
        res.status(200).json(deleteNota)
   
    } catch (error) {
        res.status(400).json({message: error})
    }

 })



// //Update status
router.patch('/update/:notaId',verify,async(req,res)=>{

    const {error} = isHex(req.params.notaId)
    if(error) return res.status(400).send("Nota id Salah");

 

     //Check id is exist
    await User.aggregate([
        {"$unwind":"$my_nota"}, 
        {"$match":{
            _id : req.params.userId,
            "my_nota._id" : mongoose.Types.ObjectId(req.params.notaId )},
        },
        { $replaceRoot: { newRoot:"$my_nota"}}
    ])
    .exec(async(err, result) => {
        if (err) throw res.status(400).json("Nota Id tidak diketahui");
         
    });


    try {
        // Nota

        await User.aggregate([
           {"$unwind":"$my_nota"},
            {
                $match: { 
                    _id : mongoose.Types.ObjectId(req.params.userId),
                   "my_nota._id" : mongoose.Types.ObjectId(req.params.notaId),
                }
              },
             { "$unwind": "$my_nota.items" },
              {
                $lookup:
                    {
                        from: "products",
                        localField: 'my_nota.items.product_ID', 
                        foreignField: 'incharge',
                     
                        as: "my_nota.items.product_ID"
                    }
             },
             { "$unwind": "$my_nota.items.product_ID" },
             {
                "$group": {
                    "_id" : "$my_nota._id", 
                    "user_id":{ "$first": "$_id" },
                    "name": { "$first": "$name" },
                    "email":{ "$first": "$email" },
                    "confirmed": { "$first": "$my_nota.confirmed" }, 
                    "packed": { "$first": "$my_nota.packed" }, 
                    "shipped": { "$first": "$my_nota.shipped" }, 
                    "delivered": { "$first": "$my_nota.delivered" }, 
                    "canceled": { "$first": "$my_nota.canceled" }, 
                    "ket_kirim": { "$first": "$my_nota.ket_kirim" }, 
                    "metode_kirim": { "$first": "$my_nota.metode_kirim" }, 
                    "bukti": { "$first": "$my_nota.bukti" }, 
                    "atas_nama": { "$first": "$my_nota.atas_nama" }, 
                    "bank": { "$first": "$my_nota.bank" }, 
                    "tgl_transfer": { "$first": "$my_nota.tgl_transfer" }, 
                    "full_address": { "$first": "$my_nota.full_address" }, 
                    "phone": { "$first": "$my_nota.phone" }, 
                    "detail_address": { "$first": "$my_nota.detail_address" }, 
                    "kode_pos": { "$first": "$my_nota.kode_pos" }, 
                    "total_ongkir": { "$first": "$my_nota.total_ongkir" }, 
                    "total_item_price": { "$first": "$my_nota.total_item_price" }, 
                    "total_amount": { "$first": "$my_nota.total_amount" }, 
                    "save_ongkir": { "$first": "$my_nota.save_ongkir" }, 
                    "ordered_date": { "$first": "$my_nota.ordered_date" }, 
                    "confirmed_date": { "$first": "$my_nota.confirmed_date" }, 
                    "packed_date": { "$first": "$my_nota.packed_date" }, 
                    "shipped_date": { "$first": "$my_nota.shipped_date" }, 
                    "delivered_date": { "$first": "$my_nota.delivered_date" }, 
                    "canceled_date": { "$first": "$my_nota.canceled_date" }, 
                    "date": { "$first": "$my_nota.date" }, 
                   
                    "items": { "$push": "$my_nota.items" }            
                }
            },
           
        ])
        .exec(async(err, result) => {
            if (err) throw res.status(400).json({message: err});
            if(result[0].canceled){
                res.status(400).json("Pesanan Dibatalkan");
            }else{
                if(!result[0].confirmed){

                    var UpdateNota = await  User.updateOne({
                        _id : mongoose.Types.ObjectId(req.params.userId),
                        "my_nota._id" : mongoose.Types.ObjectId(req.params.notaId) 
                        }, 
                        { $set: 
                            { 
                                'my_nota.$.confirmed': true, 
                                'my_nota.$.confirmed_date':new Date(Date.now())
                            }
                        })
                        .exec();

                    res.status(200).json(UpdateNota)
                }else{
                    if(!result[0].packed){
                        var UpdateNota = await  User.updateOne({
                            _id : mongoose.Types.ObjectId(req.params.userId),
                            "my_nota._id" : mongoose.Types.ObjectId(req.params.notaId) 
                            }, 
                            { $set: 
                                { 
                                    'my_nota.$.packed': true, 
                                    'my_nota.$.packed_date':new Date(Date.now())
                                }
                            })
                            .exec();
                        res.status(200).json(UpdateNota)
                    }else{
                        if(!result[0].shipped){
                            if((req.body.ket_kirim!=undefined)&&(req.body.metode_kirim!=undefined)){
                                console.log("ghfghfgh")
                                var UpdateNota = await  User.updateOne({
                                    _id : mongoose.Types.ObjectId(req.params.userId),
                                    "my_nota._id" : mongoose.Types.ObjectId(req.params.notaId) 
                                    }, 
                                    { $set: 
                                        { 
                                            'my_nota.$.ket_kirim':req.body.ket_kirim,
                                            'my_nota.$.metode_kirim':req.body.metode_kirim,
                                            'my_nota.$.shipped': true, 
                                            'my_nota.$.shipped_date':new Date(Date.now())
                                        }
                                    })
                                    .exec();
                                res.status(200).json(UpdateNota)
                            }else{
                                res.status(400).json("Isi Ket Kirim dan Metode KIrim");
                            }
                        }else{
                            if(!result[0].delivered){
                                var UpdateNota =await  User.updateOne({
                                    _id : mongoose.Types.ObjectId(req.params.userId),
                                    "my_nota._id" : mongoose.Types.ObjectId(req.params.notaId) 
                                    }, 
                                    { $set: 
                                        { 
                                            'my_nota.$.delivered': true, 
                                            'my_nota.$.delivered_date':new Date(Date.now())
                                        }
                                    })
                                    .exec();
                                    res.status(200).json(UpdateNota)
                            }else{
                                res.status(400).json("Pesanan Selesai");
                            }
                        }
                    }
                }
            }
          
         
          
        });
       
    } catch (error) {
        res.status(400).json({message: error})
    }

  
   

})

// //Update a cart
router.patch('/canceled/:notaId',verify,async(req,res)=>{

    const {error} = isHex(req.params.notaId)
    if(error) return res.status(400).send("Nota id Salah");

 

     //Check id is exist
    await User.aggregate([
        {"$unwind":"$my_nota"}, 
        {"$match":{
            _id : req.params.userId,
            "my_nota._id" : mongoose.Types.ObjectId(req.params.notaId )},
        },
        { $replaceRoot: { newRoot:"$my_nota"}}
    ])
    .exec(async(err, result) => {
        if (err) throw res.status(400).json("Nota Id tidak diketahui");
         
    });


    try {
        // Nota


  

        await User.aggregate([
            {"$unwind":"$my_nota"},
             {
                 $match: { 
                     _id : mongoose.Types.ObjectId(req.params.userId),
                    "my_nota._id" : mongoose.Types.ObjectId(req.params.notaId),
                 }
               },
              { "$unwind": "$my_nota.items" },
               {
                 $lookup:
                     {
                         from: "products",
                         localField: 'my_nota.items.product_ID', 
                         foreignField: 'incharge',
                      
                         as: "my_nota.items.product_ID"
                     }
              },
              { "$unwind": "$my_nota.items.product_ID" },
              {
                 "$group": {
                     "_id" : "$my_nota._id", 
                     "user_id":{ "$first": "$_id" },
                     "name": { "$first": "$name" },
                     "email":{ "$first": "$email" },
                     "confirmed": { "$first": "$my_nota.confirmed" }, 
                     "packed": { "$first": "$my_nota.packed" }, 
                     "shipped": { "$first": "$my_nota.shipped" }, 
                     "delivered": { "$first": "$my_nota.delivered" }, 
                     "canceled": { "$first": "$my_nota.canceled" }, 
                     "ket_kirim": { "$first": "$my_nota.ket_kirim" }, 
                     "metode_kirim": { "$first": "$my_nota.metode_kirim" }, 
                     "bukti": { "$first": "$my_nota.bukti" }, 
                     "atas_nama": { "$first": "$my_nota.atas_nama" }, 
                     "bank": { "$first": "$my_nota.bank" }, 
                     "tgl_transfer": { "$first": "$my_nota.tgl_transfer" }, 
                     "full_address": { "$first": "$my_nota.full_address" }, 
                     "phone": { "$first": "$my_nota.phone" }, 
                     "detail_address": { "$first": "$my_nota.detail_address" }, 
                     "kode_pos": { "$first": "$my_nota.kode_pos" }, 
                     "total_ongkir": { "$first": "$my_nota.total_ongkir" }, 
                     "total_item_price": { "$first": "$my_nota.total_item_price" }, 
                     "total_amount": { "$first": "$my_nota.total_amount" }, 
                     "save_ongkir": { "$first": "$my_nota.save_ongkir" }, 
                     "ordered_date": { "$first": "$my_nota.ordered_date" }, 
                     "confirmed_date": { "$first": "$my_nota.confirmed_date" }, 
                     "packed_date": { "$first": "$my_nota.packed_date" }, 
                     "shipped_date": { "$first": "$my_nota.shipped_date" }, 
                     "delivered_date": { "$first": "$my_nota.delivered_date" }, 
                     "canceled_date": { "$first": "$my_nota.canceled_date" }, 
                     "date": { "$first": "$my_nota.date" }, 
                    
                     "items": { "$push": "$my_nota.items" }            
                 }
             },
            
         ])
         .exec(async(err, result) => {
             if (err) throw res.status(400).json({message: err});
             if(!result[0].delivered){
                var UpdateNota = await  User.updateOne({
                    _id : mongoose.Types.ObjectId(req.params.userId),
                    "my_nota._id" : mongoose.Types.ObjectId(req.params.notaId) 
                    }, 
                    { $set: 
                        { 
                            'my_nota.$.canceled': true, 
                            'my_nota.$.canceled_date':new Date(Date.now())
                        }
                    })
                    .exec();
        
                res.status(200).json(UpdateNota)
                 
             }else{
                res.status(400).json("Pesanan Selesai");
                 
             }
           
          
           
         });
       
    } catch (error) {
        res.status(400).json({message: error})
    }

})


router.use('/:notaId/item',ItemNota)


module.exports = router