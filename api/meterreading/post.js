'use strict';
var async = require('async');
require('../../helpers/randomString.js');
require('../../helpers/sendSms.js');
var moment = require('moment');

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
  if (!box.reqBody.previous_reading)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :previous_reading')
      );

  /*if (!box.reqBody.previous_error_code_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :previous_error_code_id')
      );*/

  //if (parseInt(box.reqBody.previous_reading) > parseInt(box.reqBody.meter_reading))
    //return nextFunc(
      //new ActErr(whoAmI, ActErr.DataNotFound, 'Please Check Meter Reading And Previous Reading Values')
      //);

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
  if (!box.reqBody.update_contact_details){
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :update_contact_details')
      );
  }
  /*if (box.reqBody.update_contact_details == 'yes'){
    if (!box.reqBody.mobile_number)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :mobile_number')
      );
  }*/
  if (!box.reqBody.update_route_no){
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :update_route_no')
      );
  }
  if (box.reqBody.update_route_no == 'yes'){
    if (!box.reqBody.route_no)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :route_no')
      );
  }
  if (!box.reqBody.update_connection_type){
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :update_connection_type')
      );
  }
  if (box.reqBody.update_connection_type == 'yes'){
    if (!box.reqBody.new_connection_type)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :new_connection_type')
      );
  }
  return nextFunc();
}


function putMeterDetailsForJobDetails(box, nextFunc) {
  var whoAmI = putMeterDetailsForJobDetails.name;
  var today = new Date();
  var inserting_data = {
    "meter_reading_status"        : box.reqBody.meter_reading_status ,
    "meter_reading"               : box.reqBody.meter_reading ,
    "previous_reading"            : box.reqBody.previous_reading ,
    "previous_error_code"         : box.reqBody.previous_error_code_id,
    "consumption"                 : parseInt(box.reqBody.meter_reading)-parseInt(box.reqBody.previous_reading),
    "uom"                         : box.reqBody.uom,
    "error_code"                  : box.reqBody.error_code ,
    "reading_taken_on"            : box.reqBody.reading_taken_on,
    "meter_reader_id"             : box.reqBody.meter_reader_id,
    "url"                         : box.reqBody.url,
    "original_meter_reading"      : box.reqBody.meter_reading,
    "original_error_code"         : box.reqBody.error_code,
    "original_picture_url"        : box.reqBody.url,
    "updated_by"                  : box.reqBody.created_by,
    "updated_on"                  : today
  }
  if(box.reqBody.update_contact_details == 'yes'){
    updateUserContactDetails(box);
  }
  if(box.reqBody.update_route_no == 'yes'){
    updateRouteNumberConsumerAccountNumber(box.reqBody.consumer_account_number,box.reqBody.route_no)
  }
  if(box.reqBody.update_connection_type == 'yes'){
    updateRouteNumberConsumerAccountNumber(box.reqBody.consumer_account_number,box.reqBody.new_connection_type)
  }
  var sql = 'UPDATE job_details SET ? WHERE id = "'+ box.reqBody.job_detail_id+'" AND job_id = "'+box.reqBody.job_id+'" AND consumer_account_number = "'+box.reqBody.consumer_account_number+'"';
  con.query(sql,inserting_data,function (err, result) {
    if (err){
      console.info(err);
      console.info("Error In => "+whoAmI);
      return nextFunc(
        new ActErr(whoAmI, ActErr.DBOperationFailed, 'putMeterDetailsForJobDetails', err)
        );
    }else{
      updateStatusOfConsumerAccountNumber(box.reqBody.consumer_account_number);
      updateNumberOfConsumersReadingTaken(box.reqBody.job_id);
      /*updateNumberOfRemainingConsumersReadingTaken(box.reqBody.job_id);*/
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

function updateStatusOfConsumerAccountNumber(consumer_account_number){
   var inserting_data = {
    "job_assigined"                 : "yes",
    "meter_reading_taken"           : "yes"
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

function updateRouteNumberConsumerAccountNumber(consumer_account_number,route_no){
   var inserting_data = {
    "route_no"                 : route_no
  }
  console.info("consumer_account_number => "+consumer_account_number);
  console.info("Updating The consumer account Route Number");
  console.info(inserting_data);
  var sql = 'UPDATE consumer_accounts SET ? WHERE consumer_account_number = "'+consumer_account_number+'"';
  console.info(sql);
  con.query(sql,inserting_data,function (err, result) {
    if (err){
      return false;
    }else{
      return true;
    }
  });
}

function updateConnectionTypeConsumerAccountNumber(consumer_account_number,new_connection_type){
   var inserting_data = {
    "new_connection_type"                 : new_connection_type
  }
  console.info("consumer_account_number => "+consumer_account_number);
  console.info("Updating The consumer account Connection Type");
  console.info(inserting_data);
  var sql = 'UPDATE consumer_accounts SET ? WHERE consumer_account_number = "'+consumer_account_number+'"';
  console.info(sql);
  con.query(sql,inserting_data,function (err, result) {
    if (err){
      return false;
    }else{
      return true;
    }
  });
}


function updateNumberOfConsumersReadingTaken(job_id){
  console.info("job_id => "+job_id);
  var sql = 'UPDATE job SET number_of_consumers_reading_taken = number_of_consumers_reading_taken + 1 WHERE id = "'+job_id+'"';
  console.info(sql);
  con.query(sql,function (err, result) {
    if (err){
      return false;
    }else{
      updateNumberOfRemainingConsumersReadingTaken(job_id);
      return true;
    }
  });
}

function updateNumberOfRemainingConsumersReadingTaken(job_id){
  console.info("job_id => "+job_id);
  var sql = 'UPDATE job SET number_of_remaining_consumers_reading_taken = total_number_of_comsumers - number_of_consumers_reading_taken WHERE id = "'+job_id+'"';
  console.info(sql);
  con.query(sql,function (err, result) {
    if (err){
      return false;
    }else{
      return true;
    }
  });
}


function updateUserContactDetails(box) {
  var whoAmI = updateUserContactDetails.name;
  var today = new Date();
  var inserting_data = {
    "mobile_number"   : box.reqBody.mobile_number,
    "email_id"        : box.reqBody.email_id,
    "updated_by"      : box.reqBody.created_by,
    "updated_on"      : today
  }
  var sql_validate = "select user_id from consumer_accounts where consumer_account_number = '"+box.reqBody.consumer_account_number+"'";
  console.info(sql_validate);
  con.query(sql_validate,function (err_validate, result_validate) {
    console.info("result_validate");
    console.info(result_validate);
    if (err_validate){
      return false;
    }else if(result_validate[0].user_id != ""){
      var sql = 'UPDATE users SET ? WHERE user_id = '+ result_validate[0].user_id;
      con.query(sql,inserting_data,function (err, result) {
        if (err){
          console.info(err);
          console.info("Error In => "+whoAmI);
          return false;
        }else{
          console.info('User Contact Details Updated successfully');
          return true;
        }
      });
    }else{
      console.info("User Doesn't Exists !");
      return false;
    }
  });
}
function sendSMSToConsumer(consumer_account_number){
  var sql="SELECT U.mobile_number FROM consumer_accounts as CA LEFT JOIN users U ON CA.user_id = U.user_id WHERE CA.consumer_account_number="+consumer_account_number;
  con.query(sql,function (err, result) {
    if (err){
      return false;
    }else{
      var mobile_number=result[0].mobile_number;
        sendSms(mobile_number,'MJP water meter reader visited your premise for recording water consumption for consumer no '+consumer_account_number+' but Meter Reading could not be taken because House was Locked');
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
      var reading_taken_on1 = moment(reading_taken_on).format("DD-MM-YYYY");
        sendSms(mobile_number,'MJP Water Meter reading taken for Consumer Account # '+consumer_account_number+' on '+reading_taken_on1+' for Consumption Month '+billingMonth+' is '+meter_reading+'Pl check reading. In case of complaint contact xxxxxxx.');
    }
  });
}
