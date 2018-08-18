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
    getAllConsumerDetailsByAgencyId.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function getAllConsumerDetailsByAgencyId(box, nextFunc) {
  var whoAmI = getAllConsumerDetailsByAgencyId.name;
  var UserMappingToSubDivision = 'LEFT JOIN  sub_division as SD ON SD.id = U.sub_division_id LEFT JOIN bu_mapping_agency AS BMA ON BMA.sub_division_id = SD.id LEFT JOIN agencies AG ON AG.id = BMA.agency_id ';
  // var sql = "SELECT TBD.*,U.agency_id,CONCAT(U.first_name,' ',U.last_name) as username,SD.sub_division_name,AG.name as agency_name,U.mobile_number,U.address_line_1,U.address_line_2,U.city,U.pin_code,S.name as state_name,C.name as country_name FROM temp_bill_details as TBD LEFT JOIN agencies as A ON A.id = TBD.agency_id LEFT JOIN consumer_accounts as CA ON CA.consumer_account_number = TBD.consumer_account_number LEFT JOIN users as U ON U.user_id = CA.user_id LEFT JOIN states as S ON U.state_id = S.id LEFT JOIN countries as C ON S.country_id = C.id "+UserMappingToSubDivision+" WHERE TBD.agency_id = '"+box.reqParams.agency_id+"' AND TBD.payment_status = 'Not Paid' GROUP BY TBD.bill_id LIMIT 30";
  var sql = "SELECT TBD.*,U.agency_id,U.email_id,CA.connection_type,CA.pipe_diameter,U.mobile_number,CONCAT(U.first_name,' ',U.last_name) as username FROM temp_bill_details as TBD LEFT JOIN agencies as A ON A.id = TBD.agency_id LEFT JOIN consumer_accounts as CA ON CA.consumer_account_number = TBD.consumer_account_number LEFT JOIN users as U ON U.user_id = CA.user_id WHERE TBD.agency_id = '"+box.reqParams.agency_id+"' AND TBD.payment_status = 'Not Paid' AND TBD.bill_status='active' order by bill_id desc LIMIT 250";
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
