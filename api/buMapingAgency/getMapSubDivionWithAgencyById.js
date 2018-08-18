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
    getMapSubDivionWithAgencyById.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function getMapSubDivionWithAgencyById(box, nextFunc) {
  var whoAmI = getMapSubDivionWithAgencyById.name;
  var sql = "SELECT * FROM bu_mapping_agency as BUMA LEFT JOIN utility_board as UB ON UB.id = BUMA.utility_board_id LEFT JOIN agencies as ag ON ag.id = BUMA.agency_id LEFT JOIN sub_division as sd ON sd.id = BUMA.sub_division_id   WHERE BUMA.id = "+box.reqParams.bu_agency_mapping_id;
  console.info(sql);
  con.query(sql,
  function (err, result) {
        if (err){
          console.info(err)
          console.info("Error In => "+whoAmI);
          return nextFunc(
            new ActErr(whoAmI, ActErr.DBOperationFailed, 'Get One Sub Division Mapping Agency Details', err)
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
