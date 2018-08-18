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
    getAllAccountsJobAssiginedIsNo.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function getAllAccountsJobAssiginedIsNo(box, nextFunc) {
  var whoAmI = getAllAccountsJobAssiginedIsNo.name;
  var sql = "SELECT CA.*,U.first_name,U.last_name,U.uuid FROM consumer_accounts as CA LEFT JOIN users U ON CA.user_id = U.user_id WHERE U.agency_id ='"+box.reqParams.agency_id+"' AND U.status = 'active' AND  (CA.job_assigined = 'yes' OR CA.job_assigined = 'no') AND CA.meter_reading_taken = 'no' AND CA.processing_cycle = '"+box.reqParams.processing_cycle_id+"' AND CA.sub_division_id = "+box.reqParams.sub_division_id+" ORDER BY CA.route_no+0 ASC";
  console.info(sql);
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
