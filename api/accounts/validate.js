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
    getUserById.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function getUserById(box, nextFunc) {
  var whoAmI = getUserById.name;
  var sql = "SELECT * FROM users WHERE email_id = '"+box.reqBody.email_id+"' AND password = '"+sha1(box.reqBody.password)+"'";
  con.query(sql,
  function (err, result) {
        if (err){
          console.info(err)
          console.info("Error In => "+whoAmI);
          return nextFunc(
            new ActErr(whoAmI, ActErr.DBOperationFailed, 'Get User By Id', err)
            );
        }else{
          // if(result == 1){
            box.resBody.message = "Login Sucusses Full";
            box.resBody.value = result;
          // }
        }
    return nextFunc();
  }
  );
}
