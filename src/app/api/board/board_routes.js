const express = require('express');
const router = express.Router();

//list
const lists = require('./board');
router.use('/', lists);

module.exports = router;