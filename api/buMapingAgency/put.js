'use strict';
var async = require('async');
require('../../helpers/randomString.js');

module.exports = post;

function post(req, res) {
  var box = {
    req: req,
    res: res,
    reqParams: req.params,
    reqBody: req.body,
    resBody: {}
  };
  console.info(box.reqBody)
  console.info(box.whoAmI, 'Starting');

  async.series([
    putSubDivisionMappingAgency.bind(null, box)
    ],
    function (err) {
      console.info(box.whoAmI, 'Completed');
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}
function putSubDivisionMappingAgency(box, nextFunc) {
  var today = new Date();
  var inserting_data = {
    "utility_board_id"          : box.reqBody.utility_board_id ,
    "agency_id"                 : box.reqBody.agency_id ,
    "sub_division_id"           : box.reqBody.sub_division_id ,
    "start_date"                : box.reqBody.start_date ,
    "end_date"                  : box.reqBody.end_date ,
    "updated_by"                : box.reqBody.created_by,
    "updated_on"                : today
  }
  var sql = 'UPDATE bu_mapping_agency SET ? WHERE id = '+ box.reqParams.bu_agency_mapping_id;
  con.query(sql,inserting_data,function (err, location) {
    if (err){
      console.info(err);          
      console.info("Error In => "+whoAmI);
      return nextFunc(
        new ActErr(whoAmI, ActErr.DBOperationFailed, 'putSubDivisionMappingAgency', err)
        );
    }else{
      box.resBody.success = true;
      box.resBody.message = 'Sub Division Mapping Agency Updated successfully';
    }
    return nextFunc();
  });
}