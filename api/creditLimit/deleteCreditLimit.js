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
  console.info(box.whoAmI, 'Starting');

  async.series([
    // checkInputParams.bind(null, box),
    deleteCreditLimit.bind(null, box)
    ],
    function (err) {
      console.info(box.whoAmI, 'Completed');
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function deleteCreditLimit(box, nextFunc) {
  var today = new Date();
  var status = 'Delete';
  var inserting_data = {
    "status"                    : status,
    "updated_by"                : box.reqBody.created_by,
    "updated_on"                : today
  }
  var sql = 'UPDATE agency_credit_limit SET ? WHERE id = '+ box.reqParams.agency_credit_limit_id;
  con.query(sql,inserting_data,function (err, location) {
    if (err){
      console.info(err);          
      console.info("Error In => "+whoAmI);
      return nextFunc(
        new ActErr(whoAmI, ActErr.DBOperationFailed, 'deleteCreditLimit', err)
        );
    }else{
      box.resBody.success = true;
      box.resBody.message = 'Credit Limit Status Updated successfully';
    }
    return nextFunc();
  });
}