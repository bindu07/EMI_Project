'use strict';
var async = require('async');

module.exports = post;

function post(req, res , next) {
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
    checkInputParams.bind(null, box)
    ],
    function (err) {
      console.info(box.whoAmI, 'Completed');
      if (err)
        return respondWithError(res, err);
      box.resBody.message = "Batch Process Initiated";
      sendJSONResponse(res, box.resBody)
              async.series([
          validatingAndUpdatingMeterReading.bind(null, box),
          validatingAndUpdatingMeterReadingForPipepeice.bind(null,box),
          getAllRecordsForMeterReadingHistory.bind(null, box)
          ]);
    });
}


function checkInputParams(box, nextFunc) {
  var whoAmI = box.whoAmI + '_' + checkInputParams.name;
  console.debug('Executing ->', whoAmI );
  
  if (!box.reqBody.created_by)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :created_by')
      );
  return nextFunc();
}

function validatingAndUpdatingMeterReading(box, nextFunc) 
{
  var whoAmI = validatingAndUpdatingMeterReading.name;
  var errorCodeCondition = " AND error_code IN ('2','6','10','3')" ;
  var getAllJobDetails = "select jd.consumption,jd.error_code,jd.id as job_detail_id,ca.previous_reading,ca.consumer_account_number,ca.pipe_diameter,ca.connection_type,ca.average_consumption from job_details as jd LEFT JOIN consumer_accounts as ca ON jd.consumer_account_number = ca.consumer_account_number where job_id = '"+box.reqParams.job_id+"' "+errorCodeCondition;
  console.info(getAllJobDetails);
  con.query(getAllJobDetails,function (err_validate, result_validate) {
    console.info("result");
    console.info(result_validate);
    console.info("err_validate");
    console.info(err_validate);
    console.info("result");
    console.info(result_validate.length);
      if(result_validate.length <= 0){
        box.resBody.messageForNormal = "No Reords Found !";
      }else{
        for(var i =0; i<result_validate.length;i++)
        {
          console.info('i => '+i);
          console.info('consumer_account_number');
          console.info(result_validate[i]['consumer_account_number']);
          updateMeterReading(result_validate[i]['pipe_diameter'],result_validate[i]['connection_type'],box.reqParams.job_id,result_validate[i]['consumer_account_number'],box.reqBody.created_by,result_validate[i]['job_detail_id'],result_validate[i]['previous_reading'],result_validate[i]['average_consumption'],result_validate[i]['error_code'],result_validate[i]['consumption'])
        }
        box.resBody.total_number_of_records_for_normal = i;
      }
      return nextFunc();
  });
}

function validatingAndUpdatingMeterReadingForPipepeice(box, nextFunc) 
{
  var whoAmI = validatingAndUpdatingMeterReading.name;
  var errorCodeCondition = " AND error_code IN ('5','8')" ;
  var getAllJobDetails = "select jd.error_code,jd.id as job_detail_id,ca.previous_reading,ca.consumer_account_number,ca.pipe_diameter,ca.connection_type,ca.average_consumption from job_details as jd LEFT JOIN consumer_accounts as ca ON jd.consumer_account_number = ca.consumer_account_number where job_id = '"+box.reqParams.job_id+"' "+errorCodeCondition;
  console.info(getAllJobDetails);
  con.query(getAllJobDetails,function (err_validate, result_validate) {
    console.info("result");
    console.info(result_validate);
    console.info("err_validate");
    console.info(err_validate);
    console.info("result");
    console.info(result_validate.length);
      if(result_validate.length <= 0){
        box.resBody.messageForPipePeice = "No Reords Found !";
      }else{
        for(var i =0; i< result_validate.length;i++)
        {
          console.info('consumer_account_number');
          console.info(result_validate[i]['consumer_account_number']);
          updateMeterReadingForPipePeice(result_validate[i]['pipe_diameter'],result_validate[i]['connection_type'],box.reqParams.job_id,result_validate[i]['consumer_account_number'],box.reqBody.created_by,result_validate[i]['job_detail_id'],result_validate[i]['previous_reading'],result_validate[i]['average_consumption'],result_validate[i]['error_code'])
        }
        box.resBody.total_number_of_records_for_pipe_peice = i;
      }
      return nextFunc();
  });
}


function updateMeterReading(pipe_diameter,connection_type,job_id,consumer_account_number,created_by,job_detail_id,previous_reading,average_consumption,error_code,consumption)
{
  var whoAmI=updateMeterReading.name;
  var today = new Date();
  var sqlToGetData = 'select minimum_consumption_value from minimum_consumption WHERE pipe_diameter_id = '+pipe_diameter+' AND connection_type_id = '+connection_type+'';
  console.info("sqlToGetData");
  console.info(sqlToGetData);
  con.query(sqlToGetData,function (err, result) {
    console.info("Minimum Consumption Data");
    console.info(result);
    if (result.length <= 0){
      console.info(err);          
      console.info("Error In => "+whoAmI);

    }else{
      var minimum_consumption_value =   0;
      var meter_reading_value       =   0;
      if(parseInt(average_consumption) > parseInt(result[0]['minimum_consumption_value']) && error_code == '3'){
        meter_reading_value         =   parseInt(average_consumption) + parseInt(previous_reading);
        minimum_consumption_value   =   parseInt(average_consumption);
      }
      else
      {
        meter_reading_value        =   parseInt(result[0]['minimum_consumption_value']) + parseInt(previous_reading);
        minimum_consumption_value  =   parseInt(result[0]['minimum_consumption_value']);
      }
      /* Modified to Update Current Meter Reading as Previous Meter Reading*/
      if(parseFloat(consumption) < 0 && error_code != '3')
      {
        meter_reading_value         =   previous_reading;
      }
      /* Modified to Update Current Meter Reading as Previous Meter Reading*/
      var inserting_data = {
        "meter_reading"             : meter_reading_value,
        "previous_reading"          : previous_reading,
        "consumption"               : parseInt(minimum_consumption_value),
        "updated_by"                : created_by,
        "updated_on"                : today
      }
      var sql = "UPDATE job_details SET ? WHERE job_id = '"+job_id+"' AND consumer_account_number = '"+consumer_account_number+"'";
      console.info(sql);
      con.query(sql,inserting_data,function (errUpdate,resultUpdate ) {
        if(errUpdate){
          return false;        
        }else {
          var activity_type = 'meter';
          validatingAndBillLogs(created_by,job_id,job_detail_id,consumer_account_number,activity_type);
          return true;
        }

      });
    }
  });
}


function updateMeterReadingForPipePeice(pipe_diameter,connection_type,job_id,consumer_account_number,created_by,job_detail_id,previous_reading,average_consumption,error_code)
{
  var whoAmI=updateMeterReadingForPipePeice.name;
  var today = new Date();
  var sqlToGetData = 'select minimum_consumption_value_for_pipe_peice from minimum_consumption WHERE pipe_diameter_id = '+pipe_diameter+' AND connection_type_id = '+connection_type+'';
  console.info("sqlToGetData");
  console.info(sqlToGetData);
  con.query(sqlToGetData,function (err, result) {
    console.info("Minimum Consumption Data");
    console.info(result);
    if (result.length <= 0){
      console.info(err);          
      console.info("Error In => "+whoAmI);
    }else{
      var minimum_consumption_value_for_pipe_peice = 0;
      var meter_reading_value_for_pipe_peice = 0;
      if(parseInt(average_consumption) > parseInt(result[0]['minimum_consumption_value_for_pipe_peice'])){
        meter_reading_value_for_pipe_peice        =   parseInt(average_consumption) + parseInt(previous_reading);
        minimum_consumption_value_for_pipe_peice  =   parseInt(average_consumption);
      }
      else
      {
        meter_reading_value_for_pipe_peice        =   parseInt(result[0]['minimum_consumption_value_for_pipe_peice']) + parseInt(previous_reading);
        minimum_consumption_value_for_pipe_peice  =   parseInt(result[0]['minimum_consumption_value_for_pipe_peice']);
      }
      var inserting_data = {
        "meter_reading"             : meter_reading_value_for_pipe_peice,
        "previous_reading"          : previous_reading,
        "consumption"               : parseInt(result[0]['minimum_consumption_value_for_pipe_peice']),
        "updated_by"                : created_by,
        "updated_on"                : today
      }
      var sql = "UPDATE job_details SET ? WHERE job_id = '"+job_id+"' AND consumer_account_number = '"+consumer_account_number+"'";
      console.info(sql);
      con.query(sql,inserting_data,function (errUpdate,resultUpdate ) {
        if(errUpdate){
          return false;        
        }else {
          var activity_type = 'meter';
          validatingAndBillLogs(created_by,job_id,job_detail_id,consumer_account_number,activity_type);
          return true;
        }

      });
    }
  });
}

function getAllRecordsForMeterReadingHistory(box, nextFunc)
{
  var whoAmI = getAllRecordsForMeterReadingHistory.name;
  var getAllJobDetails = "select j.meter_reading_month,j.consumption_months,jd.id as job_detail_id,jd.error_code,ca.consumer_account_number,ca.meter_number,jd.meter_reading,jd.previous_reading,jd.consumption,jd.reading_taken_on from job_details as jd LEFT JOIN job as j ON j.id = jd.job_id LEFT JOIN consumer_accounts as ca ON jd.consumer_account_number = ca.consumer_account_number where job_id = '"+box.reqParams.job_id+"' ";
  console.info(getAllJobDetails);
  con.query(getAllJobDetails,function (err_validate, result_validate) {
    console.info("result");
    console.info(result_validate);
    console.info("err_validate");
    console.info(err_validate);
    console.info("result");
    console.info(result_validate.length);
      if(result_validate.length <= 0){
        box.resBody.messageForPipePeice = "No Reords Found !";
      }else{
        for(var i =0; i< result_validate.length;i++)
        {
          console.info('meter_reading_month');
          console.info(result_validate[i]['meter_reading_month']);
          MeterReadingHistory(result_validate[i]['consumer_account_number'],result_validate[i]['error_code'],result_validate[i]['meter_number'],result_validate[i]['meter_reading'],result_validate[i]['reading_taken_on'],result_validate[i]['meter_reading_month'],box.reqBody.created_by,box.reqParams.job_id,result_validate[i]['job_detail_id'],result_validate[i]['previous_reading'],result_validate[i]['consumption'],box.reqParams.agency_id)
          consumptionhistory(result_validate[i]['consumer_account_number'],result_validate[i]['consumption_months'],result_validate[i]['meter_number'],result_validate[i]['meter_reading'],result_validate[i]['reading_taken_on'],result_validate[i]['meter_reading_month'],box.reqBody.created_by,box.reqParams.job_id,result_validate[i]['job_detail_id'],result_validate[i]['previous_reading'],result_validate[i]['consumption'],box.reqParams.agency_id)
        }
      }
      return nextFunc();
  });
}

function MeterReadingHistory(consumer_account_number,error_code,meter_number,meter_reading,reading_taken_on,meter_reading_month,created_by,job_id,job_detail_id,previous_reading,consumption,agency_id)
{
  var whoAmI=MeterReadingHistory.name;
  var today = new Date();
  var inserting_data = {
    "consumer_account_number"   : consumer_account_number,
    "error_code"                : error_code,
    "service_provider_id"       : agency_id,
    "meter_number"              : meter_number,
    "meter_reading"             : meter_reading,
    "previous_reading"          : previous_reading,
    "consumption"               : consumption,
    "reading_taken_on"          : reading_taken_on,
    "meter_reading_month"       : meter_reading_month,
    "created_by"                : created_by,
    "created_on"                : today
  }
  var sql = "INSERT meter_reading_history SET ? ";
  console.info(inserting_data);
  console.info(sql);
  con.query(sql,inserting_data,function (errUpdate,resultUpdate ) {
    console.info("Result Of Meter Reading History");
    console.info(resultUpdate);
    console.info("Error Of Meter Reading History");
    console.info(errUpdate);
    if(errUpdate){
      return false;        
    }else {
      var activity_type = 'Meter Reading History';
      validatingAndBillLogs(created_by,job_id,job_detail_id,consumer_account_number,activity_type);
      return true;
    }

  });    
}

function consumptionhistory(consumer_account_number,consumption_months,meter_number,meter_reading,reading_taken_on,meter_reading_month,created_by,job_id,job_detail_id,previous_reading,consumption,agency_id)
{
  var whoAmI=consumptionhistory.name;
  var today = new Date();
  var inserting_data = {
    "consumer_account_number"   : consumer_account_number,
    "meter_reading"             : meter_reading,
    "previous_reading"          : previous_reading,
    "consumption"               : consumption,
    "consumption_month"         : consumption_months,
    "created_by"                : created_by,
    "created_on"                : today
  }
  var sql = "INSERT consumption_history SET ? ";
  console.info(inserting_data);
  console.info(sql);
  con.query(sql,inserting_data,function (errUpdate,resultUpdate ) {
    console.info("Result Of consumption_history");
    console.info(resultUpdate);
    console.info("Error Of consumption_history");
    console.info(errUpdate);
    if(errUpdate){
      return false;        
    }else {
      var activity_type = 'Meter consumption_history';
      validatingAndBillLogs(created_by,job_id,job_detail_id,consumer_account_number,activity_type);
      return true;
    }

  });    
}

