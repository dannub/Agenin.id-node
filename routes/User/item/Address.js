const router = require('express').Router({mergeParams: true})
const verify = require('../../User/verifytoken')


const mongoose = require('mongoose');

const Address = require('../../../model/User/item/Address')


const User = require('../../../model/User/User')

const {isHex} = require('../../../validation')

// const fs = require('fs')

// const multer = require("multer")
// const storage = multer.diskStorage({
//     destination: function (req,file,cb) {
//         cb(null,"./public/uploads/topdeals")
//     },
//     filename: function (req,file,cb) {
//         cb(null, new Date().toISOString()+ file.originalname)
//     }
// })

// const fileFilter = (req,file,cb)=>{
//     if(file.mimetype == 'image/jpeg' ||file.mimetype == 'image/png' ){
//         cb(null,true)
//     }else{
//         cb(null,false)
//     }
    
    
// }

// const upload = multer({
//     storage : storage,
//     limit:{
//         fileSize: 1024*1024 *5
//     },
//     fileFilter : fileFilter
// })



//const MongoClient = require('mongodb').MongoClient;
//const conn = require('../../../connection').connect


//GET ALL Address
router.get('/',verify,async(req,res)=>{

    try {
        //All Address
       

        await User.aggregate([
            {"$unwind":"$my_addresses"}, 
            {
                $match: { _id : mongoose.Types.ObjectId(req.params.userId) }
              },
            { $replaceRoot: { newRoot:"$my_addresses"}}
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

//SUBMITS A Address
router.post('/create',verify,async(req,res)=>{



    var  adderess= new Address({
        nama: req.body.nama,
        no_telepon: req.body.no_telepon,
        no_alternatif: req.body.no_alternatif,
        provinsi: req.body.provinsi,
        kabupaten: req.body.kabupaten,
        kecamatan: req.body.kecamatan,
        kodepos: req.body.kodepos,
        detail: req.body.detail
        })



    try {
        const addAddress =  await User.findOneAndUpdate(
            {
                 _id : req.params.userId 
            },
            { $push: { my_addresses: adderess } }
            ,
            { upsert: true, new: true }
        );
        res.status(200).json(addAddress)
    } catch (error) {
        res.status(400).json({message: error})
    }

   


  
})

//SPECIFIC Address
router.get('/:addressId', verify,async(req,res)=>{

    const {error} = isHex(req.params.addressId)
    if(error) {
        return res.status(400).send("Address id Salah");
    }
    await User.aggregate([
        {"$unwind":"$my_addresses"}, 
        {"$match":{ 
            _id : req.params.userId,
            "my_addresses._id" : mongoose.Types.ObjectId(req.params.addressId)}},
        { $replaceRoot: { newRoot:"$my_addresses"}}
    ])
    .exec((err, result) => {
        if (err) throw res.status(400).json({message: error});
        res.status(200).json(result)
    });

})

//DeleteAddress
router.delete('/delete/:addressId',verify,async(req,res,next)=>{


    const {error} = isHex(req.params.addressId)
    if(error) return res.status(400).send("Address id Salah");

    //Check id is exist
    const AddressExist = await User.findOne(  
        { 
            _id : req.params.userId,
            "my_addresses._id" : mongoose.Types.ObjectId(req.params.addressId )},
            {new: true},
        { array: 1 }
    );
    if(!AddressExist) return res.status(400).send('Address tidak ditemukan');
   
    try {
       
        const deleteAddress = await  User.updateOne(
        {
            _id : req.params.userId
        },
        { $pull: { my_addresses: {  _id: mongoose.Types.ObjectId(req.params.addressId)}  } }
        ,{ multi: true })

        res.status(200).json(deleteAddress)
    
   
    } catch (error) {
        res.status(400).json({message: error})
    }

    

  
})

//Update a address
router.patch('/update/:addressId',verify,async(req,res)=>{

    const {error} = isHex(req.params.addressId)
    if(error) return res.status(400).send("Address id Salah");

     //Check id is exist
     const AddressExist = await User.findOne(  
        { 
            _id : req.params.userId,
            "my_addresses._id" : mongoose.Types.ObjectId(req.params.addressId )},
        { array: 1 }
    );
    if(!AddressExist) return res.status(400).send('Address Id tidak ditemukan');



     //Check id is exist
    await User.aggregate([
        {"$unwind":"$my_addresses"}, 
        {"$match":{
            _id : req.params.userId,
            "my_addresses._id" : mongoose.Types.ObjectId(req.params.addressId )},
        },
        { $replaceRoot: { newRoot:"$my_addresses"}}
    ])
    .exec(async(err, result) => {
        if (err) throw res.status(400).json("Address Id tidak diketahui");
         
    });

  
    var  adderess= new Address({
        nama: req.body.nama,
        no_telepon: req.body.no_telepon,
        no_alternatif: req.body.no_alternatif,
        provinsi: req.body.provinsi,
        kabupaten: req.body.kabupaten,
        kecamatan: req.body.kecamatan,
        kodepos: req.body.kodepos,
        detail: req.body.detail
        })


    try {



        const updateAddress =    await  User.updateOne({
            _id : req.params.userId,
            "my_addresses._id" : mongoose.Types.ObjectId(req.params.addressId )
              }, { $set: { 'my_addresses.$': adderess }})
              .exec();
            res.status(200).json(updateAddress)
        
    } catch (error) {
        res.status(400).json({message: error})
    }

   
    
})



module.exports = router