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
  async.series([
    checkInputParams.bind(null, box),
    postSubDivion.bind(null, box)
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
  if (!box.reqBody.sub_division_name)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :sub_division_name')
      );
  if (!box.reqBody.sub_division_description)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :sub_division_description')
      );
  return nextFunc();
}

function postSubDivion(box, nextFunc) {
  var whoAmI = postSubDivion.name;
  var status = "active";
  var today = new Date();
  var inserting_data = {
    "sub_division_name"         : box.reqBody.sub_division_name ,
    "sub_division_description"  : box.reqBody.sub_division_description ,
    "status"                    : status,
    "created_by"                : box.reqBody.created_by,
    "created_on"                : today
  }
  var sql_validate = "select * from sub_division where sub_division_name = '"+box.reqBody.sub_division_name+"'";
  con.query(sql_validate,
    function (err_validate, result_validate) {
      if(result_validate.length == 1){
        box.res.status(401).json({
              status: 'Unauthorized',
              message:"Sub Division Already Exists !"
            });
      }else{
        var sql = 'INSERT INTO sub_division SET ? ';
        con.query(sql,inserting_data,function (err, location) {
          if (err){
            console.info(err);          
            console.info("Error In => "+whoAmI);
            return nextFunc(
              new ActErr(whoAmI, ActErr.DBOperationFailed, 'postSubDivion', err)
              );
          }else{
            box.resBody.success = true;
            box.resBody.message = 'Sub Division created successfully';
            activity(box.reqBody.created_by,'created',"Sub Division created successfully "+box.reqBody.name)
          }
          return nextFunc();
        });
      }
  });
}