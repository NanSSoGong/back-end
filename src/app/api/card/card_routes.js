const express = require('express');
const router = express.Router();

//card
const cards = require('./card');
router.use('/', cards);

module.exports = router;