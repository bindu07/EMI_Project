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
  async.series([
    putUtilities.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}
function putUtilities(box, nextFunc) {
  var whoAmI = box.whoAmI + '_' + putUtilities.name;
  var today = new Date();
  var inserting_data = {
    "name"                      : box.reqBody.name ,
    "status"                    : box.reqBody.status ,
    "updated_by"                : box.reqBody.created_by,
    "updated_on"                : today
  }
  var sql_validate = "select * from utilities where name = '"+box.reqBody.name+"' AND id != '"+box.reqParams.utility_id+"'";
  con.query(sql_validate,
    function (err_validate, result_validate) {
      if(result_validate.length >= 1){
        box.res.status(401).json({
              status: 'Unauthorized',
              message:" Utility "+box.reqBody.name+" Already Exists !"
            });
      }else{
        var sql = 'UPDATE utilities SET ? WHERE id = '+ box.reqParams.utility_id;
        con.query(sql,inserting_data,function (err, location) {
          if (err){
            console.info(err);          
            console.info("Error In => "+whoAmI);
            return nextFunc(
              new ActErr(whoAmI, ActErr.DBOperationFailed, 'putUtilities', err)
              );
          }else{
            box.resBody.success = true;
            box.resBody.message = 'Utility Details Updated successfully';
          }
          return nextFunc();
        });
      }
    });
}