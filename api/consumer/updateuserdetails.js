'use strict';
var async = require('async');
var sha1 = require('sha1');
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
  console.info(box.reqBody)
  console.info(box.whoAmI, 'Starting');

  async.series([
    checkInputParams.bind(null, box),
    updateuserdetails.bind(null, box)
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
  if (!box.reqBody.password)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :password')
      );
  return nextFunc();
}
function updateuserdetails(box, nextFunc) {
  var today = new Date();
    var whoAmI = updateuserdetails.name;
   var inserting_data = {
    "U.mobile_number"         : box.reqBody.mobile_number ,
    "U.password"              : sha1(box.reqBody.password),
    "U.email_id"              : box.reqBody.email_id ,
    "U.updated_by"            : box.reqBody.created_by,
    "U.updated_on"            : today
  }
  var sql ='update users as U left join consumer_accounts as CA on CA.user_id=U.user_id set ? where U.user_id= '+ box.reqParams.user_id;
  con.query(sql,inserting_data,function (err, location) {
    if (err){
      console.info(err);          
      console.info("Error In => "+whoAmI);
      return nextFunc(
        new ActErr(whoAmI, ActErr.DBOperationFailed, 'putCodes', err)
        );
    }else{
      box.resBody.success = true;
      box.resBody.message = 'Agency Details Updated successfully';
      updateuserdetailstoconsumeraccount(box,nextFunc);
    }
    return nextFunc();
  });
}

function updateuserdetailstoconsumeraccount(box, nextFunc) {
  var today = new Date();
    var whoAmI = updateuserdetailstoconsumeraccount.name;
    var inserting_data = {
    "CA.mobile_number"         : box.reqBody.mobile_number ,
    "CA.aadhar_number"            : box.reqBody.aadhar_number ,
    "CA.updated_by"               : box.reqBody.created_by,
    "CA.updated_on"            : today
  }
  var sql ='update consumer_accounts as CA left join users as U on U.user_id=CA.user_id set ? where CA.user_id= '+ box.reqParams.user_id;
  con.query(sql,inserting_data,function (err, location) {
    if (err){
        return false;
    }else{
     
        return true;  
    }
  });
}