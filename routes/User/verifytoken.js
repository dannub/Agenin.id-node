const jwt = require('jsonwebtoken')

module.exports = function (req,res,next) {
    const bearerHeader = req.headers['authorization'];
    const bearer = bearerHeader.split(' ');

    const token = bearer[1] 
    if(!token) return res.status(401).send('Access Denied');

    try {
        const verified = jwt.verify(token,process.env.TOKEN_SECRET)
        req.user = verified;
        return next()
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
}