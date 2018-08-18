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
    validatemeterreading.bind(null, box)
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
  if (!box.reqBody.new_metere_reading_error_code)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :new_metere_reading_error_code')
      );
  if (!box.reqBody.id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :id')
      );
  if (!box.reqBody.consumer_account_number)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :consumer_account_number')
      );

  if (!box.reqBody.job_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :job_id')
      );
 
  return nextFunc();
}


function validatemeterreading(box, nextFunc) {
  var whoAmI = validatemeterreading.name;
  var today = new Date();
  var inserting_data = {
    "error_code"                      : box.reqBody.new_metere_reading_error_code ,
    "url"                             : box.reqBody.consumer_upload_picture,
    "meter_reading"                   : box.reqBody.consumer_meter_reading,
    "updated_by"                      : box.reqBody.created_by,
    "meter_reading_status"            : box.reqBody.meter_reading_status,
    "updated_on"                      : today
  }
  var sql = 'UPDATE job_details SET ? WHERE id = "'+ box.reqBody.id+'" AND job_id = "'+box.reqBody.job_id+'" AND consumer_account_number = "'+box.reqBody.consumer_account_number+'"';
  console.info(sql);
  con.query(sql,inserting_data,function (err, result) {
    if (err){
      console.info(err);
      console.info("Error In => "+whoAmI);
      return nextFunc(
        new ActErr(whoAmI, ActErr.DBOperationFailed, 'putMeterDetailsForJobDetails', err)
        );
    }else{
      box.resBody.success = true;
      box.resBody.message = 'Consumer Meter Reading Taken successfully';
    }
    return nextFunc();
  });
}


