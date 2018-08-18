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
    deletebillgeneratedjob.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}
function deletebillgeneratedjob(box, nextFunc) {
  var whoAmI = deletebillgeneratedjob.name;
  var status = "active";
  var today = new Date();
        var sql ="DELETE FROM bill_generating_job";
        con.query(sql,function (err, location) {
          if (err){
            console.info(err);          
            console.info("Error In => "+whoAmI);
            return nextFunc(
              new ActErr(whoAmI, ActErr.DBOperationFailed, 'deletebillgeneratedjob', err)
              );
          }else{
            box.resBody.success = true;
            box.resBody.message = 'jobdeleted successfully';
            activity(box.reqBody.created_by,'delete',"jobdeleted successfully "+box.reqBody.name)
          }
          return nextFunc();
    });
}
