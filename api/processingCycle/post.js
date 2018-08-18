'use strict';
var async = require('async');

module.exports = post;

function post(req, res) {
  var box = {
    req: req,
    res: res,
    reqBody: req.body,
    resBody: {}
  };
  async.series([
    postProcessingCycle.bind(null, box)
    ],
    function (err) {
      console.info(box.whoAmI, 'Completed');
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function postProcessingCycle(box, nextFunc) {
  var whoAmI = postProcessingCycle.name;
  var status = "active";
  var today = new Date();
  var inserting_data = {
    "service_provider_id"       : 1,
    "agency_id"                 : box.reqBody.agency_id ,
    "sub_division_id"           : box.reqBody.sub_division_id ,
    "description"               : box.reqBody.description ,
    "interval"                  : box.reqBody.interval ,
    "status"                    : status,
    "created_by"                : box.reqBody.created_by,
    "created_on"                : today
  }
  var sql = 'INSERT INTO processing_cycle SET ? ';
  con.query(sql,inserting_data,function (err, result) {
    if (err){
      console.info(err);          
      console.info("Error In => "+whoAmI);
      return nextFunc(
        new ActErr(whoAmI, ActErr.DBOperationFailed, 'postProcessingCycle', err)
        );
    }else{
      box.resBody.success = true;
      box.resBody.message = 'Processing Cycle Created Successfully';
      activity(box.reqBody.created_by,'created',"Processing Cycle Created Successfully ")
    }
    return nextFunc();
    });
}