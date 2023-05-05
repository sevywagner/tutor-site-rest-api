const User = require('./../models/User');

exports.getUsers = (req, res, next) => {
    User.fetchAllUsers().then((users) => {
        console.log(users);
        if (!users) {
            const error = new Error('Error fetching users');
            error.statusCode = 404;
            throw error;
        }

        // console.log(users);
        
        res.status(200).json({
            userList: users
        });
    }).catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}