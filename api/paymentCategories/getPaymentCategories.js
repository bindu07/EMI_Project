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
    getAllPaymentCategories.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function getAllPaymentCategories(box, nextFunc) {
  var whoAmI = getAllPaymentCategories.name;
  var sql = "SELECT * FROM payment_categories where utility_board_id = "+box.reqParams.utility_board_id;
  con.query(sql,
  function (err, result) {
        if (err){
          return nextFunc(
            new ActErr(whoAmI, ActErr.DBOperationFailed, 'Get All Payment Categories', err)
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
