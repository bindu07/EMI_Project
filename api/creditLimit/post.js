'use strict';
var async = require('async');

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
    postCreditLimit.bind(null, box)
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

  if (!box.reqBody.sub_division_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :sub_division_id')
      );
  if (!box.reqBody.agency_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :agency_id')
      );
  if (!box.reqBody.credit_limit_assigined)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :credit_limit_assigined')
      );
  if (!box.reqBody.payment_mode)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :payment_mode')
      );
  if (!box.reqBody.created_by)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :created_by')
      );
  return nextFunc();
}

function postCreditLimit(box, nextFunc) {
  var whoAmI = postCreditLimit.name;
  var status = "Not Approved";
  var today = new Date();
  var check_date;
  if(box.reqBody.check_date == "" || box.reqBody.check_date == "0000-00-00" || box.reqBody.check_date == "0000-00-00 00:00:00"){
    check_date = today;
  }else{
    check_date = box.reqBody.check_date;
  }
  var inserting_data = {
    "service_provider_id"       : 1,
    "agency_id"                 : box.reqBody.agency_id ,
    "sub_division_id"           : box.reqBody.sub_division_id ,
    "credit_limit_assigined"    : box.reqBody.credit_limit_assigined ,
    "credit_limit_consumed"     : 0 ,
    "credit_limit_remaining"    : box.reqBody.credit_limit_assigined,
    "agency_remarks"            : box.reqBody.agency_remarks ,
    "payment_mode"              : box.reqBody.payment_mode ,
    "check_number"              : box.reqBody.check_number ,
    "bank_name"                 : box.reqBody.bank_name ,
    "check_date"                : check_date,
    "check_status"              : box.reqBody.check_status ,
    "status"                    : status,
    "created_by"                : box.reqBody.created_by,
    "created_on"                : today
  }
  if(box.reqBody.old_credit_limit_id != undefined && box.reqBody.old_credit_limit_id != "" && box.reqBody.old_credit_limit_added == 'yes'){
    updateOldCreditLimit(box.reqBody.old_credit_limit_id,box.reqBody.agency_id,box.reqBody.sub_division_id,box.reqBody.created_by,today);
  }
  var sql = 'INSERT INTO agency_credit_limit SET ? ';
  con.query(sql,inserting_data,function (err, result) {
    if (err){
      console.info(err);          
      console.info("Error In => "+whoAmI);
      return nextFunc(
        new ActErr(whoAmI, ActErr.DBOperationFailed, 'postCreditLimit', err)
        );
    }else{
      box.resBody.success = true;
      box.resBody.message = 'Credit Limit created successfully';
      box.resBody.credit_limit_id = result.insertId;
      activity(box.reqBody.created_by,'created',"Credit Limit created successfully ")
    }
    return nextFunc();
    });
}

function updateOldCreditLimit(credit_limit_id,agency_id,sub_division_id,created_by,updated_date){
  var inserting_data = {
    "status"                : "Consumed",
    "status_approved_by"    : created_by,
    "updated_by"            : created_by,
    "updated_on"            : updated_date
  }
  console.info("Update Credit Limit to Consumer For Agency Id "+agency_id+" AND Sub Divion Id "+sub_division_id);
  var sql = 'UPDATE agency_credit_limit SET ? WHERE id= "'+credit_limit_id+'" AND agency_id = '+agency_id+' AND sub_division_id = "'+sub_division_id+'"';
  console.info(sql);
  con.query(sql,inserting_data,function (err, result) {
    if (err){
      return false;
    }else{
      return true;
    }
  });
}