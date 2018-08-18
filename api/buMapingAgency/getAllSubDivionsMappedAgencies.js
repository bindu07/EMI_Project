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
    getAllSubDivionsMappedAgencies.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function getAllSubDivionsMappedAgencies(box, nextFunc) {
  var whoAmI = getAllSubDivionsMappedAgencies.name;
  var sql = "SELECT * FROM bu_mapping_agency as BUMA LEFT JOIN utility_board as UB ON UB.id = BUMA.utility_board_id LEFT JOIN agencies as ag ON ag.id = BUMA.agency_id LEFT JOIN sub_division as sd ON sd.id = BUMA.sub_division_id ";
  con.query(sql,
  function (err, result) {
        if (err){
          console.info(err)
          console.info("Error In => "+whoAmI);
          return nextFunc(
            new ActErr(whoAmI, ActErr.DBOperationFailed, 'Get All Sub Division Mapping Agency', err)
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
  });
}
