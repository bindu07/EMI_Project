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
    pendingCollectionReport.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function pendingCollectionReport(box, nextFunc) {
  var whoAmI = pendingCollectionReport.name;
  var start_date1 = box.reqParams.start_date +' 00:00:00';
  var end_date1 = box.reqParams.end_date +' 23:59:59';
  var sql ='SELECT TB.consumer_account_number,concat(U.first_name,U.last_name) as consumer_name,TB.bill_created_month,sum(TB.total_bill) as total_bill ,TB.due_date,sum(bill_after_due_date) as billafterduedate,TB.bill_modified,TB.bill_status,TB.payment_status FROM temp_bill_details as TB left join consumer_accounts as CA on CA.consumer_account_number=TB.consumer_account_number left join users as U on U.user_id=CA.user_id where bill_status="active" and payment_status="Not Paid" and TB.bill_created_month between "'+start_date1+'" and "'+end_date1+'"group by TB.consumer_account_number';
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
            console.info(result);
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
