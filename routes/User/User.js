
const router = require('express').Router();
const User = require('../../model/User/User')
const jwt = require('jsonwebtoken')
const verify = require('../User/verifytoken')
const bcrypt = require('bcryptjs')
const {registerValidation,loginValidation,getDate} = require('../../validation')
const Address = require('./item/Address')
const Cart = require('./item/Cart')
const Wishlist = require('./item/Wishlist')
const Rating = require('./item/Rating')
const Notification = require('./item/Notification')
const Nota  = require('./item/Nota')


const fs = require('fs')

const multer = require("multer")
const storage_profil = multer.diskStorage({
    destination: function (req,file,cb) {
        cb(null,"./public/assets/uploads/user/")
    },
    filename: function (req,file,cb) {
        cb(null, new Date().toISOString()+ file.originalname)
    }
})
const storage_bukti = multer.diskStorage({
    destination: function (req,file,cb) {
        cb(null,"./public/assets/uploads/bukti/daftar/")
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

const upload_profil = multer({
    storage : storage_profil,
    limit:{
        fileSize: 1024*1024 *5
    },
    fileFilter : fileFilter
})

const upload_bukti = multer({
    storage : storage_bukti,
    limit:{
        fileSize: 1024*1024 *5
    },
    fileFilter : fileFilter
})

//Register

router.post('/register',upload_bukti.fields([
    {
    name: 'bukti'
  }]), async (req, res) => {
      

    var user;

    if(req.query.role=="user"){
         // var userCek = {name:req.body.name,email:req.body.email,password:req.body.password}
        //LETS VALIDA TE THE DATA BEFORE WE A USER
        // const {error} = registerValidation(userCek)
        // if(error) return res.status(400).send(
        // {
        //     error: error.details[0].message,
        //     message: "Email atau password terlalu pendek"
        // })
        //Checking if user is already in database
        const emailExist = await User.findOne({email: req.body.email,role :req.query.role})
        if(emailExist) return res.status(400).send('Email already exist');

        //Hash password
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(req.body.password,salt)

        //Create a new user
      user = new User({
            token_fb:req.body.token_fb,
            name: req.body.name,
            role:"user",
            email: req.body.email,
            name_refferal: req.body.name_refferal,
            password: hashPassword,
            profil: "",
            bukti: "assets/uploads/bukti/daftar/"+req.files.bukti[0].filename,
            bukti_tgl: req.body.bukti_tgl,
            bukti_bank: req.body.bukti_bank,
            bukti_an: req.body.bukti_an,
            status: false,
            handphone: req.body.handphone,
            my_addresses: [],
            my_carts: [],
            my_notifications: [],
            my_ratings: [],
            my_wishlists: [],
            my_nota: [],
            
        });
    }else{
     
          // var userCek = {name:req.body.name,email:req.body.email,password:req.body.password}
        //LETS VALIDA TE THE DATA BEFORE WE A USER
        // const {error} = registerValidation(userCek)
        // if(error) return res.status(400).send(
        // {
        //     error: error.details[0].message,
        //     message: "Email atau password terlalu pendek"
        // })
        //Checking if user is already in database
        const emailExist = await User.findOne({email: req.body.email,role :req.query.role})
        if(emailExist) return res.status(400).send('Email already exist');

        //Hash password
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(req.body.password,salt)

        //Create a new user
        user = new User({
            name: req.body.name,
            role:"admin",
            email: req.body.email,
            password: hashPassword,
            my_addresses: [],
            my_carts: [],
            my_notifications: [],
            my_ratings: [],
            my_wishlists: [],
            my_nota: [],
            
        });
    }

   try{

         await user.save(async function(err, doc) {
            if (err) return  res.status(400).send({err});

            const token = jwt.sign({_id: doc._id}, process.env.TOKEN_SECRET)
            user= {

                "_id": doc._id,
                "name": doc.name,
                "email": doc.email,
                "status": doc.status,
                "token":token
            }
            res.status(200).header('auth-token',token).send(user)
            next()
        })
        
    } catch (error) {
        res.status(400).json({message: error})
    }

});


//Login

router.post('/login/', async (req, res,next) => {


    if(req.query.role=="user"){
        //LETS VALIDA TE THE DATA BEFORE WE A USER
        var userCek = {email:req.body.email,password:req.body.password}
    
        const {error} = loginValidation(userCek)
        if(error) return res.status(400).send(error.details[0].message);


        //Checking if the email exixsts
        var user = await User.findOneAndUpdate({email: req.body.email,role:"user"}, {$set:{lastseen:new Date()}}, {new: true}, (err, doc) => {
            if (err) {
                console.log("Something wrong when updating data!");
            }
        
            console.log(doc);
        });
        if(!user) return res.status(400).send('Email is not found');

        //Password is correct
        const validPass = await bcrypt.compare(req.body.password, user.password)
        if(!validPass) return res.status(400).send('Invalid password');


        //Create and assign a token
        const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET)
        user= {

            "_id": user._id,
            "name": user.name,
            "email": user.email,
            "profil": user.profil,
            "status": user.status,
            "role": user.role,
            "token":token
        }
        res.status(200).header('auth-token',token).send(user)

        next()
    }else{
        //LETS VALIDA TE THE DATA BEFORE WE A USER
        var userCek = {email:req.body.email,password:req.body.password}
    
        const {error} = loginValidation(userCek)
        if(error) return res.status(400).send(error.details[0].message);


        //Checking if the email exixsts
        var user = await User.findOneAndUpdate({email: req.body.email,role:"admin"}, {$set:{lastseen:new Date()}}, {new: true}, (err, doc) => {
            if (err) {
                console.log("Something wrong when updating data!");
            }
        
            console.log(doc);
        });
        if(!user) return res.status(400).send('Email is not found');

        //Password is correct
        const validPass = await bcrypt.compare(req.body.password, user.password)
        if(!validPass) return res.status(400).send('Invalid password');


        //Create and assign a token
        const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET)
        user= {

            "_id": user._id,
            "name": user.name,
            "email": user.email,
            "status": user.status,
            "token":token
        }
        res.status(200).header('auth-token',token).send(user)

        next()
    }

});

router.get('/logout',verify,async(req,res, next)=>{
    delete req.headers['auth-token'];
    //delete req.header('auth-token'); // should be lowercase
    res.status(200).json("Log Out Sukses")
 // next();
   
  });


//GET ALL User by date sort status
router.get('/',verify,async(req,res)=>{

    try {
        //All User
        
        const users = await User.find({date :
        {
            $gte:  new Date(getDate(req.body.from)+"T00:00:00.000Z"),
            $lt:  new Date(getDate(req.body.to)+"T23:59:59.000Z")
        },
        role:"user"
    },
        {
            name:1,
            bukti:1,
            bukti_tgl: 1,
            bukti_bank:1,
            bukti_an: 1,
            status: 1,
            handphone:1,
            email:1
        }
        ).sort( { status: 1 ,date : -1} );
        res.status(200).json(users)
   
    } catch (error) {
        res.status(400).json({message: error})
    }

})

//GET ALL User by date sort status
router.get('/All',verify,async(req,res)=>{

    try {
        //All User
        
        const users = await User.find({role:"user"},{id:1,name:1,email:1,handphone:1});
        res.status(200).json(users)
   
    } catch (error) {
        res.status(400).json({message: error})
    }

})


//GET ALL User by date sort status
router.get('/profil/:userId',verify,async(req,res)=>{

    try {
        //All User
        
        const users = await User.find(
            {_id :req.params.userId,
                role:"user"
            },
        {
            name:1,
            email:1,
            profil: 1,
        }
        ) ;
        res.status(200).json(users)
   
    } catch (error) {
        res.status(400).json({message: error})
    }

})


//SPECIFIC User
router.get('/id/:userId',verify,async(req,res)=>{

    try {
        const user =await User.findById(req.params.userId)
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({message: error})
    }
})

//DeleteUser
router.delete('/delete/:userId',verify,async(req,res)=>{

    try {
       
        try {
            const user =await User.findById(req.params.userId)
            try {
                fs.unlinkSync('./public/'+user.bukti)
                for (var i in user.my_nota) {
                    val = user.my_nota[i];
                     fs.unlinkSync('./public/'+val)
                } 
  
                //file removed
                const removedUser =await User.deleteOne({_id: req.params.userId})
                res.status(200).json(removedUser)
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


//Status
//Get status
router.get('/status/:userId',verify,async(req,res)=>{

    try {
        const user =await User.findById(req.params.userId)
        res.status(200).json(user.status)
    } catch (error) {
        res.status(400).json({message: error})
    }
})

//Get status
router.get('/notifAll',verify,async(req,res)=>{

    try {
        //All Cart

   
                   await User.aggregate([
                    {"$unwind":"$my_notifications"}, 
                    {
                        $match: {role:"user"}
                      },
                     
                    { $replaceRoot: { newRoot: { $mergeObjects: [ { user_id: "$_id"},"$my_notifications" ] }}},
                     { 
                            "$group": {
                                _id : "$user_id",
                                user_id: { "$first": "$user_id" },
                                notif: { $push: "$$ROOT"},
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



//Update status
router.patch('/status/update/:userId',verify,async(req,res)=>{

    try {


        try {

            const updateStatus =  await  User.updateOne(
                {
                    _id : req.params.userId,
                    role:"user"
                }
                ,{ $set:  {'status' : true }}
               ).exec()
            
            
                res.status(200).json(updateStatus)
            
          } catch(err) {
            console.error(err)
          }

       
    } catch (error) {
        res.status(400).json({message: error})
    }
})

//Update token
router.patch('/token/update/:userId/:token',verify,async(req,res)=>{

    try {


        try {

            const updateToken =  await  User.updateOne(
                {
                    _id : req.params.userId,
                    role:"user"
                }
                ,{ $set:  {'token_fb' : req.params.token }}
               ).exec()
            
            
                res.status(200).json(updateToken)
            
          } catch(err) {
            console.error(err)
          }

       
    } catch (error) {
        res.status(400).json({message: error})
    }
})

//User info profil,email & nama
//Update a user
router.patch('/info/update/:userId',upload_profil.fields([
    {
    name: 'profil'
  }]),verify,async(req,res)=>{

    try {
        const user =await User.findById(req.params.userId)

        try {


            if(req.files.profil[0]!=undefined){
                if((user.profil!= undefined && user.profil!= "")){
                    fs.unlinkSync('./public/'+user.profil)
                }

                const updateStatus =  await  User.updateOne(
                    {
                        _id : req.params.userId
                    }
                    ,{ $set:  {name : req.body.name,email: req.body.email,  
                        profil: "assets/uploads/user/"+req.files.profil[0].filename}}
                ).exec()
                res.status(200).json(updateStatus)
            }else{
                const updateStatus =  await  User.updateOne(
                    {
                        _id : req.params.userId
                    }
                    ,{ $set:  {name : req.body.name,email: req.body.email,  
                        profil: ""}}
                ).exec()
                res.status(200).json(updateStatus)
            }
          } catch(err) {
            console.error(err)
          }

       
    } catch (error) {
        res.status(400).json({message: error})
    }
})

//update delete info
router.patch('/info/delete/update/:userId',verify,async(req,res)=>{

    try {
        const user =await User.findById(req.params.userId)

        try {

            if((user.profil!= undefined && user.profil!= "")){
                fs.unlinkSync('./public/'+user.profil)
            }
            const updateStatus =  await  User.updateOne(
                {
                    _id : req.params.userId
                }
                ,{ $set:  {name : req.body.name,email: req.body.email,  profil: ""}}).exec()
            
            
                res.status(200).json(updateStatus)
            
          } catch(err) {
            console.error(err)
          }

       
    } catch (error) {
        res.status(400).json({message: error})
    }
})


router.use('/:userId/myaddresses',Address)
router.use('/:userId/mycarts',Cart)
router.use('/:userId/mywishlists',Wishlist)
router.use('/:userId/myratings',Rating)
router.use('/:userId/mynotifications',Notification)
router.use('/:userId/mynota',Nota)



module.exports = router;