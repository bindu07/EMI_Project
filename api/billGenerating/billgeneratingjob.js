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
    reqParams: req.params,
    resBody: {}
  };
  async.series([
    inserbillgeneratedjob.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}
function inserbillgeneratedjob(box, nextFunc) {
  var whoAmI = inserbillgeneratedjob.name;
  var status = "active";
  var today = new Date();
  var inserting_data = {
    "job_id"              : box.reqBody.job_id,
    "job_status"          : box.resBody.job_status,
    "created_on"          : today
  }
        var sql = 'INSERT INTO bill_generating_job SET ? ';
        con.query(sql,inserting_data,function (err, location) {
          if (err){
            console.info(err);          
            console.info("Error In => "+whoAmI);
            return nextFunc(
              new ActErr(whoAmI, ActErr.DBOperationFailed, 'inserbillgeneratedjob', err)
              );
          }else{
            box.resBody.success = true;
            box.resBody.message = 'job created successfully';
            activity(box.reqBody.created_by,'created',"job created successfully "+box.reqBody.name)
          }
          return nextFunc();
      });
}
