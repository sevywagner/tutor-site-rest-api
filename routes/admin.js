const router = require('express').Router();
const adminController = require('./../controllers/admin');

router.get('/get-users', adminController.getUsers);

module.exports = router;