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
  console.info(box.reqBody)
  async.series([
    // checkInputParams.bind(null, box),
    approveCreditLimit.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function approveCreditLimit(box, nextFunc) {
  var today = new Date();
  // var status = 'approved';
  console.info("Credit Limit Status");
  console.info(box.reqBody.credit_limit_status);
  console.info("Credit Limit Id ===> "+box.reqParams.agency_credit_limit_id);
  var inserting_data = {
    "status"                    : box.reqBody.credit_limit_status,
    "mjp_remarks"               : box.reqBody.mjp_remarks,
    "status_approved_by"        : box.reqBody.created_by,
    "updated_by"                : box.reqBody.created_by,
    "updated_on"                : today
  }
  var sql = 'UPDATE agency_credit_limit SET ? WHERE id = '+ box.reqParams.agency_credit_limit_id;
  con.query(sql,inserting_data,function (err, location) {
    if (err){
      console.info(err);          
      console.info("Error In => "+whoAmI);
      return nextFunc(
        new ActErr(whoAmI, ActErr.DBOperationFailed, 'approveCreditLimit', err)
        );
    }else{
      box.resBody.success = true;
      box.resBody.message = 'Credit Limit Status Updated successfully';
    }
    return nextFunc();
  });
}
