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
app.options('*', cors())
app.use('/assets/uploads/categories/',express.static('public/assets/uploads/categories'));
app.use('/assets/uploads/products/',express.static('public/assets/uploads/products'));
app.use('/assets/uploads/item/',express.static('public/assets/uploads/item'));
app.use('/assets/uploads/notifications/',express.static('public/assets/uploads/notifications'));
app.use('/assets/uploads/topdeals/',express.static('public/assets/uploads/topdeals'));
app.use('/assets/uploads/user/',express.static('public/assets/uploads/user'));
app.use('/assets/uploads/nota/',express.static('public/assets/uploads/bukti/nota'));
app.use('/assets/uploads/daftar/',express.static('public/assets/uploads/bukti/daftar'));
app.use('/assets/uploads/video/',express.static('public/assets/uploads/video'));
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