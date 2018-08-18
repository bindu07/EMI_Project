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
  async.series([
    putUtilityBoard.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}
function putUtilityBoard(box, nextFunc) {
  var whoAmI = box.whoAmI + '_' + putUtilityBoard.name;
  var today = new Date();
  var inserting_data = {
    "utility_board_name"        : box.reqBody.utility_board_name ,
    "utility_id"                : box.reqBody.utility_id ,
    "state_id"                  : box.reqBody.state_id ,
    "country_id"                : box.reqBody.country_id ,
    "status"                    : box.reqBody.status,
    "updated_by"                : box.reqBody.created_by,
    "updated_on"                : today
  }
  var sql = 'UPDATE utility_board SET ? WHERE id = '+ box.reqParams.utility_board_id;
  con.query(sql,inserting_data,function (err, location) {
    if (err){
      console.info(err);          
      console.info("Error In => "+whoAmI);
      return nextFunc(
        new ActErr(whoAmI, ActErr.DBOperationFailed, 'putUtilityBoard', err)
        );
    }else{
      box.resBody.success = true;
      box.resBody.message = 'Utility Board Details Updated successfully';
    }
    return nextFunc();
  });
}