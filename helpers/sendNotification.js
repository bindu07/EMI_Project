var self = sendNotification;
module.exports = self;
var fcmKey = require('../fcm.json')

function sendNotification(title, body, data, registrationIds, collapse_key, callback){

  var me = sendNotification.name;
  console.log(title)
  console.log(body)
  console.log(data)
  console.log(registrationIds)
  var FCM = require('fcm-node');

  var serverKey = fcmKey.serverKey;

  console.log(serverKey)
  var fcm = new FCM(serverKey);

  var message = { 
      registration_ids: registrationIds, 
      collapse_key: collapse_key,
      
      notification: {
          title: title, 
          body: body
      },
      
      data: data
  };
console.log(message)
  fcm.send(message, function(err, response){
      console.log(response)
      console.log(err)
      return callback(err, response);
  });
}