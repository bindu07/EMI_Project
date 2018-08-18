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
    postAccounts.bind(null, box)
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

  if (!box.reqBody.consumer_account_number)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :consumer_account_number')
      );
  if (!box.reqBody.user_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :user_id')
      );
  if (!box.reqBody.service_provider_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :service_provider_id')
      );
  if (!box.reqBody.service_category)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :service_category')
      );
  if (!box.reqBody.connection_type)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :connection_type')
      );
  if (!box.reqBody.sanctioned_load)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :sanctioned_load')
      );
  if (!box.reqBody.district)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :district')
      );
  if (!box.reqBody.zone_1)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :zone_1')
      );
  if (!box.reqBody.zone_2)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :zone_2')
      );
  if (!box.reqBody.installation_date)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :installation_date')
      );
  if (!box.reqBody.tariff_category)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :tariff_category')
      );
  if (!box.reqBody.deposite_amount)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :deposite_amount')
      );
  if (!box.reqBody.currency)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :currency')
      );
  return nextFunc();
}

function postAccounts(box, nextFunc) {
  var whoAmI = postAccounts.name;
  var disconnection_date = "";
  var status = "active";
  var today = new Date();
  var inserting_data = {
    "consumer_account_number"   : box.reqBody.consumer_account_number,
    "user_id"                   : box.reqBody.user_id ,
    "service_provider_id"       : box.reqBody.service_provider_id ,
    "service_category"          : box.reqBody.service_category ,
    "connection_type"           : box.reqBody.connection_type ,
    "sanctioned_load"           : box.reqBody.sanctioned_load ,
    "district"                  : box.reqBody.district ,
    "zone_1"                    : box.reqBody.zone_1 ,
    "zone_2"                    : box.reqBody.zone_2 ,
    "installation_date"         : box.reqBody.installation_date ,
    "tariff_category"           : box.reqBody.tariff_category ,
    "deposite_amount"           : box.reqBody.deposite_amount ,
    "currency"                  : box.reqBody.currency,
    "status"                    : status,
    "created_by"                : box.reqBody.created_by,
    "created_on"                : today
  }
  var sql_validate = "select * from consumer_accounts where consumer_account_number = '"+box.reqBody.consumer_account_number+"'";
  con.query(sql_validate,
    function (err_validate, result_validate) {
      if(result_validate.length == 1){
        box.res.status(401).json({
              status: 'Unauthorized',
              message:"Account Already Exists !"
            });
      }else{
        var sql = 'INSERT INTO consumer_accounts SET ? ';
        con.query(sql,inserting_data,function (err, location) {
          if (err){
            console.info(err);          
            console.info("Error In => "+whoAmI);
            return nextFunc(
              new ActErr(whoAmI, ActErr.DBOperationFailed, 'postAccounts', err)
              );
          }else{
            box.resBody.success = true;
            box.resBody.message = 'account created successfully';
            activity(box.reqBody.created_by,'created',"Account created successfully "+box.reqBody.consumer_account_number)
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
      console.info(randomString);
  }
  return randomString;
}

function replaceString(mystring){
  mystring = mystring.replace(/[@.]/g , ''); 
  return mystring;
}