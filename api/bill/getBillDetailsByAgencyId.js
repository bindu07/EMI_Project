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
    getAllDetailsByAgencyId.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function getAllDetailsByAgencyId(box, nextFunc) {
  var whoAmI = getAllDetailsByAgencyId.name;
  var sql = "SELECT * FROM bill_details WHERE agency_id = '"+box.reqParams.agency_id+"' AND payment_status != 'Full Payment' ORDER BY bill_detail_id DESC ";
  con.query(sql,
  function (err, result) {
        if (err){
          console.info(err)
          console.info("Error In => "+whoAmI);
          return nextFunc(
            new ActErr(whoAmI, ActErr.DBOperationFailed, 'Get All Account Details By Agency Id', err)
            );
        }else{
          box.resBody = result;
        }
    return nextFunc();
  }
  );
}
