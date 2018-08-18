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
    postSubDivionMappingAgency.bind(null, box)
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
  if (!box.reqBody.utility_board_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :utility_board_id')
      );
  if (!box.reqBody.agency_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :agency_id')
      );
  if (!box.reqBody.sub_division_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :sub_division_id')
      );
  if (!box.reqBody.start_date)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :start_date')
      );
  if (!box.reqBody.end_date)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :end_date')
      );
  return nextFunc();
}

function postSubDivionMappingAgency(box, nextFunc) {
  var whoAmI = postSubDivionMappingAgency.name;
  var status = "active";
  var today = new Date();
  var inserting_data = {
    "utility_board_id"          : box.reqBody.utility_board_id ,
    "agency_id"                 : box.reqBody.agency_id ,
    "sub_division_id"           : box.reqBody.sub_division_id ,
    "start_date"                : box.reqBody.start_date ,
    "end_date"                  : box.reqBody.end_date ,
    "status"                    : status,
    "created_by"                : box.reqBody.created_by,
    "created_on"                : today
  }
  var sql_validate = "select * from bu_mapping_agency where sub_division_id = '"+box.reqBody.sub_division_name+"' AND start_date ='"+box.reqBody.start_date +"' AND end_date = '"+box.reqBody.end_date+"' ";
  con.query(sql_validate,
    function (err_validate, result_validate) {
      if(result_validate.length == 1){
        box.res.status(401).json({
              status: 'Unauthorized',
              message:"Sub Division Already Mapped With Agency !"
            });
      }else{
        var sql = 'INSERT INTO bu_mapping_agency SET ? ';
        con.query(sql,inserting_data,function (err, result) {
          if (err){
            console.info(err);          
            console.info("Error In => "+whoAmI);
            return nextFunc(
              new ActErr(whoAmI, ActErr.DBOperationFailed, 'postSubDivionMappingAgency', err)
              );
          }else{
            box.resBody.success = true;
            box.resBody.message = 'Sub Division Mapping Agency created successfully';
            box.resBody.id      = result.insertId;
            activity(box.reqBody.created_by,'created',"Sub Division Mapping Agency created successfully ")
          }
          return nextFunc();
        });
      }
  });
}