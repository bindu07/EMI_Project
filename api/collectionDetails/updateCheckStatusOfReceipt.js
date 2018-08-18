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
    checkInputParams.bind(null, box),
    PutCollectionDetails.bind(null, box)
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

  if (!box.reqBody.check_status)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :check_status')
      );
  if (!box.reqBody.created_by)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :created_by')
      );
  return nextFunc();
}

function PutCollectionDetails(box, nextFunc) {
  var whoAmI = PutCollectionDetails.name;
  var today = new Date();
  var inserting_data = {
    "check_status"                : box.reqBody.check_status,
    "updated_by"                  : box.reqBody.created_by,
    "updated_on"                  : today
  }
  var sql = 'UPDATE collection_details SET ? WHERE id = '+ box.reqParams.receipt_id;
  con.query(sql,inserting_data,function (err, result) {
    if (err){
      console.info(err);          
      console.info("Error In => "+whoAmI);
      return nextFunc(
        new ActErr(whoAmI, ActErr.DBOperationFailed, 'PutCollectionDetails', err)
        );
    }else{
      box.resBody.success = true;
      box.resBody.message = 'Receipt Updated successfully';
    }
    return nextFunc();
  });
}

function randomString(charSet) {
  charSet = charSet || 'ACM09ABT';
  charSet = replaceString(charSet);
  var len = 5;
  var randomString = '';
  for (var i = 0; i < len; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz,randomPoz+1);
  }
  return randomString;
}

function replaceString(mystring){
  mystring = mystring.replace(/[@.]/g , ''); 
  return mystring;
}