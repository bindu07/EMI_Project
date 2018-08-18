'use strict';
var async = require('async');
var sha1 = require('sha1');
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
    updateforgetpassword.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function updateforgetpassword(box, nextFunc) {
  var whoAmI = updateforgetpassword.name;
  var today = new Date();
  var inserting_data = {
    "password"        : sha1(box.reqBody.password),
    "updated_by"      : box.reqBody.created_by,
    "updated_on"      : today
  }
  var sql = 'UPDATE users SET ? WHERE email_id="'+box.reqBody.email_id+'"';
  con.query(sql,inserting_data,function (err, result) {
    if (err){
      console.info(err);          
      console.info("Error In => "+whoAmI);
      return nextFunc(
        new ActErr(whoAmI, ActErr.DBOperationFailed, 'changeUserStatus', err)
        );
    }else{
      box.resBody.success = true;
      box.resBody.message = 'User Password Updated successfully';
    }
    return nextFunc();
  });
}