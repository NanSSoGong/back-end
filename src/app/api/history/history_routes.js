const express = require('express');
const router = express.Router();

//history
const history = require('./history');
router.use('/', history);

module.exports = router;