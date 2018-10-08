var express = require('express');
var router = express.Router();

const user = require('./api/user/user_routes');
router.use('/',user);

module.exports = router;