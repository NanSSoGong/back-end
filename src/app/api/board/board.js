const express = require('express');
const router = express.Router();
const crypto = require('crypto-promise');
const db = require('../../module/pool.js');

//Get Board List
router.get('/:user_idx',async(req,res) =>{
    const ID = jwt.verify(req.headers.authorization);

    if(ID != -1){
        const user_idx = req.params.user_idx;

        const getListQuery = 'SELECT T1.*, T2.master FROM CardIt.Board T1 LEFT JOIN CardIt.Link T2 ON T1.board_idx = T2.board_idx WHERE T2.user_idx = ?';
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
        const board_background = req.body.board_background;

        if (!user_idx || !board_name || !board_background) {
            res.status(400).send({
                message : "Null Value"
            });
        } else {
            //Check Duplication
            const checkQuery = 'SELECT * FROM Cardit.Board WHERE board_name = ? AND user_idx = ?';
            const checkResult = await db.execute3(checkQuery, board_name, user_idx);

            if(!checkResult){
                res.status(500).send({mesaage : "Internal Server Error"});
            } else if(checkResult.length == 1){
                res.status(400).send({message : checkResult[0].board_name + " is already exist."});
            } else{
                let board_idx;
                const insertQuery = 'INSERT INTO Cardit.Board(board_name, board_background) VALUES(?, ?);';
                const insertResult = await db.queryParamWithFunc(insertQuery, [board_name, board_background], function(err, result) {
                    if (err) throw err;
                    board_idx =  result.insertId;
                });

                if(!insertResult){
                    res.status(500).send({message : "Internal Server Error"});
                } else{
                    const insertQuery = 'INSERT INTO Cardit.Link(user_idx, board_idx, master) VALUES(?, ?, ?);';
                    const insertResult = await db.execute4(insertQuery, user_idx, board_idx, 1);
                    
                    if(!insertResult){
                        res.status(500).send({message : "Internal Server Error"});
                    } else{
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

        if(board_master){
            //Delete From Board Master(Delete)
            const deleteListQuery = "DELETE FROM CardIt.Link WHERE board_idx = ?; DELETE FROM CardIt.Board WHERE board_idx = ?;";
            const deleteResult = await db.execute3(deleteListQuery, board_idx, board_idx);

            if(!deleteResult){
                res.status(500).send({message: "Internel Server Error"});
            } else{
                res.status(201).send({message: "Successful Delete List"});
            }
        } else{
            //Delete From Shared User(Unshare)
            const deleteListQuery = "DELETE FROM Cardit.Link WHERE user_idx = ? AND board_idx = ?";
            const deleteResult = await db.execute3(deleteListQuery, user_idx, board_idx);
    
            if(!deleteResult){
                res.status(500).send({message: "Internel Server Error"});
            } else{
                res.status(201).send({message: "Successful Delete List"});
            }
        }
    }else{
        res.status(403).send({
            message: 'Access Denied'
        });
    }

});

//Edit Board
router.put('/:board_idx', async(req,res)=>{
    const ID = jwt.verify(req.headers.authorization);

    if(ID != -1){
        const board_idx = req.params.board_idx;
    
        const getListQuery = 'SELECT * FROM CardIt.Board WHERE board_idx = ?';
        const getListResult = await db.execute2(getListQuery, board_idx);

        if(!getListResult){
            res.status(500).send({message: "Cannot Find The Board From DB"});
        } else{
            //Check Duplication
            const board_name = req.body.board_name;
            const board_background = req.body.board_background;

            const checkQuery = 'SELECT COUNT(T1.board_idx) AS \'count\' FROM CardIt.Board T1 LEFT JOIN CardIt.Link T2 ON T1.board_idx = T2.board_idx WHERE T1.board_name = ? AND T2.user_idx = ? GROUP BY T1.board_idx;';
            const checkResult = await db.execute2(checkQuery, board_idx);

            if(!checkResult){
                res.status(500).send({message : "Cannot Find The Board From DB"});
            } else if(!checkResult[0].count){
                res.status(400).send({message : board_name + " is already exist."});
            } else{
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
                    res.status(201).send({message: "Successful Update List"});
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
router.subscribe('/:user_idx/:board_idx', async(req,res)=>{
    const ID = jwt.verify(req.headers.authorization);

    if(ID != -1){
        const user_idx = req.params.user_idx;
        const board_idx = req.params.board_idx;
    
        const getListQuery = 'SELECT * FROM CardIt.Board WHERE board_idx = ?';
        const getList = await db.execute2(getListQuery, board_idx);

        if(!getList){
            res.status(500).send({
                message: "Cannot Find The Board From DB"
            });
        } else{
            const insertQuery = 'INSERT INTO Cardit.Link(user_idx, board_idx, master) VALUES(?, ?, ?);';
            const insertResult = await db.execute4(insertQuery, user_idx, board_idx, 0);

            if (!insertResult) {
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
