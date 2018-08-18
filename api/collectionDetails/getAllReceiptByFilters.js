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
  var sql = "SELECT TBD.*,cd.*,U.agency_id,CONCAT(U.first_name,' ',U.last_name) as username,U.mobile_number,U.address_line_1,U.address_line_2,U.city,U.pin_code,S.name as state_name,C.name as country_name,PC.payment_category_name,CA.processing_cycle FROM collection_details as cd LEFT JOIN consumer_accounts as CA ON CA.consumer_account_number = cd.consumer_account_number LEFT JOIN users as U ON U.user_id = CA.user_id LEFT JOIN states as S ON U.state_id = S.id LEFT JOIN countries as C ON S.country_id = C.id LEFT JOIN temp_bill_details as TBD ON TBD.bill_id = cd.bill_id LEFT JOIN payment_categories as PC ON PC.id = cd.payment_category_id";
  sql += " WHERE cd.agency_id ='"+box.reqParams.agency_id+"'";
  if(box.reqParams.start_date != '' && box.reqParams.start_date != null && box.reqParams.start_date != undefined && box.reqParams.end_date != '' && box.reqParams.end_date != null && box.reqParams.end_date != undefined){
    var start_date = box.reqParams.start_date +' 00:00:00';
    var end_date = box.reqParams.end_date +' 23:59:59';
    console.info("created_on Start Date => "+start_date);
    console.info("created_on End Date => "+end_date);
    sql += " AND cd.created_on BETWEEN '"+start_date+"' AND '"+end_date+ "'"
  }
  if(box.reqParams.collected_by != '' && box.reqParams.collected_by != null && box.reqParams.collected_by != undefined){
    console.info("collected_by => "+box.reqParams.collected_by);
    sql += " AND cd.created_by = '"+box.reqParams.collected_by+"'"
  }
  if(box.reqParams.payment_mode != '' && box.reqParams.payment_mode != null && box.reqParams.payment_mode != undefined){
    console.info("payment_mode => "+box.reqParams.payment_mode);
    sql += " AND cd.payment_mode = '"+box.reqParams.payment_mode+"'"
  }
  if(box.reqParams.payment_category_id != '' && box.reqParams.payment_category_id != null && box.reqParams.payment_category_id != undefined){
    console.info("payment_category_id => "+box.reqParams.payment_category_id);
    sql += " AND cd.payment_category_id = '"+box.reqParams.payment_category_id+"'"
  }
  // sql +=" GROUP BY cd.id ORDER BY payment_date DESC" ;
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
