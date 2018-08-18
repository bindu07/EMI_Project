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
    PutCollectionDetails.bind(null, box)
    ],
    function (err) {
      console.info(box.whoAmI, 'Completed');
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function PutCollectionDetails(box, nextFunc) {
  var whoAmI = PutCollectionDetails.name;
  var today = new Date();
  var inserting_data = {
    "total_amount"                : box.reqBody.total_amount ,
    "amount_paid"                 : box.reqBody.amount_paid ,
    "balance_amount"              : box.reqBody.balance_amount,
    "payment_status"              : box.reqBody.payment_status,
    "remarks"                     : box.reqBody.remarks,
    "updated_by"                  : box.reqBody.created_by,
    "updated_on"                  : today,
    "mjpreceiptdate"              : box.reqBody.mjpreceiptdate,
    "mjpreceipt_number"           : box.reqBody.mjpreceipt_number,
    "consumer_name"               : box.reqBody.consumer_name
  }
  var sql = 'UPDATE collection_details SET ? WHERE id = '+ box.reqParams.receipt_id;
  con.query(sql,inserting_data,function (err, result) {
    if (err){
      console.info(err);
      console.info("Error In => "+whoAmI);
      return nextFunc(
        new ActErr(whoAmI, ActErr.DBOperationFailed, 'PutCollectionDetails', err)
        );
    }else{
      box.resBody.success = true;
      box.resBody.message = 'Receipt Updated successfully';
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
