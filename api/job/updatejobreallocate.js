'use strict';
var async = require('async');
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
    changeUserStatus.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function changeUserStatus(box, nextFunc) {
  var whoAmI = changeUserStatus.name;
  var today = new Date();
  var job_reallocated="Reallocated";
  var inserting_data = {
    "meter_reading_status"    :job_reallocated 
  }
  var sql = 'UPDATE job_details SET ?  WHERE job_id="'+box.reqParams.job_id+'" AND consumer_account_number ="'+ box.reqParams.consumer_account_number+'"';
  console.info(sql);
  con.query(sql,inserting_data,function (err, result) {
    if (err){
      console.info(err);          
      console.info("Error In => "+whoAmI);
      return nextFunc(
        new ActErr(whoAmI, ActErr.DBOperationFailed, 'changeUserStatus', err)
        );
    }else{
      box.resBody.success = true;
      box.resBody.message = 'consumer Status Updated successfully';
    }
    return nextFunc();
  });
}