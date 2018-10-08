var express = require('express');
var router = express.Router();

router.use('/api/user', require('./api/user/user_routes.js'));

module.exports = router;