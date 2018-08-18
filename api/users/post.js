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
    postUsers.bind(null, box)
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

  if (!box.reqBody.first_name)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :first_name')
      );
  if (!box.reqBody.last_name)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :last_name')
      );
  if (!box.reqBody.email_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :email_id')
      );
  if (!box.reqBody.password)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :password')
      );
  if(box.reqBody.user_role != 'agency_admin' || box.reqBody.user_role != 'agency_mr' || box.reqBody.user_role != 'agency_cc'){
    if (!box.reqBody.address_line_1)
      return nextFunc(
        new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :address_line_1')
        );
    if (!box.reqBody.address_line_2)
      return nextFunc(
        new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :address_line_2')
        );
    if (!box.reqBody.state_id)
      return nextFunc(
        new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :state')
        );
    if (!box.reqBody.country_id)
      return nextFunc(
        new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :country')
        );
    if (!box.reqBody.pin_code)
      return nextFunc(
        new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :pincode')
        );
  }
  return nextFunc();
}

function postUsers(box, nextFunc) {
  var whoAmI = postUsers.name;
  var first_name = box.reqBody.first_name;
  var email_id = box.reqBody.email_id;
  var uuid = randomString(email_id+first_name);
  var today = new Date();
  var inserting_data = {
    "uuid"            : uuid,
    "first_name"      : box.reqBody.first_name ,
    "last_name"       : box.reqBody.last_name ,
    "email_id"        : box.reqBody.email_id ,
    "mobile_number"   : box.reqBody.mobile_number ,
    "date_of_birth"   : box.reqBody.date_of_birth ,
    "address_line_1"  : box.reqBody.address_line_1 ,
    "address_line_2"  : box.reqBody.address_line_2 ,
    "city"            : box.reqBody.city ,
    "state_id"        : box.reqBody.state_id ,
    "pin_code"        : box.reqBody.pin_code ,
    "country_id"      : box.reqBody.country_id ,
    "password"        : sha1(box.reqBody.password),
    "user_role"       : box.reqBody.user_role,
    "sub_division_id" : box.reqBody.sub_division_id,
    "user_type"       : box.reqBody.user_type,
    "agency_id"       : box.reqBody.agency_id,
    "created_by"      : box.reqBody.created_by,
    "created_on"      : today
  }
  var sql_validate = "select * from users where email_id = '"+box.reqBody.email_id+"'";
  con.query(sql_validate,
    function (err_validate, result_validate) {
      if(result_validate.length == 1){
        box.res.status(401).json({
              status: 'Unauthorized',
              message:"User "+box.reqBody.email_id+" Already Exists !"
            });
      }else{
        var sql = 'INSERT INTO users SET ? ';
        con.query(sql,inserting_data,function (err, result) {
          if (err){
            console.info(err);          
            console.info("Error In => "+whoAmI);
            return nextFunc(
              new ActErr(whoAmI, ActErr.DBOperationFailed, 'postUsers', err)
              );
          }else{
            box.resBody.success = true;
            box.resBody.message = 'users created successfully';
            box.resBody.id      = result.insertId;
            activity(box.reqBody.created_by,'created',"description")
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