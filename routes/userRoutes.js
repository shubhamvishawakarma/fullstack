const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Signup route
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.post('/userprofile', userController.user_profile);

// Define routes
router.post('/categorycreate', userController.create_category);
router.get('/categoryget', userController.get_category);
router.post('/categoryupdate', userController.update_category);
router.delete('/categorydelete', userController.delete_category);

module.exports = router;
