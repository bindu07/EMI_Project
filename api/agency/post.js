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
    postAgency.bind(null, box)
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

  if (!box.reqBody.utility_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :utility_id')
      );
  if (!box.reqBody.utility_board_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :utility_board_id')
      );
  if (!box.reqBody.name)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :name')
      );
  if (!box.reqBody.state_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :state_id')
      );
  if (!box.reqBody.country_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :country_id')
      );  
  return nextFunc();
}

function postAgency(box, nextFunc) {
  var whoAmI = postAgency.name;
  var status = "active";
  var today = new Date();
  var start_date = box.reqBody.start_date.split("-").reverse().join("-");
  var end_date = box.reqBody.end_date.split("-").reverse().join("-");
  var inserting_data = {
    "utility_id"                : box.reqBody.utility_id ,
    "utility_board_id"          : box.reqBody.utility_board_id ,
    "name"                      : box.reqBody.name ,
    "address_line_1"            : box.reqBody.address_line_1 ,
    "address_line_2"            : box.reqBody.address_line_2 ,
    "locality"                  : box.reqBody.locality ,
    "pin_code"                  : box.reqBody.pin_code ,
    "state_id"                  : box.reqBody.state_id ,
    "country_id"                : box.reqBody.country_id ,
    "start_date"                : start_date,
    "end_date"                  : end_date,
    "status"                    : status,
    "created_by"                : box.reqBody.created_by,
    "created_on"                : today
  }
  var sql_validate = "select * from agencies where name = '"+box.reqBody.name+"'";
  con.query(sql_validate,
    function (err_validate, result_validate) {
      if(result_validate.length == 1){
        box.res.status(401).json({
              status: 'Unauthorized',
              message:"Agency Already Exists !"
            });
      }else{
        var sql = 'INSERT INTO agencies SET ? ';
        con.query(sql,inserting_data,function (err, location) {
          if (err){
            console.info(err);          
            console.info("Error In => "+whoAmI);
            return nextFunc(
              new ActErr(whoAmI, ActErr.DBOperationFailed, 'postAgency', err)
              );
          }else{
            box.resBody.success = true;
            box.resBody.message = 'Agency created successfully';
            activity(box.reqBody.created_by,'created',"Agency created successfully "+box.reqBody.name)
          }
          return nextFunc();
        });
      }
  });
}