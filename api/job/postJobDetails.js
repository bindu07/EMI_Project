'use strict';
var async = require('async');
var sha1 = require('sha1');
require('../../helpers/sendSms.js');
var moment = require('moment');
require('../../helpers/randomString.js');

module.exports = post;

function post(req, res) {
  var box = {
    req: req,
    res: res,
    reqBody: req.body,
    resBody: {}
  };
  var whoAmI = post.name;
  async.series([
    checkInputParams.bind(null, box),
    postJobDetails.bind(null, box)
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

  if (!box.reqBody.job_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :job_id')
      );
  if (!box.reqBody.user_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :user_id')
      );
  if (!box.reqBody.consumer_account_number)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :consumer_account_number')
      );
	if (!box.reqBody.created_by)
	  return nextFunc(
	    new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :created_by')
	    );
  return nextFunc();
}

function postJobDetails(box, nextFunc) {
  var whoAmI = postJobDetails.name;
  var today = new Date();
  var status = 'active';
  console.info(box.reqBody.consumer_account_number);
  /*for( var i =0;i<= box.reqBody.consumer_account_number.length;i++)
  {

  }*/
  var inserting_data = {
    "job_id"                       : box.reqBody.job_id ,
    "user_id"       		           : box.reqBody.user_id ,
    "consumer_account_number"      : box.reqBody.consumer_account_number,
    "meter_reading_status"         : "Job Created",
    "status"                       : status,
    "created_by"      		         : box.reqBody.created_by,
    "created_on"      		         : today
  }
        var sql = 'INSERT INTO job_details SET ? ';
        console.info(sql);
        con.query(sql,inserting_data,function (err, result) {
          if (err){
            console.info(err);
            console.info("Error In => "+whoAmI);
            return nextFunc(
              new ActErr(whoAmI, ActErr.DBOperationFailed, 'postJobDetails', err)
              );
          }else{
           updateStatusOfJob(box.reqBody.job_id);
           updateTotalNumberConumserOfJob(box.reqBody.job_id);
           updateStatusOfConsumerAccountNumber(box.reqBody.consumer_account_number);
           sendSMSToConsumer(box.reqBody.consumer_account_number,box.reqBody.mdate);
            box.resBody.success = true;
            box.resBody.message = 'Job line item created successfully';
            box.resBody.id      = result.insertId;
            activity(box.reqBody.created_by,'created',"description")
          }
          return nextFunc();
        });

}

function updateStatusOfConsumerAccountNumber(consumer_account_number){
   var inserting_data = {
    "job_assigined"                 : "yes",
    "meter_reading_taken"           : "no"
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

function updateStatusOfJob(job_id){
   var inserting_data = {
    "job_status"                 : "assigned"
  }
  console.info("job_id => "+job_id);
  console.info("Updating The job_status:  assigned");
  console.info(inserting_data);
  var sql = 'UPDATE job SET ? WHERE id = "'+job_id+'"';
  console.info(sql);
  con.query(sql,inserting_data,function (err, result) {
    if (err){
      return false;
    }else{
      return true;
    }
  });
}

function updateTotalNumberConumserOfJob(job_id){
  var inserting_data = {
    "job_status"                 : "assigned"
  }
  console.info("job_id => "+job_id);
  var sql = 'UPDATE job SET total_number_of_comsumers = total_number_of_comsumers + 1 WHERE id = "'+job_id+'"';
  console.info(sql);
  con.query(sql,function (err, result) {
    if (err){
      return false;
    }else{
      return true;
    }
  });
}
function sendSMSToConsumer(consumer_account_number,mdate){
  var sql="SELECT U.mobile_number FROM consumer_accounts as CA LEFT JOIN users U ON CA.user_id = U.user_id WHERE CA.consumer_account_number="+consumer_account_number;
  con.query(sql,function (err, result) {
    if (err){
      return false;
    }else{
      console.info(result);
      var mobile_number=result[0].mobile_number;
      var startDate = moment(mdate).format("DD-MM-YYYY");
        sendSms(mobile_number,'MJP water meter reader will be visiting your premise on '+startDate+' Please be available at your premise and avoid abnormal reading.');
    }
  });
}
