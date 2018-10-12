const express = require('express');
const router = express.Router();
const crypto = require('crypto-promise');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');

//get, put, post, delete

//리스트 등록하기
router.post('/:board_idx',async(req, res) =>{
    console.log('here');
    const ID = jwt.verify(req.headers.authorization);

    const board_idx = req.params.board_idx;
    const list_name = req.body.list_name;
    const list_position_x = req.body.list_position_x;
    const list_position_y = req.body.list_position_y;

    const insertList = 'INSERT INTO CardIt.List(board_idx,list_name,list_position_x,list_position_y) VALUES(?,?,?,?)';

    if(ID != -1){
        const result = await db.queryParam_Arr(insertList, [board_idx,list_name,list_position_x,list_position_y]);
        if(!result){
            res.status(500).send({
                message: "Internel Server Error"
            });
        }
        else{
            res.status(201).send({
                message: "Successful Post List"
            });
        }
    }else{
        res.status(403).send({
            message: 'Access Denied'
        });
    }
});

module.exports = router;