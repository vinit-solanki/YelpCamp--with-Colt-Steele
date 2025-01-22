const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');

module.exports.getUserRegistrationForm= (req,res)=>{
    res.render('users/register');
};
module.exports.registerUser = catchAsync(async (req,res)=>{
    try{
    const { email, username, password } = req.body;
    const user = new User({ email,username });
    const registeredUser = await User.register(user,password);
    console.log(registeredUser);
    req.login(registeredUser, err=>{
        if(err) return next(err);
        req.flash("success","Welcome to Yelp Camp");
        res.redirect('/campgrounds');    
    })
    } catch(err){
        req.flash('error', err.message);
        res.redirect('/register');
    }
});
module.exports.getLoginForm = (req,res)=>{
    res.render('users/login');
};
module.exports.loginUser = (req,res)=>{
    const { username, email, password } = req.body;
    req.flash('success', 'Welcome Back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
};
module.exports.logoutUser = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
};
