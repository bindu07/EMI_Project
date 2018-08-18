'use strict';
var async = require('async');
var moment = require('moment');
require('../../helpers/sendSms.js');
module.exports = get;

function get(req, res) {
  var box = {
    req: req,
    reqParams: req.params,
    res: res,
    reqBody: req.body,
    resBody: {}
  };

  async.series([
    sendSmstoNotPaid.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function sendSmstoNotPaid(box, nextFunc) {
  var whoAmI = sendSmstoNotPaid.name;
  var status="Not Paid"
  var startDate = new Date();
  var today = moment(startDate).format("YYYY-MM-01");
  var sql='SELECT consumer_account_number, datediff((due_date),(now())) as datediffrence,due_date FROM temp_bill_details where  payment_status="'+status+'"';
  console.info(sql);
  con.query(sql,function(err,result) {
    if(err)
    {
      console.info(err);
    }
    else{
    for(var i=0;i<result.length;i++){
      var consumer_account_number=result[i].consumer_account_number;
      var due_date=result[i].due_date;
      var total_bill_after_discount=result[i].total_bill_after_discount;
      var datediffrence=result[i].datediffrence;
      if(datediffrence<=7 && datediffrence>0){
        sendSmsToNotPaidConsumer(consumer_account_number,due_date,total_bill_after_discount);
      }
      else{
        console.info("dedated");
        }
      }
      box.resBody.success = true;
      box.resBody.message = "Sms Send to Consumer!";
    }
      return nextFunc();
  })
}

function sendSmsToNotPaidConsumer(consumer_account_number,due_date,total_bill_after_discount){
       console.info(consumer_account_number);
       console.info(due_date);
       var today = new Date();
       var month= moment(today).format("MMMM YYYY");
       var sql="SELECT U.mobile_number FROM consumer_accounts as CA LEFT JOIN users U ON CA.user_id = U.user_id WHERE CA.consumer_account_number="+consumer_account_number;
       con.query(sql,function (err, result) {
         if (err){
           return false;
         }else{
            if(result.length >= 1){
           var mobile_number=result[0].mobile_number;
            var due_date1 = moment(due_date).format("DD-MM-YYYY");
             sendSms(mobile_number,'MJP Water Bill of Rs'+total_bill_after_discount+'for Consumer Account # '+consumer_account_number+'is due on '+due_date1+'Pl Pay in Cash or online at https//mjp.maharashtra.gov.in,Pl Ignore if paid.');

         }
       }
    });
}
