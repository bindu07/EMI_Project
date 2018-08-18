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
  console.info(box.reqBody)
  console.info(box.whoAmI, 'Starting');

  async.series([
    putSubDivision.bind(null, box)
    ],
    function (err) {
      console.info(box.whoAmI, 'Completed');
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}
function putSubDivision(box, nextFunc) {
  var today = new Date();
  var inserting_data = {
    "sub_division_name"         : box.reqBody.sub_division_name ,
    "sub_division_description"  : box.reqBody.sub_division_description ,
    "updated_by"                : box.reqBody.created_by,
    "updated_on"                : today
  }
  var sql_validate = "select * from sub_division where sub_division_name = '"+box.reqBody.sub_division_name+"' AND id != "+box.reqParams.sub_division_id;
  con.query(sql_validate,
    function (err_validate, result_validate) {
      if(result_validate.length == 1){
        box.res.status(401).json({
              status: 'Unauthorized',
              message:"Sub Division "+box.reqBody.sub_division_name +" Already Exists !"
            });
      }else{
        var sql = 'UPDATE sub_division SET ? WHERE id = '+ box.reqParams.sub_division_id;
        con.query(sql,inserting_data,function (err, result) {
          if (err){
            console.info(err);          
            console.info("Error In => "+whoAmI);
            return nextFunc(
              new ActErr(whoAmI, ActErr.DBOperationFailed, 'putSubDivision', err)
              );
          }else{
            box.resBody.success = true;
            box.resBody.message = 'Sub Division Details Updated successfully';
          }
          return nextFunc();
        });
      }
    });
}