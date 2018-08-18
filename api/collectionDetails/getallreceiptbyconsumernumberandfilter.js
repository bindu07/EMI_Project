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
    getAllReceiptByConsumerNumber.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function getAllReceiptByConsumerNumber(box, nextFunc) {
  var whoAmI = getAllReceiptByConsumerNumber.name;
  var start_date = box.reqParams.start_date +' 00:00:00';
  var end_date = box.reqParams.end_date +' 23:59:59';
  var sql ="SELECT CD.*,CONCAT(U.first_name,' ',U.last_name) as username,PC.payment_category_name From collection_details as CD LEFT JOIN  consumer_accounts as CA LEFT JOIN users as U ON U.user_id=CA.user_id  ON CA.consumer_account_number=CD.consumer_account_number LEFT JOIN payment_categories as PC ON PC.id=CD.payment_category_id WHERE  CD.agency_id="+box.reqParams.agency_id+" AND CD.consumer_account_number="+box.reqParams.consumer_account_number+" AND CD.bill_date BETWEEN '"+start_date+"' AND '"+end_date+"'";
	console.info(sql);
  con.query(sql,
  function (err, result) {
        if (err){
          console.info(err)
          console.info("Error In => "+whoAmI);
          return nextFunc(
            new ActErr(whoAmI, ActErr.DBOperationFailed, 'Get One User Receipt', err)
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
