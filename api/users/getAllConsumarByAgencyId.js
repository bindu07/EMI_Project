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
    getAllConsumarByAgencyId.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function getAllConsumarByAgencyId(box, nextFunc) {
  var whoAmI = getAllConsumarByAgencyId.name;
  var sql = "SELECT u.user_id,u.status,uuid,first_name,last_name,email_id,mobile_number,date_of_birth,u.address_line_1,u.address_line_2,u.city,s.name as state,u.pin_code,c.name as country,user_role,ag.name as agency_name,u.created_by FROM users u ";
      sql += "LEFT JOIN states as s ON s.id = u.state_id LEFT JOIN countries as c ON c.id = u.country_id LEFT JOIN agencies ag ON ag.id = u.agency_id where u.agency_id = '"+box.reqParams.agency_id+"' AND u.status = 'active' AND u.user_type = 'consumer' AND u.user_role = 'consumer'";
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
