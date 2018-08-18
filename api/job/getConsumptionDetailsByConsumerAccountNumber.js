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
  var sql = "SELECT JD.meter_reading,JD.consumption,JD.previous_reading FROM job_details as JD";
  sql +=" WHERE JD.consumer_account_number = '"+box.reqParams.consumer_account_number+"' ";
  if(box.reqParams.month != '' && box.reqParams.month != null && box.reqParams.month != undefined){
    var start_date = box.reqParams.myear +'-'+box.reqParams.month +'-01 00:00:00';
    var last_day = getLastDay(box.reqParams.myear,box.reqParams.month)
    var end_date = box.reqParams.myear +'-'+box.reqParams.month +'-'+last_day+' 23:59:59';
    console.info("created_on Start Date => "+start_date);
    console.info("created_on End Date => "+end_date);
    sql += " AND JD.reading_taken_on BETWEEN '"+start_date+"' AND '"+end_date+ "'"
  }

  if(box.reqParams.year != '' && box.reqParams.year != null && box.reqParams.year != undefined){
    var start_date = box.reqParams.year +'-01-01 00:00:00';
    var end_date = box.reqParams.year +'-12-31 23:59:59';
    console.info("created_on Start Date => "+start_date);
    console.info("created_on End Date => "+end_date);
    sql += " AND JD.reading_taken_on BETWEEN '"+start_date+"' AND '"+end_date+ "'"
  }
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


function getLastDay(y, m) {
   return 30 + (m <= 7 ? ((m % 2) ? 1 : 0) : (!(m % 2) ? 1 : 0)) - (m == 2) - (m == 2 && y % 4 != 0 || !(y % 100 == 0 && y % 400 == 0)); 
}
