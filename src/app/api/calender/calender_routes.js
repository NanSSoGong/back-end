const express = require('express');
const router = express.Router();

//card
const history = require('./calender');
router.use('/', history);

module.exports = router;