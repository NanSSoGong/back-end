var express = require('express');
var router = express.Router();

const list = require('./api/list/list_routes');
router.use('/list',list);

const user = require('./api/user/user_routes');
router.use('/user', user);

const board = require('./api/board/board_routes');
router.use('/board', board);

module.exports = router;
