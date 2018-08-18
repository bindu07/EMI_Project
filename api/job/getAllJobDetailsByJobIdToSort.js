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
  selected_columns      +=    'J.job_status,';
  selected_columns      +=    'J.status,';
  selected_columns      +=    'JD.consumer_account_number,';
  selected_columns      +=    'JD.meter_reading_status,';
  selected_columns      +=    'JD.meter_reading,';
  selected_columns      +=    'JD.reading_taken_on,';
  selected_columns      +=    'CA.user_id,';
  selected_columns      +=    'U.mobile_number,';
  selected_columns      +=    'CA.meter_reading_taken';
  var Final_sql = "SELECT "+selected_columns+" FROM job as J LEFT JOIN job_details as JD ON JD.job_id = J.id LEFT JOIN consumer_accounts as CA ON CA.consumer_account_number = JD.consumer_account_number LEFT JOIN users as U ON U.user_id = CA.user_id LEFT JOIN connection_type as CT ON CT.connection_type_id = CA.connection_type LEFT JOIN codes as C ON C.id = CA.previous_error_code WHERE CA.meter_reading_taken != 'yes' AND J.status != 'Reallocated' AND J.agency_id = "+box.reqParams.agency_id+" AND J.id = "+box.reqParams.job_id+" ORDER BY CA.route_no+0 ASC LIMIT "+box.reqParams.from_limit+","+box.reqParams.to_limit+"";

  var Total_Number_Of_Consumers_Sql = "SELECT count(*) as total_number_of_records FROM job as J LEFT JOIN job_details as JD ON JD.job_id = J.id LEFT JOIN consumer_accounts as CA ON CA.consumer_account_number = JD.consumer_account_number LEFT JOIN users as U ON U.user_id = CA.user_id LEFT JOIN connection_type as CT ON CT.connection_type_id = CA.connection_type LEFT JOIN codes as C ON C.id = CA.previous_error_code WHERE CA.meter_reading_taken != 'yes' AND J.status != 'Reallocated' AND J.agency_id = "+box.reqParams.agency_id+" AND J.id = "+box.reqParams.job_id+" ORDER BY CA.route_no+0 ASC";

  var Remining_Number_Of_consumers_sql = "SELECT count(*) as remining_number_of_records FROM job as J LEFT JOIN job_details as JD ON JD.job_id = J.id LEFT JOIN consumer_accounts as CA ON CA.consumer_account_number = JD.consumer_account_number LEFT JOIN users as U ON U.user_id = CA.user_id LEFT JOIN connection_type as CT ON CT.connection_type_id = CA.connection_type LEFT JOIN codes as C ON C.id = CA.previous_error_code WHERE CA.meter_reading_taken != 'yes' AND J.status != 'Reallocated' AND J.agency_id = "+box.reqParams.agency_id+" AND J.id = "+box.reqParams.job_id+" ORDER BY CA.route_no+0 ASC LIMIT "+box.reqParams.from_limit+","+box.reqParams.to_limit+"";

  console.info(Total_Number_Of_Consumers_Sql);
  con.query(Total_Number_Of_Consumers_Sql,
    function (err, result) {
      if (err){
        console.info(err)
        console.info("Error In => "+whoAmI);
        return nextFunc(
          new ActErr(whoAmI, ActErr.DBOperationFailed, 'Get All Agency Credit Limit Details', err)
          );
      }else{
        console.info(result[0]['total_number_of_records']);
        if(result.length >= 1){
          /*box.resBody.success = true;
          box.resBody.data = result;*/
          console.info(Final_sql);
          con.query(Final_sql,
            function (err, final_result) {
              if (err){
                console.info(err)
                console.info("Error In => "+whoAmI);
                return nextFunc(
                  new ActErr(whoAmI, ActErr.DBOperationFailed, 'Get All Agency Credit Limit Details', err)
                  );
              }else{
                if(final_result.length >= 1){
                  box.resBody.success = true;
                  box.resBody.data = final_result;
                  box.resBody.total = result[0]['total_number_of_records'];
                   var ramining = parseInt(result[0]['total_number_of_records']) - parseInt(parseInt(box.reqParams.from_limit) + parseInt(100));
                   console.info(ramining+"  ramining");
                   console.info(result[0]['total_number_of_records']+"  total_number_of_records");
                   if(ramining < 0)
                      ramining = 0;
                    /*if(box.reqParams.from_limit == 0)
                      ramining = parseInt(result[0]['total_number_of_records']) - parseInt(100);*/
                    console.info(ramining+"  ramining");
                   box.resBody.ramining   =   ramining;
                  /*console.info(parseInt(result[0]['total_number_of_records']) - parseInt(parseInt(box.reqParams.to_limit) - parseInt(box.reqParams.from_limit)));
                  console.info(parseInt(parseInt(parseInt(box.reqParams.to_limit) - parseInt(box.reqParams.from_limit))));
                  console.info(parseInt(parseInt(box.reqParams.to_limit)));
                  console.info(parseInt(parseInt(box.reqParams.from_limit)));*/
                }else{
                  box.resBody.success = false;
                  box.resBody.message = "No Records Found !";
                }
              }
              return nextFunc();
            }
            );
        }else{
          box.resBody.success = false;
          box.resBody.message = "No Records Found !";
          return nextFunc();
        }
      }
    }
    );
}
