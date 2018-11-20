const express = require('express');
const router = express.Router();

//card
const history = require('./history');
router.use('/', history);

module.exports = router;