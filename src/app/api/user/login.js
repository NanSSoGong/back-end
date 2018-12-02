const express = require('express');
const router = express.Router();
const crypto = require('crypto-promise');
const db = require('../../module/pool.js');
const jwt = require('../../module/jwt.js');

router.post('/',async(req, res) =>{
    let user_id = req.body.user_id;
	let user_pwd = req.body.user_pwd;

    if (!user_id || !user_pwd) {
		res.status(400).send({
			message : "Null Value"
		});
	}else{
		//user_id 로 index를 가져옴.
		let checkQuery = 'SELECT * FROM CardIt.User WHERE user_id = ?';
		let checkResult = await db.execute2(checkQuery, user_id);	

		if (!checkResult) {		//쿼리문 에러
			res.status(500).send({
				message : "Internal Server Error"
			});
		} else if (checkResult.length === 1) {		// user_id 가 존재하는 경우
			let token = jwt.sign(checkResult[0].user_idx);
			let hashedpwd = await crypto.pbkdf2(user_pwd, checkResult[0].user_salt, 100000, 32, 'sha512');	// 입력받은 pw를 DB에 존재하는 salt로 hashing
	        if (hashedpwd.toString('base64') === checkResult[0].user_pwd) {	// hashed 된 비밀번호 비교
    	        res.status(201).send({
	                message: "Login Success",	//login 성공 
					data : {
						user_idx  : checkResult[0].user_idx,
						user_name : checkResult[0].user_name,
						user_email : checkResult[0].user_email,
						user_phone : checkResult[0].user_phone,
						user_id : checkResult[0].user_id,
						token : token
					}
	            });
	        } else {
	            res.status(400).send({
	                message : "Login Failed"	// login pw 에러
	            });
	        }
		} else {
			res.status(400).send({
				message : "Login Failed"	//login id 에러 
			});
			console.log("id error");
    }
}
});

module.exports = router;