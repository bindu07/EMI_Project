'use strict';
process.title 	= 'server';
module.exports 	= app;

require('../helpers/ActErr.js');
require('../helpers/respondWithError.js');

var bodyParser 	= require('body-parser');
var express 	= require('express');
var app 		= express();
var token_for_response = "";
var validate_api = "";
require('./logging.js');
var url_config 				= require('../helpers/billbaseurl.json');
var ports_config 			= require('../helpers/ports.json');
var csrf_validation_flag 	= false;
var auth_token_flag 		= false;
var load_routes 			= false;
console.info("Base URL "+url_config.base_url);
console.info("API accessing port "+ ports_config.newapi_accessing);
app.listen(ports_config.newapi_accessing);
app.use(bodyParser.json());

app.use(function(req, res, next) {
	console.info(" Cors ");
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Accept,Content-Type,Authorization,Cookie');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

global.app = app;
global.token_for_response;
global.validate_api;

app.use(function(req,res,next){
	console.info(req['originalUrl']);
	csrf_validation_flag = require('./csrf_auth.js')(req.headers);
	console.info(csrf_validation_flag);
	if(csrf_validation_flag == true){
		var auth_token_flag = new Array();
		auth_token_flag = require('./auth_token_validation.js')(req.headers,req.body);
		// console.info(auth_token_flag);
		// global.token_for_response= auth_token_flag.token;
		global.validate_api = true;
		loadRoutes();
	}else{
		res.status(401).json({
	      status: 'Unauthorized',
	    });
	}
	next();
});


function loadRoutes(){
	require('../helpers/express/sendJSONResponse.js');
	require('./database.js');
	require('./activity.js');
	require('./validatingAndBillLogs.js');
	require('./meterReadingHistory.js');
	require('../BillRoutes.js')(app);
}
module.exports = app;
