'use strict';
console.info('Send SMS Intitiated');
var request = require('request-promise');
global.sendSms = sendSms;
function sendSms(to_mobile_number,to_message) {
	if(to_mobile_number.length == 10 && to_mobile_number != null && to_mobile_number != undefined)
		{
	if(to_message == "Testing")
	{
		to_message = 'MJP water reader visited of your premices for reading consu no 123Test123 but Reading get Abnormal status of House Lockx please update your reading on Mobile App of our link 123Test123';
	}
	var sender_id	=	'MJPALR';
	var base_url	=	'https://alerts.solutionsinfini.com/api/v4/?api_key=A4af4f3e877d44b2ee55c4d48fd143238';
	var final_url	=	base_url+'&method=sms&message='+to_message+'&to='+to_mobile_number+'&sender='+sender_id;
	console.info("<---- To Message ----> ");
	console.info(to_message);
	console.info(to_mobile_number);
	console.info(sender_id);
	var options 	= 	{
		url: final_url,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}/*,
		json: json*/
	};
	if(global.Env == 'test')
	{
		request(options, function(err, res, body) {
			if (res && (res.statusCode === 200 || res.statusCode === 201)) {
				console.info(body);
			}
		});	
	}
	else
	{
		console.info("<---- SMS not send because this "+global.Env+" EVN ---->");
	}
	return true;
	}
	else{
		console.info("error in moble number"+to_mobile_number);
	}
}

module.exports = sendSms;
