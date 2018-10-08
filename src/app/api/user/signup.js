const express = require('express');
const router = express.Router();
const crypto = require('crypto-promise');
const db = require('../../module/pool.js');


router.post('/', async (req, res) =>{
    let user_name = req.body.user_name;
    let user_phone = req.body.user_phone;
    let user_email = req.body.user_email;
    let user_id = req.body.user_id;
    let user_pwd = req.body.user_pwd;

    if (!user_id || !user_pwd) {
		res.status(400).send({
			message : "Null Value"
		});
	} else {
        let checkQuery = 'SELECT * FROM Cardit.User where user_id = ?';
        let checkResult = await db.execute2(checkQuery, [user_id]);

        if(!checkResult){
            res.status(500).send({
                mesaage : "Internal Server Error"
            });
        } else if(checkResult.length == 1){
            res.status(400).send({
                message : checkResult[0].user_id +" is already exist."
            });
        } else{
            let salt = await crypto.randomBytes(32);
            const hashedpwd = await crypto.pbkdf2(user_pwd, salt.toString('base64'), 100000, 32, 'SHA512');
            //정보 삽입 
            let insertQuery = 'INSERT INTO user(user_name,user_phone,user_email,user_id, user_pwd, user_salt) VALUES(?, ?, ?, ?,?,?)';
            let insertResult = await db.execute2(insertQuery, [user_name,user_phone,user_email,user_id, hashedpwd.toString('base64'), salt.toString('base64')]);

            if(!insertResult){
                res.status(500).send({
                    message : "Internal Server Error"
                });
            } else{
                res.status(201).send({
                    message : "Successfully Sign Up"
                })
            }
        }
    }
})

module.exports = router;
