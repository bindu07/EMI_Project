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
    // checkInputParams.bind(null, box),
    putAccountDetails.bind(null, box)
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
  if (!box.reqBody.service_category)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :service_category')
      );
  if (!box.reqBody.connection_type)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :connection_type')
      );
  if (!box.reqBody.sanctioned_load)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :sanctioned_load')
      );
  if (!box.reqBody.district)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :district')
      );
  if (!box.reqBody.zone_1)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :zone_1')
      );
  if (!box.reqBody.zone_2)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :zone_2')
      );
  if (!box.reqBody.installation_date)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :installation_date')
      );
  if (!box.reqBody.tariff_category)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :tariff_category')
      );
  if (!box.reqBody.deposite_amount)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :deposite_amount')
      );
  if (!box.reqBody.currency)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :currency')
      );
  return nextFunc();
}

function putAccountDetails(box, nextFunc) {
  var today = new Date();
  var inserting_data = {
    "service_provider_id"       : box.reqBody.service_provider_id ,
    "service_category"          : box.reqBody.service_category ,
    "connection_type"           : box.reqBody.connection_type ,
    "sanctioned_load"           : box.reqBody.sanctioned_load ,
    "district"                  : box.reqBody.district ,
    "zone_1"                    : box.reqBody.zone_1 ,
    "zone_2"                    : box.reqBody.zone_2 ,
    "installation_date"         : box.reqBody.installation_date ,
    "tariff_category"           : box.reqBody.tariff_category ,
    "deposite_amount"           : box.reqBody.deposite_amount ,
    "currency"                  : box.reqBody.currency,
    "updated_by"                : box.reqBody.created_by,
    "updated_on"                : today
  }
  var sql = 'UPDATE consumer_accounts SET ? WHERE user_id = '+ box.reqParams.user_id+' AND consumer_account_number = "'+box.reqParams.consumer_account_number+'"';
  con.query(sql,inserting_data,function (err, location) {
    if (err){
      console.info(err);          
      console.info("Error In => "+whoAmI);
      return nextFunc(
        new ActErr(whoAmI, ActErr.DBOperationFailed, 'putAccountDetails', err)
        );
    }else{
      box.resBody.success = true;
      box.resBody.message = 'Account Details Updated successfully';
    }
    return nextFunc();
  });
}