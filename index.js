const express = require('express');
const app = express();
const conn = require('./connection').connect
//const dotenv = require('dotenv')
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const cors = require('cors')


//Import Routes
const userRoute = require('./routes/User/User');
const categoryRoute = require('./routes/Category/Categories')
const productRoute = require('./routes/Product/Product')
const videoRoute = require('./routes/Video/Video')

//dotenv.config();

//Connect to DB
mongoose.connect(
    conn,
    {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        // useFindAndModify: false
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    },
    () => console.log('connected to DB')
);

//Middlewares
app.use(cors())
app.use('public/uploads/categories/',express.static('public/uploads/categories'));
app.use('public/uploads/products/',express.static('public/uploads/products'));
app.use('public/uploads/item/',express.static('public/uploads/item'));
app.use('public/uploads/notification/',express.static('public/uploads/notification'));
app.use('public/uploads/topdeals/',express.static('public/uploads/topdeals'));
app.use('public/uploads/user/',express.static('public/uploads/user'));
app.use('public/uploads/bukti/nota/',express.static('public/uploads/bukti/nota'));
app.use('public/uploads/bukti/daftar/',express.static('public/uploads/bukti/daftar'));
//app.use('/imgVideo/',express.static('public/uploads/video'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.json());

//Route Middlewares
app.use('/api/user',userRoute);
app.use('/api/video',videoRoute);
app.use('/api/categories',categoryRoute);
app.use('/api/products',productRoute);

app.listen(process.env.PORT || 8000, () => {
    console.log(`Server Up and running`);
});