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
    conteneouethreetimesbillmodefiedconsumers.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function conteneouethreetimesbillmodefiedconsumers(box, nextFunc) {
  var whoAmI = conteneouethreetimesbillmodefiedconsumers.name;
  var start_date1 = box.reqParams.start_date +' 00:00:00';
  var end_date1 = box.reqParams.end_date +' 23:59:59';
  var sql ='SELECT CA.consumer_account_number,concat(U.first_name,U.last_name)as consumer_name,TB.bill_created_month,TB.bill_modified  FROM temp_bill_details as TB left join consumer_accounts as CA on CA.consumer_account_number=TB.consumer_account_number left join users as U on U.user_id=CA.user_id  where bill_modified="true" group by TB.consumer_account_number having COUNT(*) >= 3 and TB.bill_created_month between "'+start_date1+'" and "'+end_date1+'"';
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
