
const dotenv = require('dotenv')
dotenv.config();
//connection
module.exports.connect = process.env.DB_CONNECT

//firebase
var admin = require("firebase-admin");

var serviceAccount = require("./agenin-firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE
});

module.exports.admin = admin 

