const express = require('express');
const router = express.Router();

console.log("다은 3");
//login
const login = require('./login');
router.use('/login',login);

//signup
const signup = require('./signup');
router.use('/signup', signup);

module.exports = router;