'usestrict'

var self = sendMessage;
module.exports = self;

var http=require('http');

function sendMessage(message, phone){
http.get('http://alerts.solutionsinfini.com/api/v3/index.php?method=sms&api_key=Afc73429bf02b780cdc214c475f77714c&to='+phone+'&sender=MRGNXP&message='+message+'&unicode=1', function(res){
      var str = '';
      console.log('Response is '+res.statusCode);
      res.on('data', function (chunk) {
        str += chunk;
      });
      res.on('end', function () {
        console.log(str);
      });
      console.log("message status");
      console.log(res);
      return res.statusCode;
    });
}