const express = require('express');
const router = express.Router();

//list
const list = require('./list');
router.use('/list', list);

module.exports = router;