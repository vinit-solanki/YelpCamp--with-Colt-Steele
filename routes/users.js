const express = require('express');
const router = express.Router();
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const user = require('../controllers/user');

router.get('/register', user.getUserRegistrationForm);
router.post('/register', user.registerUser);

router.get('/login', user.getLoginForm);
router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), user.loginUser)

router.get('/logout', user.logoutUser);

module.exports = router;