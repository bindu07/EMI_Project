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
    getUserById.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function getUserById(box, nextFunc) {
  var whoAmI = getUserById.name;
  var sql = "SELECT u.user_id,u.status,uuid,first_name,last_name,email_id,mobile_number,date_of_birth,address_line_1,address_line_2,city,s.name as state,pin_code,c.name as country,user_role,agency_id,u.created_by FROM users u ";
      sql += "LEFT JOIN states as s ON s.id = u.state_id LEFT JOIN countries as c ON c.id = u.country_id";
      sql += " WHERE user_id = "+box.reqParams.user_id;
  con.query(sql,
  function (err, result) {
        if (err){
          console.info(err)
          console.info("Error In => "+whoAmI);
          return nextFunc(
            new ActErr(whoAmI, ActErr.DBOperationFailed, 'Get User By Id', err)
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
