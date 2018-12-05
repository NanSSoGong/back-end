const express = require('express');
const router = express.Router();
const crypto = require('crypto-promise');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');
require('date-utils');

var dt = new Date();
var d = dt.toFormat('YYYY-MM-DD');

//Get Board List
router.get('/:user_idx',async(req,res) =>{
    const ID = jwt.verify(req.headers.authorization);

    if(ID != -1){
        const user_idx = req.params.user_idx;

        const getListQuery = 'SELECT T1.*, T2.board_master FROM CardIt.Board T1 LEFT JOIN CardIt.Link T2 ON T1.board_idx = T2.board_idx WHERE T2.user_idx = ?';
        const result = await db.execute2(getListQuery, user_idx);
        if(!result){
            res.status(500).send({message: "Internel Server Error"});
        } else{
            res.status(201).send({
                message: "Successful Get Board",
                data : result
            });
        }
    }else{
        res.status(403).send({message: 'Access Denied'});
    }
});

//Add Board
router.post('/:user_idx', async (req, res) =>{
    const ID = jwt.verify(req.headers.authorization);

    if(ID != -1){
        const user_idx = req.params.user_idx;
        const board_name = req.body.board_name;
        const board_background = !req.body.board_background ? 'null' : req.body.board_background;
        const getUserQuery = 'SELECT user_name FROM CardIt.User WHERE user_idx = ?';
        console.log("시각 : "+ d);
        
        if (!user_idx || !board_name) {
            res.status(400).send({
                message : "Null Value"
            });
        } else {
            //Check Duplication
            const checkQuery = "SELECT Count(*) AS count FROM CardIt.Board T1 LEFT JOIN CardIt.Link T2 ON T1.board_idx = T2.board_idx WHERE T1.board_name = ? AND T2.user_idx = ?";
            const insertHistoryQuery = 'INSERT INTO CardIt.History(board_idx,history_string,history_date) VALUES(?,?,?)';
            const checkResult = await db.execute3(checkQuery, board_name, user_idx);

            const user_name = await db.execute2(getUserQuery,ID);

            if(!checkResult){
                res.status(500).send({mesaage : "Internal Server Error1"});
            } else if(checkResult[0].count > 0){
                res.status(400).send({message : board_name + " board is already exist."});
            } else{
                let board_idx;
                const insertQuery = 'INSERT INTO CardIt.Board(board_name, board_background) VALUES(?, ?);';
                const insertResult = await db.execute3(insertQuery, board_name, board_background);

                if(!insertResult){
                    res.status(500).send({message : "Internal Server Error2"});
                } else{
                    const checkQuery = 'SELECT LAST_INSERT_ID() AS insertedId;';
                    const result = await db.queryParam_None(checkQuery);
                    board_idx = result[0].insertedId;

                    const insertQuery = 'INSERT INTO CardIt.Link(user_idx, board_idx, board_master) VALUES(?, ?, ?);';
                    const insertResult = await db.execute4(insertQuery, user_idx, board_idx, 1);
                    
                    if(!insertResult){
                        res.status(500).send({message : "Internal Server Error3"});
                    } else{
                        const history_info= user_name[0].user_name + " created a " + board_name.toString() + " board";
                        console.log(d);
                        console.log(board_idx);
                        const history_result = await db.execute4(insertHistoryQuery,board_idx,history_info,d);
                        if(!history_result) console.log("history fail");
                        res.status(201).send({message : "Successful Add Board"});
                    }
                }
            }
        }
    } else{
        res.status(403).send({
            message: 'Access Denied'
        });
    }
})

//Delete Board
router.delete('/:user_idx/:board_idx/:board_master', async(req,res)=> {
    const ID = jwt.verify(req.headers.authorization);

    if(ID != -1){
        const user_idx = req.params.user_idx;
        const board_idx = req.params.board_idx;
        const board_master = req.params.board_master;

        const insertHistoryQuery = 'INSERT INTO CardIt.History(board_idx,history_string,history_date) VALUES(?,?,?)';
        const getUserQuery = 'SELECT user_name FROM CardIt.User WHERE user_idx = ?';
        const getBoardName = 'SELECT board_name FROM CardIt.Board WHERE board_idx = ?';
        const user_name = await db.execute2(getUserQuery,ID);
        const board_name = await db.execute2(getBoardName, board_idx);

        if(board_master == 1){
            //Delete From Board Master(Delete)
            const deleteListQuery1 = "DELETE FROM CardIt.Link WHERE board_idx = ?;";
            const deleteListQuery2 = "DELETE FROM CardIt.Board WHERE board_idx = ?;";
            const deleteResult1 = await db.execute2(deleteListQuery1, board_idx);
            const deleteResult2 = await db.execute2(deleteListQuery2, board_idx);

            if(!deleteResult1 || !deleteResult2){
                res.status(500).send({message: "Internel Server Error"});
            } else{
                const history_info= user_name[0].user_name + " deleted a " + board_name.toString() + " board";
                const history_result = await db.execute4(insertHistoryQuery,board_idx,history_info,d);
                res.status(201).send({message: "Successful Delete List"});
            }
        } else {
            //Delete From Shared User(Unshare)
            const deleteListQuery = "DELETE FROM CardIt.Link WHERE user_idx = ? AND board_idx = ?";
            const deleteResult = await db.execute3(deleteListQuery, user_idx, board_idx);
    
            if(!deleteResult){
                res.status(500).send({message: "Internel Server Error"});
            } else{
                res.status(201).send({message: "Successful Delete Board"});
            }
        }
    }else{
        res.status(403).send({
            message: 'Access Denied'
        });
    }

});

//Edit Board
router.put('/:board_idx/:user_idx', async(req,res)=>{
    const ID = jwt.verify(req.headers.authorization);

    if(ID != -1){
        const board_idx = req.params.board_idx;
        const user_idx = req.params.user_idx;
    
        const getListQuery = 'SELECT * FROM CardIt.Board WHERE board_idx = ?';
        const getListResult = await db.execute2(getListQuery, board_idx);

        if(!getListResult){
            res.status(500).send({message: "Cannot Find The Board From DB"});
        } else{
            //Check Duplication
            const board_name = req.body.board_name;
            const board_background = req.body.board_background;

            const checkQuery = "SELECT COUNT(ST.board_idx) AS 'count' FROM CardIt.Board T LEFT JOIN ( SELECT T1.board_idx FROM CardIt.Board T1 LEFT JOIN CardIt.Link T2 ON T1.board_idx = T2.board_idx WHERE T1.board_idx <> ? AND T1.board_name = ? AND T2.user_idx = ? ) ST ON ST.board_idx = T.board_idx GROUP BY ST.board_idx;";
            const checkResult = await db.execute4(checkQuery, board_idx, board_name, user_idx);

            if(!checkResult){
                res.status(500).send({message : "Cannot Find The Board From DB"});
            } else if(checkResult[0].count != 0){
                res.status(400).send({message : board_name + " is already exist."});
            } else {
                //Update Board
                let data = {
                    board_name : board_name,
                    board_background : board_background
                };
                const updateListQuery = 'UPDATE CardIt.Board SET ? WHERE board_idx = ?';
                let getUpdateList = await db.execute3(updateListQuery, data, board_idx);
    
                if (getUpdateList.length == 0) {
                    res.status(404).send({message: "Fail To Update Board"});
                } else {
                    res.status(201).send({message: "Successful Update Board"});
                }
            }
        }
    } else{
        res.status(403).send({
            message: 'Access Denied'
        });
    }

});

//Share Board
router.link('/:user_idx/:board_idx', async(req,res)=>{
    const ID = jwt.verify(req.headers.authorization);

    if(ID != -1){
        const user_idx = req.params.user_idx;
        const board_idx = req.params.board_idx;
    
        const insertHistoryQuery = 'INSERT INTO CardIt.History(board_idx,history_string,history_date) VALUES(?,?,?)';
        const getListQuery = 'SELECT * FROM CardIt.Board WHERE board_idx = ?';
        const getUsernameQuery = 'SELECT user_name FROM CardIt.User where user_idx=?;';
        const getList = await db.execute2(getListQuery, board_idx);
        const user_name = await db.execute2(getUsernameQuery, user_idx);
        const my_name = await db.execute2(getUsernameQuery,ID);

        if(!getList){
            res.status(500).send({
                message: "Cannot Find The Board From DB"
            });
        } else{
            const insertQuery = 'INSERT INTO CardIt.Link(user_idx, board_idx, board_master) VALUES(?, ?, 0);';
            const insertResult = await db.execute3(insertQuery, user_idx, board_idx);

            if (!insertResult) {
                const history_info=  my_name[0].user_name + " invited a "+ user_name[0].user_name;
                const history_result = await db.execute4(insertHistoryQuery,board_idx,history_info,d);
                res.status(404).send({message: "Fail To Share Board"});
                
            } else {
                res.status(201).send({message: "Successful Share Board"});
            }
        }
    } else{
        res.status(403).send({
            message: 'Access Denied'
        });
    }

});

module.exports = router;
