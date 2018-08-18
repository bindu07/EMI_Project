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
    checkInputParams.bind(null, box),
    putCreditLimit.bind(null, box)
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

  if (!box.reqBody.credit_limit_assigined)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :credit_limit_assigined')
      );
  if (!box.reqBody.payment_mode)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :payment_mode')
      );
  if (!box.reqBody.created_by)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :created_by')
      );
  return nextFunc();
}

function putCreditLimit(box, nextFunc) {
  var whoAmI = putCreditLimit.name;
  var today = new Date();
  var check_date;
  if(box.reqBody.check_date == "" || box.reqBody.check_date == "0000-00-00" || box.reqBody.check_date == "0000-00-00 00:00:00"){
    check_date = today;
  }else{
    check_date = box.reqBody.check_date;
  }
  var inserting_data = {
    "credit_limit_assigined"    : box.reqBody.credit_limit_assigined ,
    "credit_limit_consumed"     : 0 ,
    "agency_remarks"            : box.reqBody.agency_remarks ,
    "payment_mode"              : box.reqBody.payment_mode ,
    "check_number"              : box.reqBody.check_number ,
    "bank_name"                 : box.reqBody.bank_name ,
    "check_date"                : check_date,
    "check_status"              : box.reqBody.check_status ,
    "updated_by"                : box.reqBody.created_by,
    "updated_on"                : today
  }
  var sql = 'UPDATE agency_credit_limit SET ? WHERE id = '+ box.reqParams.agency_credit_limit_id;
  con.query(sql,inserting_data,function (err, result) {
    if (err){
      console.info(err);          
      console.info("Error In => "+whoAmI);
      return nextFunc(
        new ActErr(whoAmI, ActErr.DBOperationFailed, 'putCreditLimit', err)
        );
    }else{
      box.resBody.success = true;
      box.resBody.message = 'Agency Credit Limit Updated successfully';
    }
    return nextFunc();
  });
}