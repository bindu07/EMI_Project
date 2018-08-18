'use strict';
var async = require('async');
require('../../helpers/randomString.js');
require('../../helpers/sendSms.js');

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
    putMeterDetailsForJobDetails.bind(null, box)
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

  if (!box.reqBody.job_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :job_id')
      );
  if (!box.reqBody.meter_reading_status)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :meter_reading_status')
      );
  if (!box.reqBody.meter_reading)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :meter_reading')
      );

  if (!box.reqBody.uom)
      return nextFunc(
        new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :uom')
        );
  if (!box.reqBody.reading_taken_on)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :reading_taken_on')
      );
  if (!box.reqBody.meter_reader_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :meter_reader_id')
      );
  if (!box.reqBody.job_detail_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :job_detail_id')
      );
  if (!box.reqBody.job_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :job_id')
      );
  if (!box.reqBody.consumer_account_number)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :consumer_account_number')
      );

  if (!box.reqBody.error_code)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :error_code')
      );
  if (!box.reqBody.created_by)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :created_by')
      );
  return nextFunc();
}


function putMeterDetailsForJobDetails(box, nextFunc) {
  var whoAmI = putMeterDetailsForJobDetails.name;
  var today = new Date();
  var inserting_data = {
    "meter_reading_status"        : box.reqBody.meter_reading_status ,
    "meter_reading"               : box.reqBody.meter_reading ,
    "uom"                         : box.reqBody.uom,
    "error_code"                  : box.reqBody.error_code ,
    "reading_taken_on"            : box.reqBody.reading_taken_on,
    "meter_reader_id"             : box.reqBody.meter_reader_id,
    "url"                         : box.reqBody.url,
    "previous_reading"            : box.reqBody.previous_reading,
    "consumption"                 : parseInt(box.reqBody.meter_reading)-parseInt(box.reqBody.previous_reading),
    "updated_by"                  : box.reqBody.created_by,
    "updated_on"                  : today
  }
  var sql = 'UPDATE job_details SET ? WHERE id = "'+ box.reqParams.job_detail_id+'" AND job_id = "'+box.reqParams.job_id+'" AND consumer_account_number = "'+box.reqParams.consumer_account_number+'"';
  con.query(sql,inserting_data,function (err, result) {
    if (err){
      console.info(err);
      console.info("Error In => "+whoAmI);
      return nextFunc(
        new ActErr(whoAmI, ActErr.DBOperationFailed, 'putMeterDetailsForJobDetails', err)
        );
    }else{
      updateStatusOfConsumerAccountNumber(box.reqBody.consumer_account_number,box.reqBody.average_consumption,box.reqBody.previous_reading);
      if(box.reqBody.error_code=="2"){
          sendSMSToConsumer(box.reqBody.consumer_account_number);
      }
      else{
          sendSMSToConsumer1(box.reqBody.consumer_account_number,box.reqBody.reading_taken_on,box.reqBody.meter_reading);
      }
      box.resBody.success = true;
      box.resBody.message = 'Meter Reading Taken successfully';
    }
    return nextFunc();
  });
}

function updateStatusOfConsumerAccountNumber(consumer_account_number,average_consumption,previous_reading){
   var inserting_data = {
    "job_assigined"                 : "yes",
    "meter_reading_taken"           : "yes",
    "average_consumption"           : average_consumption,
    "previous_reading"              : previous_reading
  }
  console.info("consumer_account_number => "+consumer_account_number);
  console.info("Updating The consumer account job_assigined and meter_reading_taken : status");
  console.info(inserting_data);
  var sql = 'UPDATE consumer_accounts SET ? WHERE consumer_account_number = "'+consumer_account_number+'" AND status = "active"';
  console.info(sql);
  con.query(sql,inserting_data,function (err, result) {
    if (err){
      return false;
    }else{
      return true;
    }
  });
}
function sendSMSToConsumer(consumer_account_number){
  var sql="SELECT U.mobile_number FROM consumer_accounts as CA LEFT JOIN users U ON CA.user_id = U.user_id WHERE CA.consumer_account_number="+consumer_account_number;
  con.query(sql,function (err, result) {
    if (err){
      return false;
    }else{
      console.info(result);
      var mobile_number=result[0].mobile_number;
        sendSms(mobile_number,'MJP water reader visited of your premices for reading consu no '+consumer_account_number+' but Reading get Abnormal status of House Lockx please update your reading on Mobile App of our link xxxxxxx.');
    }
  });
}
function sendSMSToConsumer1(consumer_account_number,reading_taken_on,meter_reading){
  var sql="SELECT U.mobile_number,TB.bill_month FROM consumer_accounts as CA LEFT JOIN  users U ON CA.user_id = U.user_id   LEFT JOIN  temp_bill_details  TB on  CA.consumer_account_number=TB.consumer_account_number WHERE CA.consumer_account_number="+consumer_account_number;
  con.query(sql,function (err, result) {
    if (err){
      return false;
    }else{
      var mobile_number=result[0].mobile_number;
      var billingMonth=result[0].bill_month;
          sendSms(mobile_number,'MJP water Meter read for cons '+consumer_account_number+' on '+reading_taken_on+' Reading '+meter_reading+' Consumption for month '+billingMonth+' Pl check reading. In case of complaint contact xxxxxxx.');  
    }
  });
}
