'use strict';
var async = require('async');
require('../../helpers/randomString.js');

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
    // checkInputParams.bind(null, box),
    putUserContactDetails.bind(null, box)
    ],
    function (err) {
      console.info(box.whoAmI, 'Completed');
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}
function checkInputParams(box, nextFunc) {
  var whoAmI = box.whoAmI + '_' + checkInputParams.name;
  console.debug('Executing ->', whoAmI );

  if (!box.reqBody)
    return nextFunc(
      new ActErr(whoAmI, ActErr.BodyNotFound, 'Missing body')
      );
  if (!box.reqBody.mobile_number)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :mobile_number')
      );
  return nextFunc();
}

function putUserContactDetails(box, nextFunc) {
  var whoAmI = putUserContactDetails.name;
  var today = new Date();
  var inserting_data = {
    "mobile_number"   : box.reqBody.mobile_number,
    "email_id"        : box.reqBody.email_id,
    "updated_by"      : box.reqBody.created_by,
    "updated_on"      : today
  }
  var sql_validate = "select user_id from consumer_accounts where consumer_account_number = '"+box.reqParams.consumer_account_number+"'";
  console.info(sql_validate);
  con.query(sql_validate,function (err_validate, result_validate) {
    console.info("result_validate");
    console.info(result_validate);
    if (err_validate){
      return nextFunc(
            new ActErr(whoAmI, ActErr.DBOperationFailed, 'putUserContactDetails', err)
            );
    }else if(result_validate[0].user_id != ""){
      var sql = 'UPDATE users SET ? WHERE user_id = '+ result_validate[0].user_id;
      con.query(sql,inserting_data,function (err, result) {
        if (err){
          console.info(err);          
          console.info("Error In => "+whoAmI);
          return nextFunc(
            new ActErr(whoAmI, ActErr.DBOperationFailed, 'putUserContactDetails', err)
            );
        }else{
          box.resBody.success = true;
          box.resBody.message = 'User Contact Details Updated successfully';
        }
        return nextFunc();
      });
    }else{
      box.res.status(401).json({
            status: 'Unauthorized',
            message:"User Doesn't Exists !"
          });
    }
  });
}