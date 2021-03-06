const express = require('express');
const router = express.Router();


//login
const login = require('./login');
router.use('/login',login);

//signup
const signup = require('./signup');
router.use('/signup', signup);

//user
const user = require('./user');
router.use('/', user);

module.exports = router;