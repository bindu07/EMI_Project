'use strict';
var async = require('async');
var sha1 = require('sha1');

require('../../helpers/randomString.js');

module.exports = post;

function post(req, res) {
  var box = {
    req: req,
    res: res,
    reqBody: req.body,
    resBody: {}
  };
  async.series([
    checkInputParams.bind(null, box),
    postUtilityBoard.bind(null, box)
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

  if (!box.reqBody.utility_board_name)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :utility_board_name')
      ); 
  if (!box.reqBody.utility_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :utility_id')
      ); 
  if (!box.reqBody.state_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :state_id')
      ); 
  if (!box.reqBody.country_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :country_id')
      ); 
  if (!box.reqBody.created_by)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :created_by')
      );  
  return nextFunc();
}

function postUtilityBoard(box, nextFunc) {
  var whoAmI = postUtilityBoard.name;
  var disconnection_date = "";
  var status = "active";
  var today = new Date();
  var inserting_data = {
    "utility_board_name"        : box.reqBody.utility_board_name ,
    "utility_id"                : box.reqBody.utility_id ,
    "state_id"                  : box.reqBody.state_id ,
    "country_id"                : box.reqBody.country_id ,
    "status"                    : status,
    "created_by"                : box.reqBody.created_by,
    "created_on"                : today
  }
  var sql_validate = "select * from utility_board where utility_board_name = '"+box.reqBody.utility_board_name+"'";
  con.query(sql_validate,
    function (err_validate, result_validate) {
      if(result_validate.length >= 1){
        box.res.status(401).json({
              status: 'Unauthorized',
              message:"Utility Board "+box.reqBody.utility_board_name+" Already Exists !"
            });
      }else{
        var sql = 'INSERT INTO utility_board SET ? ';
        con.query(sql,inserting_data,function (err, result) {
          if (err){
            console.info(err);          
            console.info("Error In => "+whoAmI);
            return nextFunc(
              new ActErr(whoAmI, ActErr.DBOperationFailed, 'postUtilityBoard', err)
              );
          }else{
            box.resBody.success = true;
            box.resBody.message = 'Utility Board created successfully';
            box.resBody.id      = result.insertId;
            activity(box.reqBody.created_by,'created',"Utility Board created successfully "+box.reqBody.name)
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