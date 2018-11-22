var express = require('express');
var router = express.Router();

const list = require('./api/list/list_routes');
router.use('/list',list);

const user = require('./api/user/user_routes');
router.use('/user', user);

const board = require('./api/board/board_routes');
router.use('/board', board);

const card = require('./api/card/card_routes');
router.use('/card', card);

const calender = require('./api/calender/calender_routes');
router.use('/calender', calender);

const history = require('./api/history/history_routes');
router.use('/history', history);

module.exports = router;
