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

function checkInputParams(box, nextFunc) {
  var whoAmI = box.whoAmI + '_' + checkInputParams.name;
  console.debug('Executing ->', whoAmI );

  if (!box.reqBody)
    return nextFunc(
      new ActErr(whoAmI, ActErr.BodyNotFound, 'Missing body')
      );

  if (!box.reqBody.revised_delayed_payment_charges)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :revised_delayed_payment_charges')
      );
  if (!box.reqBody.revised_arrears)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :revised_arrears')
      );
  if (!box.reqBody.revised_current_month_amount)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :revised_current_month_amount')
      );
  if (!box.reqBody.revised_total_bill)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :revised_total_bill')
      );
  if (!box.reqBody.created_by)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :created_by')
      );
  return nextFunc();
}

function updateAmountPaid(box, nextFunc) {
  var whoAmI = updateAmountPaid.name;
  console.info(box.reqBody);
  var today = new Date();
  var inserting_data = {
    "bill_modified"                     : "true",
    "original_month_bill_amount"        : box.reqBody.current_month_bill_amount,
    "original_arrears"                  : box.reqBody.current_arrears,
    "original_delayed_payment_charges"  : box.reqBody.current_delayed_payment_charges,
    "original_total_bill"               : box.reqBody.current_Toatlamount,
    "current_month_amount"              : box.reqBody.revised_current_month_amount,
    "arrears"                           : box.reqBody.revised_arrears,
    "delayed_payment_charges"           : box.reqBody.revised_delayed_payment_charges,
    "total_bill"                        : box.reqBody.revised_total_bill,
    "revised_current_month_amount"      : box.reqBody.revised_current_month_amount,
    "revised_arrears"                   : box.reqBody.revised_arrears,
    "revised_delayed_payment_charges"   : box.reqBody.revised_delayed_payment_charges,
    "revised_total_bill"                : box.reqBody.revised_total_bill,
    "updated_by"                        : box.reqBody.created_by,
    "updated_on"                        : today,
    "bill_after_due_date"               : parseInt(box.reqBody.revised_total_bill)+parseInt(box.reqBody.penalty)
  }
  var sql = 'UPDATE temp_bill_details SET ? WHERE bill_id = "'+box.reqParams.bill_id+'"';
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