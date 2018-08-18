'use strict';
var async = require('async');
var sha1 = require('sha1');


module.exports = post;

function post(req, res) {
  var whoAmI = post.name;
  var box = {
    req: req,
    res: res,
    reqBody: req.body,
    resBody: {}
  };
  async.series([
    // checkInputParams.bind(null, box),
    postBillDetails.bind(null, box)
    ],
    function (err) {
      console.info(box.whoAmI, 'Completed');
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function postBillDetails(box, nextFunc) {
  var whoAmI = postBillDetails.name;
  var today = new Date();
  var inserting_data = {
    "account_number"            : box.reqBody.account_number ,
    "agency_id"                 : box.reqBody.agency_id ,
    "user_id"                   : box.reqBody.user_id ,
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
  var sql = 'INSERT INTO bill_details SET ? ';
  con.query(sql,inserting_data,function (err, result) {
    if (err){
      console.info("Error In => "+whoAmI);
      console.info(err);
      return nextFunc(
        new ActErr(whoAmI, ActErr.DBOperationFailed, 'postBillDetails', err)
        );
    }else{
      // console.info("INSERT");
      box.resBody.success = true;
      box.resBody.message = 'Bill Created successfully';
      box.resBody.id = result.insertId;
      activity(box.reqBody.user_id,'Bill created',"description")
    }
    return nextFunc();
  });
}