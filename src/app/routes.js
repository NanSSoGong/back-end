var express = require('express');
var router = express.Router();

console.log("다은 1");
const list = require('./api/list/list_routes');
router.use('/list',list);

console.log("다은 2");
const user = require('./api/user/user_routes');
router.use('/user', user);

module.exports = router;
