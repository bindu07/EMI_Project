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
  console.info(box.reqBody)
  console.info(box.whoAmI, 'Starting');

  async.series([
    checkInputParams.bind(null, box),
    UpdateConsumer.bind(null, box)
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
    if(!box.reqBody.first_name)
        return nextFunc(
          new ActErr(whoAmI,ActErr.DataNotFound,'Missing body data : first_name')
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
  if (!box.reqBody.address_line_1)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :address_line_1')
      );
  if (!box.reqBody.address_line_2)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :address_line_2')
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
//upadte Consumer//
function UpdateConsumer(box, nextFunc) {
 var whoAmI = UpdateConsumer.name;
  var role="consumer"
  var disconnection_date = "";
  var status = "active";
  var charSet = box.reqBody.first_name+ box.reqBody.consumer_account_number || 'ACM09ABT';
  charSet = replaceString(charSet);
  var len = 5;
  var randomString = '';
  for (var i = 0; i <len; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz,randomPoz+1);
       
  }
  var today = new Date();
  var inserting_data = {
    "uuid"                      : randomString,
    "first_name"                : box.reqBody.first_name,
    "last_name"                 : box.reqBody.last_name,
    "email_id"                  : box.reqBody.email_id,
    "mobile_number"             : box.reqBody.mobile_number,
    "address_line_1"            : box.reqBody.address_line_1,
    "address_line_2"            : box.reqBody.address_line_2,
    "city"                      : box.reqBody.city,
    "date_of_birth"             : today,
    "state_id"                  : box.reqBody.state_id,
    "pin_code"                  : box.reqBody.pin_code,
    "country_id"                : box.reqBody.country_id,
    "agency_id"                 : box.reqBody.agency_id,
    "sub_division_id"           : box.reqBody.sub_division_id,
    "status"                    : box.reqBody.status,
    "user_type"                 : role,
    "updated_on"                : today,
    "updated_by"                : box.reqBody.updated_by
  }
  var sql = 'UPDATE  users SET ? WHERE user_id = '+ box.reqParams.user_id;
  con.query(sql,inserting_data,function (err, location) {
    if (err){
      console.info(err);          
      console.info("Error In => "+whoAmI);
      return nextFunc(
        new ActErr(whoAmI, ActErr.DBOperationFailed, 'UpdateConsumer', err)
        );
    }else{
      updateConsumerTable(box);
      box.resBody.success = true;
      box.resBody.message = 'Consumer Details Updated successfully';
    }
    return nextFunc();
  });
}
  function updateConsumerTable (box){
     var whoAmI = updateConsumerTable.name;           
    var jobassigned="no"
    var status = "active";
    var today = new Date();
    var insert_consumerdata={
    "consumer_account_number"   : box.reqBody.consumer_account_number,
    "sub_division_id"           : box.reqBody.sub_division_id,
    "service_provider_id"       : box.reqBody.service_provider_id,
    "user_id"                   : box.reqParams.user_id,
    "service_category"          : box.reqBody.service_category,
    "water_connection_category" : box.reqBody.water_connection_category,
    "connection_type"           : box.reqBody.connection_type,
    "sanctioned_load"           : box.reqBody.sanctioned_load,
    "district"                  : box.reqBody.district,
    "zone_1"                    : box.reqBody.zone_1,
    "zone_2"                    : box.reqBody.zone_2,
    "is_apartment"              : box.reqBody.is_apartment,
    "number_of_apartments"      : box.reqBody.number_of_apartments,
    "pipe_diameter"             : box.reqBody.pipe_diameter,
    "installation_date"         : today,
    "tariff_category"           : box.reqBody.tariff_category,
    "old_consumer_number"       : box.reqBody.old_consumer_number,
    "deposite_amount"           : box.reqBody.deposite_amount,
    "currency"                  : box.reqBody.currency,
    "status"                    : box.reqBody.status,
    "processing_cycle"          : box.reqBody.processing_cycle,
    "route_no"                  : box.reqBody.route_no,
    "address_line_1"            : box.reqBody.address_line_1,
    "address_line_2"            : box.reqBody.address_line_2,
    "area"                      : box.reqBody.area,
    "state_id"                  : box.reqBody.state_id,
    "mobile_number"             : box.reqBody.mobile_number,
    "pincode"                   : box.reqBody.pin_code,
    "meter_number"              : box.reqBody.meter_number,
    "meter_status"              : box.reqBody.meter_status,
    "own_meter"                 : box.reqBody.own_meter,
    "installation_date"         : today,
    "country_id"                : box.reqBody.country_id,
    "job_assigined"             : jobassigned,
    "updated_on"                : today,
    "updated_by"                : box.reqBody.updated_by,
    "aadhar_number"             : box.reqBody.aadhar_number,
    "average_consumption"       : box.reqBody.average_consumption
    }
  var sql = 'UPDATE  consumer_accounts SET ? WHERE user_id = '+ box.reqParams.user_id;
  con.query(sql,insert_consumerdata,function (err, location) {
    if(err){
      return false;
       }else {
        return true;

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
