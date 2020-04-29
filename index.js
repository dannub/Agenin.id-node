const express = require('express');
const app = express();
const dotenv = require('dotenv')
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const cors = require('cors')

//Import Routes
const authRoute = require('./routes/Auth/auth');
const postRoute = require('./routes/Post/posts')

dotenv.config();

//Connect to DB
mongoose.connect(
    process.env.DB_CONNECT,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    () => console.log('connected to DB')
);

//Middlewares
app.use(cors())
app.use(bodyParser.json());
app.use(express.json());

//Route Middlewares
app.use('/api/user',authRoute);
app.use('/api/posts',postRoute);

app.listen(8000, () => {
    console.log(`Server Up and running`);
});