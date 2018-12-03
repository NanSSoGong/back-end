const express = require('express');
const router = express.Router();
const crypto = require('crypto-promise');
const db = require('../../module/pool.js');

//유저 가져오기
router.get('/',async(req,res) =>{
    const ID = jwt.verify(req.headers.authorization);

    if(ID != -1){
        const user_id = req.body.user_id;
        let getUserQuery, result;
        if (!user_id || user_id == "") {
            getUserQuery = 'SELECT * FROM CardIt.User';
            result = await db.execute1(getUserQuery);
        }
        else{
            getUserQuery = 'SELECT * FROM CardIt.User WHERE user_id = ?;';
            result = await db.execute2(getUserQuery, user_id);
        }

        if(!result){
            res.status(500).send({
                message: "Internel Server Error"
            });
        }
        else{
            res.status(201).send({
                message: "Successful Get User",
                data : result
            });
        }
    }else{
        res.status(403).send({
            message: 'Access Denied'
        });
    }
});

module.exports = router;
