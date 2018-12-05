const express = require('express');
const router = express.Router();
const crypto = require('crypto-promise');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');

//유저 가져오기
router.post('/',async(req,res) =>{
    const ID = jwt.verify(req.headers.authorization);

    if(ID != -1){
        const user_id = req.body.user_id;
        let getUserQuery, result;
        if (!user_id || user_id == "") { //아이디가 입력되지 않은 경우 전체 검색
            getUserQuery = 'SELECT user_idx, user_name, user_id, user_phone, user_email FROM CardIt.User;';
            result = await db.execute1(getUserQuery);
        }
        else{ //아이디 전방 일치 검색
            getUserQuery = "SELECT user_idx, user_name, user_id, user_phone, user_email FROM CardIt.User WHERE user_id LIKE '" + user_id + "%';";
            result = await db.execute1(getUserQuery);
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
