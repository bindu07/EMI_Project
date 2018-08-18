'use strict';
var async = require('async');
require('../../helpers/randomString.js');

module.exports = post;

function post(req, res) {
  var box = {
    req: req,
    res: res,
    reqParams: req.params,
    reqBody: req.body,
    resBody: {}
  };
  async.series([
    // checkInputParams.bind(null, box),
    updateAmountPaid.bind(null, box)
    ],
    function (err) {
      console.info(box.whoAmI, 'Completed');
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function updateAmountPaid(box, nextFunc) {
  var whoAmI = updateAmountPaid.name;
  var today = new Date();
  var inserting_data = {
    "amount_paid"           : box.reqBody.amount_paid ,
    "status"                : "receipt",
    "payment_status"        : "Paid",
    "amount_paid_on"        : today
  }
  var sql = 'UPDATE temp_bill_details SET ? WHERE bill_id = "'+box.reqParams.bill_id+'" AND consumer_number = "'+box.reqParams.consumer_number+'"';
  con.query(sql,inserting_data,function (err, result) {
    if (err){
      console.info(err);          
      console.info("Error In => "+whoAmI);
      return nextFunc(
        new ActErr(whoAmI, ActErr.DBOperationFailed, 'updateAmountPaid', err)
        );
    }else{
      box.resBody.success = true;
      box.resBody.message = 'Amount Updated successfully';
    }
    return nextFunc();
  });
}

function randomString(charSet) {
  charSet = charSet || 'ACM09ABT';
  charSet = replaceString(charSet);
  var len = 5;
  var randomString = '';
  for (var i = 0; i < len; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz,randomPoz+1);
  }
  return randomString;
}

function replaceString(mystring){
  mystring = mystring.replace(/[@.]/g , ''); 
  return mystring;
}