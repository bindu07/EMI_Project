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
    getAlltempbilldetails.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function getAlltempbilldetails(box, nextFunc) {
  var whoAmI = getAlltempbilldetails.name;
  var start_date1 = box.reqParams.start_date +' 00:00:00';
  var end_date1 = box.reqParams.end_date +' 23:59:59';
  var sql ='SELECT CA.processing_cycle,JD.job_id,CA.consumer_account_number,concat(U.first_name,U.last_name) as consumername,CA.meter_number,CA.meter_status,CA.connection_type,CA.pipe_diameter,CA.route_no,JD.error_code,JD.previous_reading,JD.meter_reading,JD.consumption,TB.*,CD.created_by as collectedby,CD.id as receipt_num,CD.payment_date,CD.outstanding_current_month_amount,CD.outstanding_arrears,CD.outstanding_dpc,CD.outstanding_penalty From  temp_bill_details As TB left join job_details as JD on JD.job_id=TB.job_number and JD.id=TB.job_detail_id left join consumer_accounts as CA on CA.consumer_account_number=JD.consumer_account_number left join users as U on U.user_id=CA.user_id left join collection_details as CD on CD.bill_id=TB.bill_id where TB.job_number="'+box.reqParams.job_id+'" and TB.bill_created_month between "'+start_date1+'" and "'+end_date1+'"';
  console.info(sql);
  con.query(sql,
  function (err, result) {
        if (err){
          console.info(err)
          console.info("Error In => "+whoAmI);
          return nextFunc(
            new ActErr(whoAmI, ActErr.DBOperationFailed, 'Get All billDetails', err)
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
