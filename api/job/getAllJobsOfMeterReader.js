getAllJobsOfMeterReader

'use strict';
var async = require('async');
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
    getAllJobsOfMeterReader.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function getAllJobsOfMeterReader(box, nextFunc) {
  var whoAmI = getAllJobsOfMeterReader.name;
  // var sql = "SELECT * FROM job as J  LEFT JOIN job_details as JD ON JD.job_id = J.id LEFT JOIN consumer_accounts as CA ON CA.consumer_account_number = JD.consumer_account_number LEFT JOIN users as U ON U.user_id = CA.user_id WHERE J.agency_id = "+box.reqParams.agency_id+" AND J.status != 'deleted'";
  var sql = "SELECT * FROM job as J WHERE J.agency_id = "+box.reqParams.agency_id+" AND J.sub_division_id = '"+box.reqParams.sub_division_id+"' AND J.meter_reader_id = '"+box.reqParams.meter_reader_id+"'";
  console.info(sql);
  con.query(sql,
  function (err, result) {
        if (err){
          console.info(err)
          console.info("Error In => "+whoAmI);
          return nextFunc(
            new ActErr(whoAmI, ActErr.DBOperationFailed, 'Get All Agency Credit Limit Details', err)
            );
        }else{
          if(result.length >= 1){
            box.resBody.success = true;
            box.resBody.data = result;
          }else{
            box.resBody.success = false;
            box.resBody.message = "No Records Found !";
          }
        }
    return nextFunc();
  }
  );
}
