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
    getPaymentHistoryByCustomerId.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function getPaymentHistoryByCustomerId(box, nextFunc) {
  var whoAmI = getPaymentHistoryByCustomerId.name;
  var sql = "SELECT * FROM collection_details where consumer_account_number="+box.reqParams.consumer_account_number;
  con.query(sql,
  function (err, result) {
        if (err){
          console.info(err)
          console.info("Error In => "+whoAmI);
          return nextFunc(
            new ActErr(whoAmI, ActErr.DBOperationFailed, 'Get  Receipt Details By Bill Id', err)
            );
        }else{
          if(result==""){
           box.resBody.message = "No Record Found";
          }else{
            box.resBody = result;
          }
        }
    return nextFunc();
  }
  );
}