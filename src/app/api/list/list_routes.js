const express = require('express');
const router = express.Router();

//list
const lists = require('./list');
router.use('/', lists);

module.exports = router;