const express = require('express');
const router = express.Router();

//board
const boards = require('./board');
router.use('/', boards);

module.exports = router;