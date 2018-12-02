const express = require('express');
const router = express.Router();
const crypto = require('crypto-promise');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');

//Get Card in Home in user
router.get('/',async(req,res) =>{
    const ID = jwt.verify(req.headers.authorization);
    const card_end_date = req.body.card_end_date;
    if(ID != -1){
        const getCardQuery = 'SELECT card_name, list_name, board_name, card_mark, card_end_date FROM CardIt.Card a INNER JOIN CardIt.List b on a.list_idx = b.list_idx INNER JOIN CardIt.Board c on b.board_idx = c.board_idx INNER JOIN CardIt.Link d on d.board_idx = c.board_idx where d.user_idx = ? AND a.card_end_date = ?;';
        if (!card_end_date) {
            res.status(400).send({
                message : "Null Value"
            });
        }
        else{
            const result = await db.execute3(getCardQuery, ID, card_end_date);
            if(!result){
                res.status(500).send({message: "Internel Server Error"});
            } else{
                res.status(201).send({
                    message: "Successful Get Card Calender",
                    data : result
                });
            }
        }
    }else{
        res.status(403).send({message: 'Access Denied'});
    }
});

//Get Emergency Card in Board
router.get('/emergency/:user_idx/:board_idx',async(req,res) =>{
    const ID = jwt.verify(req.headers.authorization);
    if(ID != -1){
        const user_idx = req.params.user_idx;
        const board_idx = req.params.board_idx;
        let getEmergencyQuery, result;

        if (board_idx && board_idx != -1) {
            getEmergencyQuery = 'SELECT card_name, list_name, board_name, card_mark FROM CardIt.Card a INNER JOIN CardIt.List b on a.list_idx = b.list_idx INNER JOIN CardIt.Board c on b.board_idx = c.board_idx where card_end_date > (NOW() - INTERVAL 7 DAY) AND c.board_idx = ? LIMIT 5;';
            result = await db.execute2(getEmergencyQuery, board_idx);
        }
        else {
            getEmergencyQuery = 'SELECT card_name, list_name, board_name, card_mark FROM CardIt.Card a INNER JOIN CardIt.List b on a.list_idx = b.list_idx INNER JOIN CardIt.Board c on b.board_idx = c.board_idx INNER JOIN CardIt.Link d on d.board_idx = c.board_idx WHERE card_end_date > (NOW() - INTERVAL 7 DAY) AND d.user_idx =?;';
            result = await db.execute2(getEmergencyQuery, user_idx);
        }

        if(!result){
            res.status(500).send({message: "Internel Server Error"});
        } else{
            res.status(201).send({
                message: "Successful Get Emergency Board Calender",
                data : result
            });
        }
    }else{
        res.status(403).send({message: 'Access Denied'});
    }
});

//Get Calendar Card in Board
router.get('/:board_idx',async(req,res) =>{
    const ID = jwt.verify(req.headers.authorization);
    const board_idx = req.params.board_idx;
    const card_month_date = req.body.card_month_date;

    if(ID != -1){
        if(!board_idx || !card_month_date)
        {
            res.status(400).send({
                message : "Null Value"
            });
        }else{
            const getEmergencyQuery = 'SELECT card_name, list_name, board_name FROM CardIt.Card a INNER JOIN CardIt.List b on a.list_idx = b.list_idx INNER JOIN CardIt.Board c on b.board_idx = c.board_idx where substr(a.card_end_date,1,7)  =? AND c.board_idx = ?;';
            const result = await db.execute3(getEmergencyQuery, card_month_date,board_idx);

            if(!result){
                res.status(500).send({message: "Internel Server Error"});
            } else{
                res.status(201).send({
                    message: "Successful Get Board Calender",
                    data : result
                });
            }
        }
        
    }else{
        res.status(403).send({message: 'Access Denied'});
    }
});

//Add Mark on card
router.put('/', async (req, res) =>{
    const ID = jwt.verify(req.headers.authorization);

    if(ID != -1){
        const card_name = req.body.card_name;
        const card_mark = req.body.card_mark;
        const insertCardMark = 'UPDATE CardIt.Card SET card_mark = ? WHERE card_name = ?;';

        if (!card_name) {
            res.status(400).send({
                message : "Null Value"
            });
        } else {
            const updateResult = await db.execute3(insertCardMark, card_mark, card_name);

            if(!updateResult){
                res.status(500).send({mesaage : "Internal Server Error"}); 
            } else{
                res.status(201).send({message: "Successful Update Card Mark"});
            }
        }
    } else{
        res.status(403).send({
            message: 'Access Denied'
        });
    }
})

module.exports = router;