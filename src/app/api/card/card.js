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
        const card_mark = !req.body.card_mark ? 0 : req.body.card_mark;
        //get user name
        const getUserQuery = 'SELECT user_name FROM CardIt.User WHERE user_idx = ?';
        const user_name = await db.execute2(getUserQuery,ID);

        if (!list_idx || !card_name) {
            res.status(400).send({
                message : "Null Value"
            });
        } else {
            const insertQuery = 'INSERT INTO CardIt.Card(list_idx, card_name, card_end_date, card_order, card_content, card_mark) VALUES(?, ?, ?, ?, ?, ?);';
            const insertResult = await db.queryParam_Arr(insertQuery, [list_idx, card_name, card_end_date, card_order, card_content, card_mark]);
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
        const new_list_idx = req.body.new_list_idx;
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
            const updateResult = await db.queryParam_Arr(updateQuery, [new_list_idx, card_name, card_end_date, card_order, card_content, card_mark, card_idx]);

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

//Edit Card Order
router.put('/order/:card_idx', async(req,res)=>{
    const ID = jwt.verify(req.headers.authorization);

    if(ID != -1){
        const card_idx = req.params.card_idx;
        const ori_list_idx = req.body.ori_list_idx;
        const new_list_idx = req.body.new_list_idx;
        const ori_order = req.body.ori_order;
        const new_order = req.body.new_order;

        console.log(ori_list_idx);
        console.log(new_list_idx);
        console.log(ori_order);
        console.log(new_order);
        if (!card_idx || !ori_list_idx || !new_list_idx || !ori_order || !new_order) {
            res.status(400).send({
                message : "Null Value"
            });
        } else {
            const updateFromCardQuery = "Update CardIt.Card SET card_order = card_order - 1 WHERE list_idx = ? AND card_order > ?;";
            const updateFromResult = await db.execute3(updateFromCardQuery, ori_list_idx, ori_order);

            const updateToCardQuery = "Update CardIt.Card SET card_order = card_order + 1 WHERE list_idx = ? AND card_order >= ?;";
            const updateToResult = await db.execute3(updateToCardQuery, new_list_idx, new_order);

            const updateMoveCardQuery = "Update CardIt.Card SET list_idx = ?, card_order = ? WHERE card_idx = ?;";
            const updateMoveResult = await db.execute4(updateMoveCardQuery, new_list_idx, new_order, card_idx);

            console.log(updateToResult);
            console.log(updateMoveResult);
            console.log(updateFromResult);
            if(!updateToResult || !updateMoveResult || !updateFromResult || updateMoveResult.affectedRows == 0){
                res.status(500).send({message: "Fail To Update Card Order"});
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
