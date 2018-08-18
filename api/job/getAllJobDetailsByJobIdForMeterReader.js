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
  var selected_columns  =     '';
  selected_columns      +=      'U.first_name as username,';
  selected_columns      +=    'J.id as job_id,';
  selected_columns      +=    'JD.id as job_detail_id,';
  selected_columns      +=    'CA.route_no,';
  // selected_columns      +=    'CA.pipe_diameter,';
  // selected_columns      +=    'CA.average_consumption,';
  // selected_columns      +=    'CA.previous_reading,';
  // selected_columns      +=    'J.meter_reader_id,';
  // selected_columns      +=    'J.meter_reading_month,';
  // selected_columns      +=    'J.year,';
  selected_columns      +=    'J.job_status,';
  // selected_columns      +=    'J.job_name,';
  selected_columns      +=    'J.status,';
  selected_columns      +=    'JD.consumer_account_number,';
  selected_columns      +=    'JD.meter_reading_status,';
  selected_columns      +=    'JD.meter_reading,';
  selected_columns      +=    'JD.reading_taken_on,';
  // selected_columns      +=    'JD.url,';
  selected_columns      +=    'CA.user_id,';
  // selected_columns      +=    'U.email_id,';
  //selected_columns	+=	'CONCAT(U.first_name,' ',U.last_name) as username,';
  selected_columns      +=    'U.mobile_number,';
  selected_columns      +=    'CA.meter_reading_taken';
  // selected_columns      +=    'CT.connection_type,';
  // selected_columns      +=    'CT.description as connection_description,';
  // selected_columns      +=    'CT.connection_type_id,';
  // selected_columns      +=    'C.description as error_code_description,';
  // selected_columns      +=    'C.code as previous_error_code,';
  // selected_columns      +=    'C.id as previous_error_code_id';
  var sql = "SELECT "+selected_columns+" FROM job as J LEFT JOIN job_details as JD ON JD.job_id = J.id LEFT JOIN consumer_accounts as CA ON CA.consumer_account_number = JD.consumer_account_number LEFT JOIN users as U ON U.user_id = CA.user_id LEFT JOIN connection_type as CT ON CT.connection_type_id = CA.connection_type LEFT JOIN codes as C ON C.id = CA.previous_error_code WHERE CA.meter_reading_taken != 'yes' AND J.status != 'Reallocated' AND J.agency_id = "+box.reqParams.agency_id+" AND J.id = "+box.reqParams.job_id+" ORDER BY CA.route_no+0 ASC";
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
