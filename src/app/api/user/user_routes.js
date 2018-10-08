const express = require('express');
const router = express.Router();

//login
router.use('/login', require('./login.js'));

//signup
router.use('/signup', require('./signup.js'));

module.exports = router;
