'use strict';
var async = require('async');
module.exports = post;

function post(req, res) {
  var box = {
    req: req,
    res: res,
    reqParams: req.params,
    reqBody: req.body,
    resBody: {}
  };
  async.series([
    changeCollectionDetailsStatus.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function changeCollectionDetailsStatus(box, nextFunc) {
  var whoAmI = changeCollectionDetailsStatus.name;
  var today = new Date();
  var inserting_data = {
    "status"          : box.reqBody.status,
    "updated_by"      : box.reqBody.created_by,
    "updated_on"      : today
  }
  var sql = 'UPDATE users SET ? WHERE id = '+ box.reqParams.receipt_id;
  con.query(sql,inserting_data,function (err, result) {
    if (err){
      console.info(err);          
      console.info("Error In => "+whoAmI);
      return nextFunc(
        new ActErr(whoAmI, ActErr.DBOperationFailed, 'changeCollectionDetailsStatus', err)
        );
    }else{
      box.resBody.success = true;
      box.resBody.message = 'User Status Updated successfully';
    }
    return nextFunc();
  });
}