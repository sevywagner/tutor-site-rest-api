const jwt = require('jsonwebtoken');
const mongo = require('mongodb');

const isAuth = (req, res, next) => {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
        const error = new Error('No auth header');
        error.statusCode = 422;
        throw error;
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;

    try {
        decodedToken = jwt.decode(token, process.env.JWTSECRET);
    } catch(err) {
        err.statusCode = 500;
        throw err;
    }

    // console.log(decodedToken.userId === process.env.ADMIN_ID);

    req.isAdmin = decodedToken.userId === process.env.ADMIN_ID ? true : false;
    req.userId = decodedToken.userId;
    next();
}

module.exports = isAuth;