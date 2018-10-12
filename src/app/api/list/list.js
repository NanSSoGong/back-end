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

    const getListQuery = 'SELECT list_idx, list_name, list_position_x, list_position_y FROM CardIt.List WHERE board_idx = ?';

    if(ID != -1){
        const result = await db.execute2(getListQuery,board_idx);
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

    const insertListQuery = 'INSERT INTO CardIt.List(board_idx,list_name,list_position_x,list_position_y) VALUES(?,?,?,?)';

    if(ID != -1){
        const result = await db.queryParam_Arr(insertListQuery, [board_idx,list_name,list_position_x,list_position_y]);
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

    const deleteListQuery = "DELETE FROM CardIt.List WHERE board_idx = ? AND list_idx = ?";

    if(ID != -1){
        const result = await db.execute3(deleteListQuery,board_idx,list_idx);
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

//리스트 수정하기
router.put('/:board_idx/:list_idx', async(req,res)=>{
    const ID = jwt.verify(req.headers.authorization);
    const board_idx = req.params.board_idx;
    const list_idx = req.params.list_idx;

    const getListQuery = 'SELECT * FROM CardIt.List WHERE board_idx = ? AND list_idx = ?';
    const updateListQuery = 'UPDATE CardIt.List SET ? WHERE board_idx = ? AND list_idx = ?';

    if(ID != -1){
        let getList = await db.execute3(getListQuery,board_idx,list_idx);
        console.log('getList : ' + getList);
        if(!getList){
            res.status(500).send({
                message: "Internel Server Error",
                data : getList
            });
        }
        else{
            let list_name = req.body.list_name;

            if(!list_name){
                console.log('hererere');
                name = getList[0].list_name;
            }

            let data = {
                list_name : list_name,
                list_position_x : req.body.list_position_x ? req.body.list_position_x : getList[0].list_position_x
            };

            let getUpdateList = await db.execute4(updateListQuery,data,board_idx,list_idx);

            if (getUpdateList.length == 0) {
                res.status(404).send({
                    message: "Fail Update List",
                    data: null
                });
            } else {
                getList = await db.execute3(getListQuery,board_idx,list_idx);
                res.status(201).send({
                    message: "Successful Update List",
                    data: getList
                });
            }
        }
    }else{
        res.status(403).send({
            message: 'Access Denied'
        });
    }

});

module.exports = router;