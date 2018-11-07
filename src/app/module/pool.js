const pool = require('../../config/db_pool.js');

//DB 통신 모듈화
//매개변수
//1번째 : query문
//2번째 : data(json 형식 가능)

module.exports = {
    //인수 1개, 전체 조회
    execute1 : async (...args) => {
        const query = args[0];
        let result;
        try {
            var connection = await pool.getConnection();
            result = await connection.query(query) || null;
        }
        catch(err) {
            next(err);
        }
        finally {
            pool.releaseConnection(connection);
            return result;
        }
    },
    //인수 2개
    execute2 : async (...args) => {
        const query = args[0];
        const data = args[1];
        let result;
        try {
            var connection = await pool.getConnection();
            result = await connection.query(query, data) || null;
        }
        catch(err) {
            next(err);
        }
        finally {
            pool.releaseConnection(connection);
            return result;
        }
    },
    //인수 3개
    execute3 : async (...args) => {
        const query = args[0];
        const data = args[1];
        const data2 = args[2];
        let result;
        try {
            var connection = await pool.getConnection();
            result = await connection.query(query, [data, data2]) || null;
        }
        catch(err) {
            next(err);
        }
        finally {
            pool.releaseConnection(connection);
            return result;
        }
    },
    //인수 4개
    execute4 : async (...args) => {
        const query = args[0];
        const data = args[1];
        const data2 = args[2];
        const data3 = args[3];
        let result;
        try {
            var connection = await pool.getConnection();
            result = await connection.query(query, [data, data2, data3]) || null;
        }
        catch(err) {
            next(err);
        }
        finally {
            pool.releaseConnection(connection);
            return result;
        }
    },
    queryParam_None : async (...args) => {								// (...args) expression은 arrow function 사
		const query = args[0];
		let result;

		try {
			var connection = await pool.getConnection();			// connection을 pool에서 하나 가져온다.
			result = await connection.query(query) || null;		// query문의 결과 || null 값이 result에 들어간다.
		} catch(err) {
			next(err);
		} finally {
			pool.releaseConnection(connection);								// waterfall 에서는 connection.release()를 사용했지만, 이 경우 pool.releaseConnection(connection) 을 해준다.
			return result;
		}

	},
	queryParam_Arr : async (...args) => {
		const query = args[0];
		const value = args[1];	// array
		let result;

		try {
			var connection = await pool.getConnection();			// connection을 pool에서 하나 가져온다.
			result = await connection.query(query, value) || null;	// 두 번째 parameter에 배열 => query문에 들어갈 runtime 시 결정될 value
		} catch(err) {
			next(err);
		} finally {
			pool.releaseConnection(connection);								// waterfall 에서는 connection.release()를 사용했지만, 이 경우 pool.releaseConnection(connection) 을 해준다.
			return result;
		}
	},
	// queryParamWithFunc : async (...args) => {
	// 	const query = args[0];
    //     const value = args[1];	// array
    //     let result;
    //     let insertId;

	// 	try {
	// 		var connection = await pool.getConnection();			// connection을 pool에서 하나 가져온다.
	// 		result = await connection.query(query, value, function(err, res) {
    //             if (err) throw err;
    //             insertId = res.insertId;
    //         }) || null;	// 두 번째 parameter에 배열 => query문에 들어갈 runtime 시 결정될 value
	// 	} catch(err) {
	// 		next(err);
	// 	} finally {
    //         pool.releaseConnection(connection);		// waterfall 에서는 connection.release()를 사용했지만, 이 경우 pool.releaseConnection(connection) 을 해준다.
    //         return {
    //             data: result,
    //             insertId: insertId,
    //         };
	// 	}
	// }
};
