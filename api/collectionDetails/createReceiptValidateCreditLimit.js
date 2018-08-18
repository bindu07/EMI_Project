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
    checkCreditLimitFlag.bind(null, box),
    postCollectionDetails.bind(null, box)
    ],
    function (err) {
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
  if (!box.reqBody.amount_paid)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :amount_paid')
      );
  if (!box.reqBody.consumer_account_number)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :consumer_account_number')
      );
  if (!box.reqBody.payment_category_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :payment_category_id')
      );
  if (!box.reqBody.consumer_sub_division_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :consumer_sub_division_id')
      );
  if (!box.reqBody.payment_category_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :payment_category_id')
      );
  return nextFunc();
}

function postCollectionDetails(box, nextFunc) {
  var whoAmI = postCollectionDetails.name;
  var today = new Date();
  var credit_limit_flag = false;
  if(box.reqBody.bill_id == ""){
    box.reqBody.bill_id = 0;
  }
  if(box.reqBody.bill_date == ""){
    box.reqBody.bill_date = today;
  }
  box.reqBody.bill_date = today;
  box.reqBody.payment_date = today;
  var status_update = false;
  var inserting_data = {
    "utility_board_id"            : box.reqBody.utility_board_id,
    "agency_id"                   : box.reqBody.agency_id ,
    "user_id"                     : 0,
    "consumer_account_number"     : box.reqBody.consumer_account_number.toString() ,
    "payment_category_id"         : box.reqBody.payment_category_id ,
    "bill_id"                     : box.reqBody.bill_id ,
    "bill_date"                   : box.reqBody.bill_date ,
    "bill_period"                 : box.reqBody.bill_period ,
    "due_date"                    : box.reqBody.due_date ,
    "total_amount"                : box.reqBody.total_amount ,
    "payment_mode"                : box.reqBody.payment_mode ,
    "amount_paid"                 : box.reqBody.amount_paid ,
    "payment_date"                : box.reqBody.payment_date,
    "balance_amount"              : box.reqBody.balance_amount,
    "payment_status"              : box.reqBody.payment_status,
    "remarks"                     : box.reqBody.remarks,
    "bank_name"                   : box.reqBody.bank_name,
    "check_number"                : box.reqBody.check_number,
    "check_date"                  : box.reqBody.check_date,
    "check_status"                : box.reqBody.check_status,
    "created_by"                  : box.reqBody.created_by,
    "created_on"                  : today
  }
  var sql_validate = "select * from consumer_accounts where consumer_account_number = '"+box.reqBody.consumer_account_number+"' AND status ='active'";
  con.query(sql_validate,function (err_validate, result_validate) {
      console.info(result_validate.length);
      console.info("<--Validating consumer Account Number-->");
      if(result_validate.length == 0){
        console.info("Validating Consumer Account Number inside if condition where result = 0 ");
        box.res.status(401).json({
              status: 'Unauthorized',
              message:"Consumer Account Doesn't exist Or Consumer Account is no in active !"
            });
      }else{
        console.info("Validating Consumer Account Number inside else condition where result != 0 ");
        console.info(" Bill Id = "+box.reqBody.bill_id);
        // var check_value = checkCreditLimitFlag(box.reqBody.agency_id,box.reqBody.amount_paid);
        var check_value = true;
        console.info("<---->");
        console.info("Check Value");
        console.info(check_value);
        console.info("<---->");
          if(check_value == true)
          {
            console.info("Validating Credit Limit For Company in IF condition and credit_limit_flag is = '"+check_value+"'");
            if(box.reqBody.bill_id != 0 && box.reqBody.bill_id != "" && box.reqBody.bill_id != null){
              updateStatusOfBill(box.reqBody.bill_id,box.reqBody.amount_paid,box.reqBody.payment_date,box.reqBody.consumer_account_number,box.reqBody.payment_status);
            }
            updateCreditLimitOfAgency(box.reqBody.agency_id,box.reqBody.amount_paid)
            var sql = 'INSERT INTO collection_details SET ? ';
            con.query(sql,inserting_data,function (err, result) {
             console.info(result);
              if (err){
                return nextFunc(
                  new ActErr(whoAmI, ActErr.DBOperationFailed, 'postCollectionDetails', err)
                  );
              }else{
                box.resBody.success     = true;
                box.resBody.message     = 'Receipt created successfully';
                box.resBody.receipt_id  = result.insertId;
                activity(box.reqBody.created_by,'Receipt created',"description")
              }
              return nextFunc();
              });
          }else
          {
            console.info("Validating Credit Limit For Company in else condition and remaining_credit_limit is = '"+check_value+"'");
            box.res.status(401).json({
                  status: 'Unauthorized',
                  message:"Please Check Credit Limit Of the Agency !"
                });
          }
    }
  });
}


function updateStatusOfBill(bill_id,amount_paid,payment_date,consumer_account_number,payment_status){
   var inserting_data = {
    "amount_paid"           : amount_paid,
    "status"                : "receipt",
    "payment_status"        : payment_status,
    "amount_paid_on"        : payment_date
  }
  console.info("Bill Id => "+bill_id);
  console.info(amount_paid);
  var sql = 'UPDATE temp_bill_details SET ? WHERE bill_id = '+bill_id+' AND consumer_account_number = "'+consumer_account_number+'"';
  console.info(sql);
  con.query(sql,inserting_data,function (err, result) {
    if (err){
      return false;
    }else{
      return true;
    }
  });
}

// function checkCreditLimitFlag(agency_id,amount_paid){
//   var Check_sql = "SELECT `credit_limit_assigined` - `credit_limit_consumed` as remaining_credit_limit FROM agency_credit_limit  WHERE agency_id = "+agency_id+" AND status = 'Approved' ";
//   console.info("<---->");
//   console.info("Query TO Check Credit Limit");
//   console.info(Check_sql);
//   console.info("<---->");
//   var return_value = false;
//   con.query(Check_sql,function (err, result) {
//     if(err){
//       console.info("Error In checkCreditLimitFlag Method");
//       console.info("<---->");
//       console.info(err);
//       console.info("<---->");
//       return_value = false;
//     }else{
//       var remaining_credit_limit_after_sub = parseFloat(result[0].remaining_credit_limit) - parseFloat(amount_paid);
//       console.info("Result");
//       console.info(result[0].remaining_credit_limit);
//       console.info("remaining_credit_limit_after_sub");
//       console.info(remaining_credit_limit_after_sub);
//       console.info("remaining_credit_limit");
//       console.info(result[0].remaining_credit_limit);
//       console.info("amount_paid");
//       console.info(amount_paid);
//       if(remaining_credit_limit_after_sub  < 0 && remaining_credit_limit_after_sub > amount_paid){
//         return_value = false;
//       }else{
//         return_value = true;
//       }
//     }
//     return return_value;
//   });
// }

function updateCreditLimitOfAgency(agency_id,amount_paid){
  console.info("updateCreditLimitOfAgency Insde function");
  console.info("Agency Id => "+agency_id);
  console.info("Amount Paid" +amount_paid);
  var sql = "UPDATE agency_credit_limit SET credit_limit_consumed = credit_limit_consumed + "+amount_paid+"  WHERE agency_id = "+agency_id+" AND status = 'Approved' ";
  console.info(sql);
  con.query(sql,function (err, result) {
    if (err){
      return false;
    }else{
      updateConsumedCreditLimit(agency_id);
      return true;
    }
  });
}

function updateConsumedCreditLimit(agency_id){
  console.info("updateCreditLimitOfAgency Insde function");
  console.info("Agency Id => "+agency_id);
  var sql = "UPDATE agency_credit_limit SET credit_limit_remaining = credit_limit_assigined - credit_limit_consumed WHERE agency_id = "+agency_id+" AND status = 'Approved' ";
  console.info(sql);
  con.query(sql,function (err, result) {
    if (err){
      return false;
    }else{
      return true;
    }
  });
}


function checkCreditLimitFlag(box, nextFunc){
  var whoAmI = checkCreditLimitFlag.name;
  var Check_sql = "SELECT `credit_limit_assigined` - `credit_limit_consumed` as remaining_credit_limit FROM agency_credit_limit  WHERE agency_id = "+box.reqBody.agency_id+" AND status = 'Approved' AND sub_division_id = '"+box.reqBody.consumer_sub_division_id+"' ";
  console.info("<---->");
  console.info("Query TO Check Credit Limit");
  console.info(Check_sql);
  console.info("<---->");
  var return_value = false;
  con.query(Check_sql,function (err, result) {
    if(err){
      return_value = false;
    }else{
      console.info("<--Result-->");
      console.info(result);
      console.info("<--remaining_credit_limit-->");
      console.info(result[0].remaining_credit_limit);
      var remaining_credit_limit_after_sub = parseFloat(result[0].remaining_credit_limit) - parseFloat(box.reqBody.amount_paid);
      console.info("Result");
      console.info(result[0].remaining_credit_limit);
      console.info("remaining_credit_limit_after_sub");
      console.info(remaining_credit_limit_after_sub);
      console.info("remaining_credit_limit");
      console.info(result[0].remaining_credit_limit);
      console.info("amount_paid");
      console.info(box.reqBody.amount_paid);
      if(remaining_credit_limit_after_sub  < 0){
        console.info("TESTING In remaining_credit_limit_after_sub");
        return nextFunc(
          new ActErr(whoAmI, ActErr.DataNotFound, 'Please Check Credit Limit Of the Agency !')
          );
      }
      if(result[0].remaining_credit_limit < box.reqBody.amount_paid){
        console.info("TESTING "+result[0].remaining_credit_limit+" < "+box.reqBody.amount_paid);
        return nextFunc(
          new ActErr(whoAmI, ActErr.DataNotFound, 'Please Check Credit Limit Of the Agency !')
          );
      }
    }
    return nextFunc();
  });
}