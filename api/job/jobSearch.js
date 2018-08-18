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
    getOneCreditLimitByAgencyId.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function getOneCreditLimitByAgencyId(box, nextFunc) {
  var whoAmI = getOneCreditLimitByAgencyId.name;
  // var sql = "SELECT * FROM job as J  LEFT JOIN job_details as JD ON JD.job_id = J.id LEFT JOIN consumer_accounts as CA ON CA.consumer_account_number = JD.consumer_account_number LEFT JOIN users as U ON U.user_id = CA.user_id WHERE J.agency_id = "+box.reqParams.agency_id+" AND J.status != 'deleted'";
  var where_condition = "";
  var sql = "SELECT J.id as job_id,J.* FROM job as J ";
  if(box.reqParams.sub_division_id != 0){
    console.info(" sub_division_id => "+box.reqParams.sub_division_id);
    where_condition += "AND J.sub_division_id = "+box.reqParams.sub_division_id+" ";
  }

  if(box.reqParams.processing_cycle_id != 0){
    console.info(" processing_cycle_id => "+box.reqParams.processing_cycle_id);
    where_condition += "AND J.processing_cycle_id = "+box.reqParams.processing_cycle_id+" ";
  }

  if(box.reqParams.meter_reading_month != 0){
    console.info(" meter_reading_month => "+box.reqParams.meter_reading_month);
    where_condition += "AND J.meter_reading_month = "+box.reqParams.meter_reading_month+" ";
  }
  
  if(box.reqParams.job_id != 0){
    console.info(" Job Id => "+box.reqParams.job_id);
    where_condition += "AND J.id = "+box.reqParams.job_id+" ";
  }

  if(box.reqParams.meter_reader_id != 0){
    console.info(" meter_reader_id => "+box.reqParams.meter_reader_id);
    where_condition += "AND J.meter_reader_id = "+box.reqParams.meter_reader_id+" ";
  }
  
  sql += "WHERE J.agency_id = "+box.reqParams.agency_id+" AND J.status != 'deleted' "+where_condition;
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
