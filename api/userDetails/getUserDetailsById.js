"use strict";
var async = require("async");
module.exports = get;

function get(req, res) {
  var box = {
    req: req,
    reqParams: req.params,
    res: res,
    reqBody: req.body,
    resBody: {}
  };

  async.series([getUserDetailsById.bind(null, box)], function(err) {
    if (err) return respondWithError(res, err);
    sendJSONResponse(res, box.resBody);
  });
}

function getUserDetailsById(box, nextFunc) {
  var whoAmI = getUserDetailsById.name;
  console.info(box.reqParams);
  var sql = "SELECT user_id,password,user_name FROM user_details";
  //   sql +=
  //     "LEFT JOIN states as s ON s.id = u.state_id LEFT JOIN countries as c ON c.id = u.country_id";
  sql += " WHERE user_id = " + box.reqParams.user_id;
  con.query(sql, function(err, result) {
    if (err) {
      console.info(err);
      console.info("Error In => " + whoAmI);
      return nextFunc(
        new ActErr(whoAmI, ActErr.DBOperationFailed, "Get User By Id", err)
      );
    } else {
      if (result.length >= 1) {
        box.resBody.success = true;
        box.resBody.data = result;
      } else {
        box.resBody.success = false;
        box.resBody.message = "No Records Found !";
      }
    }
    return nextFunc();
  });
}
