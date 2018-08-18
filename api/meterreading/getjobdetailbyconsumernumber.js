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
    getjobdetailsbyconsumernumber.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function getjobdetailsbyconsumernumber(box, nextFunc) {
  var whoAmI = getjobdetailsbyconsumernumber.name;
  var sql = 'SELECT U.first_name,U.last_name,CA.meter_reading_taken,JD.* from job_details as JD left join consumer_accounts as CA on JD.consumer_account_number=CA.consumer_account_number left join users as U on U.user_id=CA.user_id where JD.error_code=2 and U.agency_id='+box.reqParams.agency_id+' and CA.consumer_account_number ='+box.reqParams.consumer_account_number;
  con.query(sql,
  function (err, result) {
        if (err){
          console.info(err)
          console.info("Error In => "+whoAmI);
          return nextFunc(
            new ActErr(whoAmI, ActErr.DBOperationFailed, 'Get All Account Details By User Id', err)
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
