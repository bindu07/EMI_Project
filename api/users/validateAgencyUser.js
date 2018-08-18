'use strict';
var async = require('async');
var sha1 = require('sha1');
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
    getAgencyUserById.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res);
    });
}

function getAgencyUserById(box, nextFunc) {
  var whoAmI = getAgencyUserById.name;
  var UserMappingToSubDivision = 'LEFT JOIN  sub_division as SD ON SD.id = U.sub_division_id LEFT JOIN bu_mapping_agency AS BMA ON BMA.sub_division_id = SD.id LEFT JOIN agencies AG ON AG.id = BMA.agency_id ';
  var sql = "SELECT U.user_id,U.email_id,U.mobile_number,U.user_role,U.date_of_birth,U.agency_id,CONCAT(U.first_name,'_',U.last_name) as username,SD.sub_division_name,AG.name as agency_name FROM users as U "+UserMappingToSubDivision+" WHERE U.email_id = '"+box.reqBody.email_id+"' AND U.password = '"+sha1(box.reqBody.password)+"' AND U.agency_id = '"+box.reqBody.agency_id+"'  AND U.status = 'active'";
  con.query(sql,
  function (err, result) {
        if (err){
          console.info(err)
          console.info("Error In => "+whoAmI);
          return nextFunc(
            new ActErr(whoAmI, ActErr.DBOperationFailed, 'Get User By Id', err)
            );
        }else{
          console.info(result.length);
          if(result.length == '1'){
            box.res.status(200).json({
              status: 'Authorized',
              message:"Login Sucusses Full",
              value : result
            });
          }else{
            box.res.status(401).json({
              status: 'Unauthorized',
              message:"Login Failed ! Please Enter Valid Details"
            });
          }
        }
    return nextFunc();
  }
  );
}
