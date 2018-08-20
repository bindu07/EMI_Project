"use strict";
var async = require("async");
var sha1 = require("sha1");
module.exports = post;

function post(req, res) {
  var box = {
    req: req,
    reqParams: req.params,
    res: res,
    reqBody: req.body,
    resBody: {}
  };

  async.series([validateUsers.bind(null, box)], function(err) {
    if (err) return respondWithError(res, err);
    sendJSONResponse(res, box.resBody);
  });
}

function validateUsers(box, nextFunc) {
  var whoAmI = validateUsers.name;
  var sql =
    "SELECT * FROM user_details WHERE user_email_id = '" +
    box.reqBody.user_email_id +
    "' AND password = '" +
    sha(box.reqBody.password) +
    "'";
  con.query(sql, function(err, result) {
    if (err) {
      console.info(err);
      console.info("Error In => " + whoAmI);
      return nextFunc(
        new ActErr(whoAmI, ActErr.DBOperationFailed, "Get User By Id", err)
      );
    } else {
      // if(result == 1){
      // box.resBody.message = "Login Sucusses Full";
      // box.resBody.value = result;
      // }

      // console.info(result.length);
      // if (result.length == "1") {
      //   box.res.status(200).json({
      //     status: "Authorized",
      //     message: "Login Sucusses Full",
      //     value: result
      //   });
      // } else {
      //   box.res.status(401).json({
      //     status: "Unauthorized",
      //     message: "Login Failed,Please Enter Valid Details"
      //   });
      // }

      console.info(result.length);
      console.info(result);
      if (result.length >= "1") {
        // box.res.status(200).json({
        //   status: 'Authorized',
        //   message:"Login Sucusses Full",
        //   value : result
        // });
        box.resBody.status = "Authorized";
        box.resBody.message = "Login Sucusses Full";
        box.resBody.value = result;
      } else {
        // box.res.status(401).json({
        //   status: 'Unauthorized',
        //   message:"Login Failed ! Please Enter Valid Details"
        // });
        global.validate_api = false;
        box.res.status(401);
        box.resBody.status = "Unauthorized";
        box.resBody.message = "Login Failed ! Please Enter Valid Details";
      }
    }
    return nextFunc();
  });
}
