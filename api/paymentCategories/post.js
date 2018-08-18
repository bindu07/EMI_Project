'use strict';
var async = require('async');
var sha1 = require('sha1');

require('../../helpers/randomString.js');

module.exports = post;

function post(req, res) {
  var whoAmI = post.name;
  var box = {
    req: req,
    res: res,
    reqBody: req.body,
    resBody: {}
  };
  async.series([
    checkInputParams.bind(null, box),
    postPaymentCategories.bind(null, box)
    ],
    function (err) {
      console.info(whoAmI, 'Completed');
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

  if (!box.reqBody.name)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :name')
      );  
  return nextFunc();
}

function postPaymentCategories(box, nextFunc) {
  var whoAmI = postPaymentCategories.name;
  var disconnection_date = "";
  var status = "active";
  var today = new Date();
  var inserting_data = {
    "name"                      : box.reqBody.name ,
    "status"                    : status,
    "created_by"                : box.reqBody.created_by,
    "created_on"                : today
  }
  var sql_validate = "select * from utilities where name = '"+box.reqBody.name+"'";
  con.query(sql_validate,
    function (err_validate, result_validate) {
      if(result_validate.length >= 1){
        box.res.status(401).json({
              status: 'Unauthorized',
              message:"Utility Already Exists !"
            });
      }else{
        var sql = 'INSERT INTO utilities SET ? ';
        con.query(sql,inserting_data,function (err, result) {
          if (err){
            console.info(err);          
            console.info("Error In => "+whoAmI);
            return nextFunc(
              new ActErr(whoAmI, ActErr.DBOperationFailed, 'postPaymentCategories', err)
              );
          }else{
            box.resBody.success = true;
            box.resBody.message = 'Utility created successfully';
            box.resBody.id      = result.insertId;
            activity(box.reqBody.created_by,'created',"Utility created successfully "+box.reqBody.name)
          }
          return nextFunc();
        });
      }
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