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
  var whoAmI = post.name;
  async.series([
    checkInputParams.bind(null, box),
    postJob.bind(null, box)
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

  if (!box.reqBody.service_provider_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :service_provider_id')
      );
  if (!box.reqBody.agency_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :agency_id')
      );
  if (!box.reqBody.meter_reader_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :meter_reader_id')
      );
  if (!box.reqBody.sub_division_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :sub_division_id')
      );
  if (!box.reqBody.processing_cycle_id)
      return nextFunc(
        new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :processing_cycle_id')
        );
	if (!box.reqBody.billing_month)
	  return nextFunc(
	    new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :billing_month')
	    );
  if (!box.reqBody.consumption_months)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :consumption_months')
      );
	if (!box.reqBody.year)
	  return nextFunc(
	    new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :year')
	    );
  if (!box.reqBody.job_status)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :job_status')
      );
	if (!box.reqBody.job_name)
	  return nextFunc(
	    new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :job_name')
	    );
  return nextFunc();
}

function postJob(box, nextFunc) {
  var whoAmI = postJob.name;
  var today = new Date();
  var status = 'active';
  var inserting_data = {
    "service_provider_id"   : box.reqBody.service_provider_id ,
    "agency_id"       		  : box.reqBody.agency_id ,
    "meter_reader_id"       : box.reqBody.meter_reader_id ,
    "sub_division_id"   	  : box.reqBody.sub_division_id ,
    "processing_cycle_id"   : box.reqBody.processing_cycle_id ,
    "meter_reading_month"   : box.reqBody.billing_month ,
    "consumption_months"    : box.reqBody.consumption_months ,
    "year"  				        : box.reqBody.year ,
    "job_status"            : box.reqBody.job_status ,
    "job_name"              : box.reqBody.job_name ,
    "status"        		    : status ,
    "created_by"      		  : box.reqBody.created_by,
    "created_on"      		  : box.reqBody.created_on
  }
        var sql = 'INSERT INTO job SET ? ';
        con.query(sql,inserting_data,function (err, result) {
          if (err){
            console.info(err);
            console.info("Error In => "+whoAmI);
            return nextFunc(
              new ActErr(whoAmI, ActErr.DBOperationFailed, 'postJob', err)
              );
          }else{
            box.resBody.success = true;
            box.resBody.message = 'Job created successfully';
            box.resBody.job_id      = result.insertId;
            activity(box.reqBody.created_by,'created',"description")
          }
          return nextFunc();
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
