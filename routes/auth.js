const router = require('express').Router();
const authController = require('./../controllers/auth');
const { body } = require('express-validator');
const User = require('./../models/User');

router.put('/signup', [
    body('name').isLength({ min: 2 }).withMessage('Please enter a valid name'),
    body('username').custom((value, { req }) => {
        return User.findByUsername(value).then((user) => {
            if (user) {
                return Promise.reject('User with that username already exists');
            }
        })
    }).isLength({ min: 1 }).withMessage('Please enter a username'),
    body('email').custom((value, { req }) => {
        return User.findByEmail(value).then((user) => {
            if (user) {
                return Promise.reject('User with that email already exists.');
            }
        })
    }).isEmail().withMessage('Please enter a valid email').normalizeEmail(),
    // body('password').isLength({ min: 8 }).withMessage('Password must be 8 characters').custom((value, { req }) => {
    //     if (value !== req.body.confirmPassword) {
            
    //     }
    // })
], authController.putSignup);

router.post('/login', authController.postLogin);

router.post('/request-reset-link', authController.postResetPasswordRequest);
router.post('/reset-password', authController.postResetPassword);

module.exports = router;