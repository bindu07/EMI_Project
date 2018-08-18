'use strict';
process.title = 'auth_server';
module.exports = validateToken;

console.info("Header validation Initilized");
function validateToken(headers,body){
	var result = {
		"validation" : true,
		"token" : randomString()
	};
	return result;
}

function randomString() {
  var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';
  var len = 25;
  var randomString = '';
  for (var i = 0; i < len; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz,randomPoz+1);
  }
  return randomString;
}