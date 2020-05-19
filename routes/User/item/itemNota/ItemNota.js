const router = require('express').Router({mergeParams: true})
const verify = require('../../../User/verifytoken')


const mongoose = require('mongoose');

const ItemNota = require('../../../../model/User/item/ItemNota/ItemNota')
const {getDate,isHex} = require('../../../../validation')


const User = require('../../../../model/User/User')






//SUBMITS A Wishlist
router.post('/create',verify,async(req,res)=>{



    var  itemNota= new ItemNota({
        product_ID: req.body.product_ID,
        jumlah: req.body.jumlah,
        ongkir: req.body.ongkir,
        })


        try {
             await User.updateOne(
                {
                    _id :  mongoose.Types.ObjectId(req.params.userId),
                    "my_nota._id" :  mongoose.Types.ObjectId(req.params.notaId)
                },
                { $push: { "my_nota.$.items": itemNota } }
                ,{ multi: true }
            ) .exec(async(err, result) => {
                if (err) throw res.status(400).json({message: err});
                res.status(200).json(result)
            })
          
        } catch (error) {
            res.status(400).json({message: error})
        }

    
   
})




module.exports = router