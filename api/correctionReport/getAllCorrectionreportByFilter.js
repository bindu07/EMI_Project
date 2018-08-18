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
    getAllReceipt.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function getAllReceipt(box, nextFunc) {
  var whoAmI = getAllReceipt.name;
    var start_date = box.reqParams.start_date +' 00:00:00';
    var end_date = box.reqParams.end_date +' 23:59:59';
    console.info("created_on Start Date => "+start_date);
    console.info("created_on End Date => "+end_date);
  var sql ='SELECT tbd.bill_id,tbd.consumer_account_number,cd.id,u.first_name,cd.payment_status,ca.processing_cycle,tbd.current_month_amount,tbd.arrears,tbd.delayed_payment_charges,tbd.total_bill,cd.amount_paid,cd.payment_date,tbd.due_date,tbd.bill_after_due_date,tbd.bill_modified,tbd.revised_current_month_amount,tbd.revised_arrears,tbd.revised_delayed_payment_charges,tbd.revised_total_bill,tbd.original_month_bill_amount,tbd.original_arrears,tbd.original_delayed_payment_charges,tbd.original_total_bill,pc.payment_category_name,cd.created_on FROM temp_bill_details AS tbd JOIN collection_details AS cd ON tbd.consumer_account_number = cd.consumer_account_number  AND tbd.bill_id = cd.bill_id AND  cd.payment_date BETWEEN "'+start_date+'" AND "'+end_date+'" AND tbd.payment_status!="Not Paid"  LEFT JOIN consumer_accounts AS ca ON ca.consumer_account_number = cd.consumer_account_number LEFT JOIN users AS u ON ca.user_id = u.user_id LEFT JOIN payment_categories AS pc ON pc.id = cd.payment_category_id';
  if(box.reqParams.bill_modified!="" || box.reqParams.bill_modified!="undefined"){
    sql+=' WHERE tbd.bill_modified ="'+box.reqParams.bill_modified+'"';
  }
  console.info(sql);
  con.query(sql,
  function (err, result) {
        if (err){
          console.info(err)
          console.info("Error In => "+whoAmI);
          return nextFunc(
            new ActErr(whoAmI, ActErr.DBOperationFailed, 'Get All Users', err)
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
