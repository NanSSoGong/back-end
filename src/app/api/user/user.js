const express = require('express');
const router = express.Router();
const crypto = require('crypto-promise');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');

//유저 가져오기
router.post('/:board_idx',async(req,res) =>{
    const ID = jwt.verify(req.headers.authorization);

    if(ID != -1){
        const board_idx = req.params.board_idx;
        const user_id = req.body.user_id;
        let getUserQuery, result;
        if (!user_id || user_id == "") { //아이디가 입력되지 않은 경우 전체 검색
            //getUserQuery = 'SELECT user_idx, user_name, user_id, user_phone, user_email FROM CardIt.User;';
            getUserQuery = 'SELECT T1.user_idx, T1.user_name, T1.user_id, T1.user_phone, T1.user_email FROM CardIt.User T1 LEFT JOIN (SELECT * FROM CardIt.Link WHERE board_idx = ?) T2 ON T1.user_idx = T2.user_idx WHERE T2.board_idx is null;';
        }
        else{ //아이디 전방 일치 검색
            //getUserQuery = "SELECT user_idx, user_name, user_id, user_phone, user_email FROM CardIt.User WHERE user_id LIKE '" + user_id + "%';";
            getUserQuery = "SELECT T1.user_idx, T1.user_name, T1.user_id, T1.user_phone, T1.user_email FROM CardIt.User T1 LEFT JOIN (SELECT * FROM CardIt.Link WHERE board_idx = ?) T2 ON T1.user_idx = T2.user_idx WHERE T2.board_idx is null AND T1.user_id LIKE '" + user_id + "%';";
        }
        result = await db.execute2(getUserQuery, board_idx);

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

//Share Board
router.put('/share/:board_idx', async(req,res)=>{
    const ID = jwt.verify(req.headers.authorization);

    if(ID != -1){
        const board_idx = req.params.board_idx;
        const user_idx = JSON.parse(req.body.user_idx);
        let values = [];
        if (!user_idx || !Array.isArray(user_idx)) {
            res.status(400).send({
                message: "Null Value!"
            });
        }
        else {
            const board_idx_int = parseInt(board_idx);
            user_idx.forEach(user => {
                values.push([user, board_idx_int, 0]);
            });
            // values.forEach(val => {
            //     console.log(val);
            // });

            const getListQuery = 'SELECT * FROM CardIt.Board WHERE board_idx = ?';
            const getList = await db.execute2(getListQuery, board_idx);

            if(!getList){
                res.status(500).send({
                    message: "Cannot Find The Board From DB"
                });
            } else{
                const insertQuery = 'INSERT INTO CardIt.Link(user_idx, board_idx, board_master) VALUES ?;';
                const insertResult = await db.execute2(insertQuery, [values]);

                if (!insertResult) {
                    res.status(404).send({message: "Fail To Share Board"});
                } else {
                    res.status(201).send({message: "Successful Share Board"});
                }
            }
        }
    } else{
        res.status(403).send({
            message: 'Access Denied'
        });
    }

});

module.exports = router;
