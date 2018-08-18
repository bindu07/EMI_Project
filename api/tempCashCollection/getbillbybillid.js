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
    getOneConsumerDetailsByAgencyIdAndConsumerNumber.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function getOneConsumerDetailsByAgencyIdAndConsumerNumber(box, nextFunc) {
  var whoAmI = getOneConsumerDetailsByAgencyIdAndConsumerNumber.name;
  var sql_validate = "select * FROM  temp_bill_details where bill_id = '"+box.reqParams.bill_id+"'";   
  con.query(sql_validate,
  function(err_validate, result_validate){  
  if(result_validate.length ==0){
    box.res.status(401).json({
      success: false,
      status:'Unauthorized',
      message:'billnumberdoesnotexist'
    });

  }else{
  var UserMappingToSubDivision = 'LEFT JOIN  sub_division as SD ON SD.id = U.sub_division_id LEFT JOIN bu_mapping_agency AS BMA ON BMA.sub_division_id = SD.id LEFT JOIN agencies AG ON AG.id = BMA.agency_id ';
  // var sql = "SELECT TBD.*,U.agency_id,CONCAT(U.first_name,' ',U.last_name) as username,SD.sub_division_name,AG.name as agency_name,U.mobile_number,U.address_line_1,U.address_line_2,U.city,U.pin_code,S.name as state_name,C.name as country_name FROM temp_bill_details as TBD LEFT JOIN agencies as A ON A.id = TBD.agency_id LEFT JOIN consumer_accounts as CA ON CA.consumer_account_number = TBD.consumer_account_number LEFT JOIN users as U ON U.user_id = CA.user_id LEFT JOIN states as S ON U.state_id = S.id LEFT JOIN countries as C ON S.country_id = C.id "+UserMappingToSubDivision+" WHERE TBD.agency_id = "+box.reqParams.agency_id+" AND TBD.bill_id = '"+box.reqParams.bill_id+"' AND TBD.payment_status != '' ";
  var sql = "SELECT TBD.*,CA.average_consumption,JD.previous_reading as PREVIOUSREADING,U.agency_id,CONCAT(U.first_name,' ',U.last_name) as username,AG.name as agency_name,U.mobile_number,U.address_line_1,U.address_line_2,U.city,U.pin_code,S.name as state_name,C.name as country_name,CA.sub_division_id as consumer_sub_division_id FROM temp_bill_details as TBD LEFT JOIN agencies as AG ON AG.id = TBD.agency_id LEFT JOIN consumer_accounts as CA ON CA.consumer_account_number = TBD.consumer_account_number LEFT JOIN job_details as JD on JD.id=TBD.job_detail_id and TBD.consumer_account_number=JD.consumer_account_number LEFT JOIN users as U ON U.user_id = CA.user_id LEFT JOIN states as S ON U.state_id = S.id LEFT JOIN countries as C ON S.country_id = C.id WHERE TBD.agency_id = "+box.reqParams.agency_id+" AND TBD.bill_id = '"+box.reqParams.bill_id+"'";
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
  });
   }

 });
}
