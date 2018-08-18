'use strict';
var async = require('async');
var sha1 = require('sha1');


module.exports = put;

function put(req, res) {
  var whoAmI = put.name;
  var box = {
    req: req,
    res: res,
    reqParams: req.params,
    reqBody: req.body,
    resBody: {}
  };
  async.series([
    // checkInputParams.bind(null, box),
    putBillDetails.bind(null, box)
    ],
    function (err) {
      console.info(box.whoAmI, 'Completed');
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function putBillDetails(box, nextFunc) {
  var whoAmI = putBillDetails.name;
  var today = new Date();
  var inserting_data = {
    "meter_reading_date"        : box.reqBody.meter_reading_date ,
    "bill_date"                 : box.reqBody.bill_date ,
    "bill_period"               : box.reqBody.bill_period ,
    "total_units"               : box.reqBody.total_units ,
    "uom"                       : box.reqBody.uom ,
    "total_amount"              : box.reqBody.total_amount ,
    "currency"                  : box.reqBody.currency ,
    "prior_balance"             : box.reqBody.prior_balance ,
    "bill_corrections"          : box.reqBody.bill_corrections,
    "payment"                   : box.reqBody.payment,
    "adjustment"                : box.reqBody.adjustment,
    "new_charges"               : box.reqBody.new_charges,
    "current_balance"           : box.reqBody.current_balance,
    "tax"                       : box.reqBody.tax,
    "surcharge"                 : box.reqBody.surcharge,
    "price_per_unit"            : box.reqBody.price_per_unit,
    "payment_status"            : box.reqBody.payment_status,
    "payment_date"              : box.reqBody.payment_date,
    "payment_mode"              : box.reqBody.payment_mode,
    "lmts"                      : today
  }
  var sql = 'UPDATE bill_details SET ? WHERE agency_id = '+box.reqParams.agency_id+' AND account_number = '+box.reqParams.account_number+' AND  bill_detail_id = '+ box.reqParams.bill_id;
  con.query(sql,inserting_data,function (err, result) {
    if (err){
      console.info("Error In => "+whoAmI);
      console.info(err);
      return nextFunc(
        new ActErr(whoAmI, ActErr.DBOperationFailed, 'putBillDetails', err)
        );
    }else{
      box.resBody.success = true;
      box.resBody.message = 'Bill Updates successfully';
      activity(box.reqParams.account_number,'Bill Updated ',"description")
    }
    return nextFunc();
  });
}