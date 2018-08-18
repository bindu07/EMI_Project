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
    checkInputParams.bind(null, box),
    putProcessingCycle.bind(null, box)
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

  if (!box.reqBody.service_provider_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :service_provider_id')
      );
  if (!box.reqBody.agency_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :agency_id')
      );
  if (!box.reqBody.sub_division_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :sub_division_id')
      );
  if (!box.reqBody.description)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :description')
      );
  if (!box.reqBody.interval)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :interval')
      );
  return nextFunc();
}

function putProcessingCycle(box, nextFunc) {
  var today = new Date();
  var inserting_data = {
    "service_provider_id"       : box.reqBody.service_provider_id,
    "agency_id"                 : box.reqBody.agency_id ,
    "sub_division_id"           : box.reqBody.sub_division_id ,
    "description"               : box.reqBody.description ,
    "interval"                  : box.reqBody.interval ,
    "status"                    : box.reqBody.status,
    "updated_by"                : box.reqBody.created_by,
    "updated_on"                : today
  }
  var sql = 'UPDATE processing_cycle SET ? WHERE processing_cycle_id = '+ box.reqParams.processing_cycle_id+'';
  con.query(sql,inserting_data,function (err, location) {
    if (err){
      console.info(err);          
      console.info("Error In => "+whoAmI);
      return nextFunc(
        new ActErr(whoAmI, ActErr.DBOperationFailed, 'putProcessingCycle', err)
        );
    }else{
      box.resBody.success = true;
      box.resBody.message = 'Processing Cycle Updated successfully';
    }
    return nextFunc();
  });
}