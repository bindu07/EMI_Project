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
    getAllCreditLimitByAgencyId.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function getAllCreditLimitByAgencyId(box, nextFunc) {
  var whoAmI = getAllCreditLimitByAgencyId.name;
  var sql ="SELECT J.id as job_id,JD.id as job_detail_id,CA.route_no,CA.pipe_diameter,CA.average_consumption,JD.previous_reading,J.meter_reader_id,J.meter_reading_month,J.year,J.job_status,J.job_name,J.status,JD.consumer_account_number,JD.meter_reading_status,JD.meter_reading,JD.consumption,JD.reading_taken_on,JD.url,CA.user_id,U.email_id,U.mobile_number,CONCAT(U.first_name,' ',U.last_name) as username,U.mobile_number,U.address_line_1,U.address_line_2,U.city,U.pin_code,CA.meter_reading_taken,CT.connection_type,CT.description as connection_description,CT.connection_type_id,C.description as error_code_description,C.code as previous_error_code,C.id as previous_error_code_id FROM job as J  LEFT JOIN job_details as JD ON JD.job_id = J.id LEFT JOIN consumer_accounts as CA ON CA.consumer_account_number = JD.consumer_account_number LEFT JOIN users as U ON U.user_id = CA.user_id LEFT JOIN connection_type as CT ON CT.connection_type_id = CA.connection_type LEFT JOIN codes as C ON C.id = CA.previous_error_code WHERE J.agency_id = "+box.reqParams.agency_id+" AND J.id = "+box.reqParams.job_id+" ORDER BY CA.route_no+0 ASC";
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
