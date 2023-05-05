const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { createTransport } = require('nodemailer');
const User = require('./../models/User');

const transport = createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'sevywagner@gmail.com',
        pass: process.env.TRANSPORT_PASS
    }
});

exports.putSignup = (req, res, next) => {
    const name = req.body.name;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error(errors.array()[0].msg);
        error.statusCode = 422;
        throw error;
    }

    bcrypt.hash(password, 12).then((hash) => {
        const user = new User(name, username, email, hash);
        return user.save();
    }).then((result) => {
        res.status(201).json({
            message: 'Successfully created user',
            result: result
        });
    }).catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        next(err);
    });
}

exports.postLogin = (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    let targetUser;
    User.findByUsername(username).then((user) => {
        if (!user) {
            const error = new Error('User with that username does not exist');
            error.statusCode = 422;
            throw error;
        }

        targetUser = user;

        return bcrypt.compare(password, user.password);
    }).then((doesMatch) => {
        if (doesMatch) {
            const token = jwt.sign({
                userId: targetUser._id
            }, process.env.JWTSECRET);
    
            res.status(200).json({
                message: 'Logged in',
                token: token,
                expiration: new Date().getTime() + 3600000
            });
        } else {
            res.status(401).json({
                message: 'Incorrect password'
            })
        }
    }).catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        next(err);
    })
}

exports.postResetPasswordRequest = (req, res, next) => {
    const email = req.body.email;

    const token = crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            const error = new Error('Error creating token');
            error.statusCode = 500;
            throw err;
        }

        const token = buffer.toString('hex');
        const expiration = new Date().getTime() + 3600000;

        User.findByEmail(email).then((user) => {
            const updatedUser = new User(user.name, user.username, user.email, user.password, token, expiration, user._id);

            updatedUser.updateResetToken().then((result) => {
                console.log(result);
                transport.sendMail({
                    to: email,
                    from: 'sevywagner@gmail.com',
                    subject: 'Reset Password Sevy Tutoring Site',
                    html: `<a href="http://localhost:3000/reset-password/${token}">Click here to reset password</a>`
                });
                
                res.status(200).json({
                    message: 'Updated user'
                });
            }).catch((err) => {
                if (!err.statusCode) {
                    err.statusCode = 500;
                }
        
                next(err);
            })
        })
    })
}

exports.postResetPassword = (req, res, next) => {
    const password = req.body.password;
    const token = req.body.resetToken;

    console.log(token);

    let userData;
    User.findByToken(token).then((user) => {
        if (!user) {
            const error = new Error('Problem fetching user');
            error.statusCode = 500;
            throw error;
        }

        if (user.resetTokenExpiration - new Date().getTime() < 10) {
            const error = new Error('Token is expired');
            error.statusCode = 422;
            throw error;
        }

        userData = user;
        return bcrypt.hash(password, 12);
    }).then((hash) => {
        const updatedUser = new User(userData.name, userData.username, userData.email, hash, userData.resetToken, userData.resetTokenExpiration, userData._id);

        return updatedUser.resetPassword();
    }).then(() => {
        res.status(200).json({
            message: 'Reset password'
        });
    }).catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }

        next(err);
    });
}