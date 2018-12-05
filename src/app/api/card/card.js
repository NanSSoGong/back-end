const express = require('express');
const router = express.Router();
const crypto = require('crypto-promise');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');
require('date-utils');

var dt = new Date();
var d = dt.toFormat('YYYY-MM-DD');

//Get Card List
router.get('/:board_idx',async(req,res) =>{
    const ID = jwt.verify(req.headers.authorization);

    if(ID != -1){
        const board_idx = req.params.board_idx;

        const getListQuery = 'SELECT * FROM CardIt.Card T1 RIGHT JOIN CardIt.List T2 ON T1.list_idx = T2.list_idx WHERE T2.board_idx = ? ORDER BY T2.list_idx;';
        const result = await db.execute2(getListQuery, board_idx);
        if(!result){
            res.status(500).send({message: "Internel Server Error"});
        } else{
            res.status(201).send({
                message: "Successful Get Card",
                data : result
            });
        }
    }else{
        res.status(403).send({message: 'Access Denied'});
    }
});

//Add Card
router.post('/:board_idx/:list_idx', async (req, res) =>{
    const ID = jwt.verify(req.headers.authorization);

    if(ID != -1){
        const board_idx = req.params.board_idx;
        const list_idx = req.params.list_idx;
        const card_name = req.body.card_name;
        const card_end_date = !req.body.card_end_date ? null : req.body.card_end_date;
        const card_order = !req.body.card_order ? 1 : req.body.card_order;
        const card_content = !req.body.card_content ? null : req.body.card_content;
        //get user name
        const getUserQuery = 'SELECT user_name FROM CardIt.User WHERE user_idx = ?';
        const user_name = await db.execute2(getUserQuery,ID);

        if (!list_idx || !card_name) {
            res.status(400).send({
                message : "Null Value"
            });
        } else {
            const insertQuery = 'INSERT INTO CardIt.Card(list_idx, card_name, card_end_date, card_order, card_content, card_mark) VALUES(?, ?, ?, ?, ?, 0);';
            const insertResult = await db.queryParam_Arr(insertQuery, [list_idx, card_name, card_end_date, card_order, card_content]);
            //insert history
            const insertHistoryQuery = 'INSERT INTO CardIt.History(board_idx,history_string,history_date) VALUES(?,?,?)';

            if(!insertResult){
                res.status(500).send({message : "Internal Server Error"});
            } else{
                const history_info= user_name[0].user_name + " added a " + card_name.toString() + " card";
                const history_result = await db.execute4(insertHistoryQuery,board_idx,history_info,d);
                res.status(201).send({message : "Successful Add Card", card_idx : insertResult.insertId});
            }
        }
    } else{
        res.status(403).send({
            message: 'Access Denied'
        });
    }
})

//Delete Card
router.delete('/:board_idx/:card_idx', async(req,res)=> {
    const ID = jwt.verify(req.headers.authorization);
    const getUserQuery = 'SELECT user_name FROM CardIt.User WHERE user_idx = ?';
    const insertHistoryQuery = 'INSERT INTO CardIt.History(board_idx,history_string,history_date) VALUES(?,?,?)';

    if(ID != -1){
        const user_name = await db.execute2(getUserQuery,ID);
        const board_idx = req.params.board_idx;
        const card_idx = req.params.card_idx;
        const deleteListQuery = "DELETE FROM CardIt.Card WHERE card_idx = ?";
        const getCardNameQuery = "SELECT card_name FROM CardIt.Card WHERE card_idx = ?";
        const deleteResult = await db.execute3(deleteListQuery, card_idx);
        const card_name = await db.execute2(getCardNameQuery,card_idx);

        if(!deleteResult){
            res.status(500).send({message: "Internel Server Error"});
        } else{
            const history_info= user_name[0].user_name + " deleted a " + card_name.toString() + " card";
            const history_result = await db.execute4(insertHistoryQuery,board_idx,history_info,d);
            res.status(201).send({message: "Successful Delete Card"});
        }
    }else{
        res.status(403).send({
            message: 'Access Denied'
        });
    }

});

//Edit Card
router.put('/:board_idx/:list_idx/:card_idx', async(req,res)=>{
    const ID = jwt.verify(req.headers.authorization);

    if(ID != -1){
        const list_idx = req.params.list_idx;
        const card_idx = req.params.card_idx;
        const card_name = req.body.card_name;
        const card_end_date = !req.body.card_end_date ? null : req.body.card_end_date;
        const card_content = !req.body.card_content ? null : req.body.card_content;
        const card_order = !req.body.card_order ? 1 : req.body.card_order;
        const card_mark = !req.body.card_mark ? 0 : req.body.card_mark;
    
        if (!list_idx || !card_idx || !card_name) {
            res.status(400).send({
                message : "Null Value"
            });
        } else {
            const updateQuery = 'UPDATE CardIt.Card SET list_idx = ?, card_name = ?, card_end_date = ?, card_order = ?, card_content = ?, card_mark = ? WHERE card_idx = ?;';
            const updateResult = await db.queryParam_Arr(updateQuery, [list_idx, card_name, card_end_date, card_order, card_content, card_mark, card_idx]);

            if(!updateResult){
                res.status(404).send({message: "Fail To Update Card"});
            } else {
                res.status(201).send({message: "Successful Update Card"});
            }
        }
    } else{
        res.status(403).send({
            message: 'Access Denied'
        });
    }

});

module.exports = router;
