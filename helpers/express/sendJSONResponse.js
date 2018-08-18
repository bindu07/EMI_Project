'use strict';
var self = sendJSONResponse;
module.exports = self;
global.sendJSONResponse = self;

function sendJSONResponse(res, obj) {
	var token_for_response = 'ABCDE14587236FGHIJ21458798522KLMNOPQ478596RSTUVWXYZ';
	if(validate_api == true){
		obj.token = token_for_response;
		obj.validation = validate_api;
	  	return res.status(200).json(obj);
	}else{
		return res.status(401).json({
	      status: 'Unauthorized',
	    });
	}
}

function randomString(charSet) {
  charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  charSet = replaceString(charSet);
  var len = 15;
  var randomString = '';
  for (var i = 0; i < len; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz,randomPoz+1);
  }
  return randomString;
}

/*
	Server Development Detials
	"dbName":"development",
	"dbUsername": "dev_db",
	"dbPassword": "np123",
	"dbHost": "35.161.83.106",
*/