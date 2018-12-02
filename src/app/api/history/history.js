const express = require('express');
const router = express.Router();
const crypto = require('crypto-promise');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');

//Get History List
router.get('/:board_idx',async(req,res) =>{
    const ID = jwt.verify(req.headers.authorization);

    if(ID != -1){
        const board_idx = req.params.board_idx;

        const getListQuery = 'SELECT * FROM CardIt.History T1 WHERE T2.board_idx = ?;';
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

module.exports = router;

