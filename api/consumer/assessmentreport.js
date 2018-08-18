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
    assessmentreport.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function assessmentreport(box, nextFunc) {
  var whoAmI = assessmentreport.name;
  var start_date1 = box.reqParams.start_date +' 00:00:00';
  var end_date1 = box.reqParams.end_date +' 23:59:59';
  var sql ='SELECT CA.consumer_account_number,CA.connection_type,CA.pipe_diameter,CA.processing_cycle,TB.current_month_amount,TB.bill_created_month,JD.consumption,TB.original_month_bill_amount from temp_bill_details as TB left join job_details as JD on JD.consumer_account_number=TB.consumer_account_number and TB.job_detail_id=JD.id LEFT JOIN consumer_accounts AS CA on CA.consumer_account_number=TB.consumer_account_number and  CA.consumer_account_number=JD.consumer_account_number where CA.processing_cycle="'+box.reqParams.processing_cycle+'" and TB.bill_created_month between "'+start_date1+'" and "'+end_date1+'"';
  console.info(sql);
  con.query(sql,
  function (err, result) {
        if (err){
          console.info(err)
          console.info("Error In => "+whoAmI);
          return nextFunc(
            new ActErr(whoAmI, ActErr.DBOperationFailed, 'Get getconsolidatedreport', err)
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
