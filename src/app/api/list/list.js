const express = require('express');
const router = express.Router();
const crypto = require('crypto-promise');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');
require('date-utils');

var dt = new Date();
var d = dt.toFormat('YYYY-MM-DD');

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

    const getUserQuery = 'SELECT user_name FROM CardIt.User WHERE user_idx = ?';
    const insertListQuery = 'INSERT INTO CardIt.List(board_idx,list_name,list_position_x,list_position_y) VALUES(?,?,?,?)';
    const insertHistoryQuery = 'INSERT INTO CardIt.History(board_idx,history_string,history_date) VALUES(?,?,?)';

    if(ID != -1){
        const user_name = await db.execute2(getUserQuery,ID);
        const result = await db.queryParam_Arr(insertListQuery, [board_idx,list_name,list_position_x,list_position_y]);
        if(!result){
            res.status(500).send({
                message: "Internel Server Error"
            });
        }
        else{
            const history_info= user_name[0].user_name + " added a " + list_name.toString() + " list";
            const history_result = await db.execute4(insertHistoryQuery,board_idx,history_info,d);
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

    const getUserQuery = 'SELECT user_name FROM CardIt.User WHERE user_idx = ?';
    const deleteListQuery = "DELETE FROM CardIt.List WHERE board_idx = ? AND list_idx = ?";
    const insertHistoryQuery = 'INSERT INTO CardIt.History(board_idx,history_string,history_date) VALUES(?,?,?)';

    if(ID != -1){
        const user_name = await db.execute2(getUserQuery,ID);
        const result = await db.execute3(deleteListQuery,board_idx,list_idx);
        if(!result){
            res.status(500).send({
                message: "Internel Server Error"
            });
        }
        else{
            const history_info= user_name[0].user_name + " deleted a " + list_name.toString() + " list";
            const history_result = await db.execute4(insertHistoryQuery,board_idx,history_info,d);
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
                message: "Internel Server Error"
            });
        }
        else{
            let list_name = req.body.list_name;

            if(!list_name){
                //console.log('hererere');
                name = getList[0].list_name;
            }

            let data = {
                list_name : list_name,
                list_position_x : req.body.list_position_x ? req.body.list_position_x : getList[0].list_position_x,
                list_position_y : req.body.list_position_y ? req.body.list_position_y : getList[0].list_position_y
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

// router.put('/:board_idx', async(req,res)=>{
//     const ID = jwt.verify(req.headers.authorization);
//     const board_idx = req.params.board_idx;

//     if(ID != -1){
//         let insertedList = req.body.insertedList;
//         let updatedList = req.body.updatedList;
//         let deletedList = req.body.deletedList;
//         let result;
//         let list_idx;

//         const getUserQuery = 'SELECT user_name FROM CardIt.User WHERE user_idx = ?';
//         const insertListQuery = 'INSERT INTO CardIt.List(board_idx, list_name, list_position_x, list_position_y) VALUES(?, ?, ?, ?);';
//         const insertCardQuery = 'INSERT INTO CardIt.Card(list_idx, card_name, card_end_date, card_order, card_content, card_mark) VALUES(?, ?, ?, ?, ?, 0);';
//         const insertedIdQuery = 'SELECT LAST_INSERT_ID() AS insertedId;';
//         const updateListQuery = 'UPDATE CardIt.List SET ? WHERE board_idx = ? AND list_idx = ?';
//         const deleteListQuery = 'DELETE FROM CardIt.List WHERE list_idx = ?';
//         const deleteCardQuery = 'DELETE FROM CardIt.Card WHERE list_idx = ?';
//         const insertHistoryQuery = 'INSERT INTO CardIt.History(board_idx, history_string) VALUES(?, ?)';

//         const user = await db.execute2(getUserQuery,ID);
//         const user_name = user[0].user_name;

//         let Break = new Error('Break');
//         let success = 1;
//         let history;

//         try{
//             insertedList.forEach(function(item) {
//                 result = await db.queryParam_Arr(insertListQuery, [board_idx, item.list_name, item.list_position_x, item.list_position_y]);
//                 if(!result) { res.status(500).send({ message: "Internel Server Error" }); success = 0; throw Break; }
//                 history = user_name + " insert a " + item.list_name.toString() + " list";
//                 result = await db.execute3(insertHistoryQuery, board_idx, history);
//                 if(!result) { res.status(500).send({ message: "Internel Server Error" }); success = 0; throw Break; }
                
//                 item.card.forEach(function(item) {
//                     const result = await db.queryParam_None(insertedIdQuery);
//                     list_idx = result[0].insertedId;

//                     result = await db.queryParam_Arr(insertCardQuery, [list_idx, item.card_name, item.card_end_date, item.card_order, item.card_content]);
//                     if(!result) { res.status(500).send({ message: "Internel Server Error" }); success = 0; throw Break; }

//                     history = user_name + " deleted a " + list_name.toString() + " card into " + item.list_name.toString() + " list";
//                     result = await db.execute3(insertHistoryQuery, board_idx, history);
//                     if(!result) { res.status(500).send({ message: "Internel Server Error" }); success = 0; throw Break; }
//                 });
//             });

//             updatedList.forEach(function(item) {
//                 let getUpdateList = await db.execute4(updateListQuery, data, board_idx, list_idx);
//             });

//             deletedList.forEach(function(item) {
//                 result = await db.execute2(deleteCardQuery, item.list_idx);
//                 if(!result) { res.status(500).send({ message: "Internel Server Error" }); success = 0; throw Break; }

//                 result = await db.execute2(deleteListQuery, item.list_idx);
//                 if(!result) { res.status(500).send({ message: "Internel Server Error" }); success = 0; throw Break; }

//             });
            
//             if(success == 1) {
//                 res.status(201).send({
//                     message: "Successful Update List"
//                 });
//             }
//         } catch (e) {
//             if(e != Break) throw Break;
//         }

//     } else {
//         res.status(403).send({
//             message: 'Access Denied'
//         });
//     }

// });

module.exports = router;