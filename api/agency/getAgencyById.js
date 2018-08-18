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
    getAgencyById.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function getAgencyById(box, nextFunc) {
  var whoAmI = getAgencyById.name;
  var sql = "SELECT A.*,u.name as utility_name,UB.utility_board_name,S.name as state_name,C.name as country_name FROM agencies as A LEFT JOIN utilities u ON u.id = A.utility_id LEFT JOIN utility_board as UB ON UB.id = A.utility_board_id LEFT JOIN states S ON S.id = A.state_id LEFT JOIN countries C ON C.id = A.country_id WHERE A.id = "+box.reqParams.agency_id;
  console.info(sql);
  con.query(sql,
  function (err, result) {
        if (err){
          console.info(err)
          console.info("Error In => "+whoAmI);
          return nextFunc(
            new ActErr(whoAmI, ActErr.DBOperationFailed, 'Get One Agency Details', err)
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
