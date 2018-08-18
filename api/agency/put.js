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
    putAgency.bind(null, box)
    ],
    function (err) {
      console.info(box.whoAmI, 'Completed');
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}
function putAgency(box, nextFunc) {
  var today = new Date();
  var inserting_data = {
    "utility_id"                : box.reqBody.utility_id ,
    "utility_board_id"          : box.reqBody.utility_board_id ,
    "name"                      : box.reqBody.name ,
    "address_line_1"            : box.reqBody.address_line_1 ,
    "address_line_2"            : box.reqBody.address_line_2 ,
    "locality"                  : box.reqBody.locality ,
    "pin_code"                  : box.reqBody.pin_code ,
    "state_id"                  : box.reqBody.state_id ,
    "country_id"                : box.reqBody.country_id ,
    "status"                    : box.reqBody.status ,
    "updated_by"                : box.reqBody.created_by,
    "updated_on"                : today
  }
  var sql = 'UPDATE agencies SET ? WHERE id = '+ box.reqParams.agency_id;
  con.query(sql,inserting_data,function (err, location) {
    if (err){
      console.info(err);          
      console.info("Error In => "+whoAmI);
      return nextFunc(
        new ActErr(whoAmI, ActErr.DBOperationFailed, 'putAgency', err)
        );
    }else{
      box.resBody.success = true;
      box.resBody.message = 'Agency Details Updated successfully';
    }
    return nextFunc();
  });
}