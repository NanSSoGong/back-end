const express = require('express');
const router = express.Router();
const crypto = require('crypto-promise');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');

//get, put, post, delete

//리스트 가져오기
router.get('/:board_idx',async(req,res) =>{
    const ID = jwt.verify(req.headers.authorization);
    const board_idx = req.params.board_idx;

    const getList = 'SELECT list_idx, list_name, list_position_x, list_position_y FROM CardIt.List WHERE board_idx = ?';

    if(ID != -1){
        const result = await db.execute2(getList,board_idx);
        if(!result){
            res.status(500).send({
                message: "Internel Server Error"
            });
        }
        else{
            res.status(201).send({
                message: "Successful Get List",
                data : result
            });
        }
    }else{
        res.status(403).send({
            message: 'Access Denied'
        });
    }
});

//리스트 등록하기
router.post('/:board_idx',async(req, res) =>{
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

//리스트 삭제하기
router.delete('/:board_idx/:list_idx', async(req,res)=> {
    const ID = jwt.verify(req.headers.authorization);
    const board_idx = req.params.board_idx;
    const list_idx = req.params.list_idx;

    const deleteList = "DELETE FROM CardIt.List WHERE board_idx = ? AND list_idx = ?";

    if(ID != -1){
        const result = await db.execute3(deleteList,board_idx,list_idx);
        if(!result){
            res.status(500).send({
                message: "Internel Server Error"
            });
        }
        else{
            res.status(201).send({
                message: "Successful Delete List"
            });
        }
    }else{
        res.status(403).send({
            message: 'Access Denied'
        });
    }

});

module.exports = router;