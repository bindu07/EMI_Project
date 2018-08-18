'use strict';
module.exports = healthCheck;

function healthCheck(req, res) {
	var validation_flag = require('../../config/csrf_auth.js')(req.headers);
	if(validation_flag == true){
		console.info('Requesting api healthCheck!');
		res.status(200).json({
			status: 'OK',
			body: req.body,
			query: req.query,
			headers:req.headers.ab_authorization,
			params: req.params,
			method: req.method
		});
	}else{
		console.info('Request is Unauthorized');
		res.status(401).json({
			status: 'UnAuthorized',
		});
	}
}
