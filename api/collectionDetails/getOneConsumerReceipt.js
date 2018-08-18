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
    getOneReceipt.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function getOneReceipt(box, nextFunc) {
  var whoAmI = getOneReceipt.name;
  var UserMappingToSubDivision = 'LEFT JOIN  sub_division as SD ON SD.id = U.sub_division_id LEFT JOIN bu_mapping_agency AS BMA ON BMA.sub_division_id = SD.id LEFT JOIN agencies AG ON AG.id = BMA.agency_id ';
  var sql = "SELECT TBD.*,cd.*,U.agency_id,CONCAT(U.first_name,' ',U.last_name) as username,SD.sub_division_name,AG.name as agency_name,U.mobile_number,U.address_line_1,U.address_line_2,U.city,U.pin_code,S.name as state_name,C.name as country_name,PC.payment_category_name FROM collection_details as cd LEFT JOIN consumer_accounts as CA ON CA.consumer_account_number = cd.consumer_account_number LEFT JOIN users as U ON U.user_id = CA.user_id LEFT JOIN states as S ON U.state_id = S.id LEFT JOIN countries as C ON S.country_id = C.id LEFT JOIN temp_bill_details as TBD ON TBD.bill_id = cd.bill_id LEFT JOIN payment_categories as PC ON PC.id = cd.payment_category_id "+UserMappingToSubDivision+" WHERE cd.id = "+box.reqParams.receipt_id+"";
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
