const jwt = require('jsonwebtoken');

const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
    if(req.method === 'OPTIONS'){
        return next();
    }
    try{
        const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
        if(!token){
            throw new Error('Athentication failed!');
        }
        const decodedToken = jwt.verify(token, process.env.CLE_TOKEN);
        req.userData = {
            id : decodedToken.userId,
            email: decodedToken.email
        };
        next();
    }catch(err){
        const error = new HttpError(
            'Authentication failed!',
            403
        )
        return next(error);
    }

    
}