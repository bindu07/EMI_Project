'use strict';
var async = require('async');
var sha1 = require('sha1');
var moment = require('moment');
require('../../helpers/sendSms.js');
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
  return nextFunc();
}

function postCollectionDetails(box, nextFunc) {
  var whoAmI = postCollectionDetails.name;
  var today = new Date();
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
    "created_on"                  : today,
    "mjpreceiptdate"              : new Date(box.reqBody.mjpreceiptdate),
    "mjpreceipt_number"           : box.reqBody.mjpreceipt_number,
    "consumer_name"               : box.reqBody.consumer_name
  }
  var sql_validate = "select * from consumer_accounts where consumer_account_number = '"+box.reqBody.consumer_account_number+"' AND status ='active'";
  con.query(sql_validate,
    function (err_validate, result_validate) {
      console.info(result_validate.length);
      console.info("<------------->");
      if(result_validate.length == 0){
        box.res.status(401).json({
              status: 'Unauthorized',
              message:"Consumer Account Doesn't exist Or Consumer Account is no in active !"
            });
      }else{
  console.info("Bill Id");
  console.info(box.reqBody.bill_id);
  console.info("<----->");
        if(box.reqBody.bill_id != 0 && box.reqBody.bill_id != "" && box.reqBody.bill_id != null){
          updateStatusOfBill(box.reqBody.bill_id,box.reqBody.amount_paid,box.reqBody.payment_date,box.reqBody.consumer_account_number,box.reqBody.payment_status);
          calculateoutstandingamount(box.reqBody.bill_id,box.reqBody.consumer_account_number,box.reqBody.amount_paid);
        }
        var sql = 'INSERT INTO collection_details SET ? ';
        con.query(sql,inserting_data,function (err, result) {
  console.info(result);
          if (err){
            return nextFunc(
              new ActErr(whoAmI, ActErr.DBOperationFailed, 'postCollectionDetails', err)
              );
          }else{
            sendSMSToConsumer(box.reqBody.consumer_account_number,box.reqBody.amount_paid,box.reqBody.payment_date,box.reqBody.created_by);
            box.resBody.success     = true;
            box.resBody.message     = 'Receipt created successfully';
            box.resBody.receipt_id  = result.insertId;
            activity(box.reqBody.created_by,'Receipt created',"description")
          }
          return nextFunc();
          });
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
  // var sql = 'UPDATE temp_bill_details SET ? WHERE consumer_account_number = "'+consumer_account_number+'"';
  console.info(sql);
  con.query(sql,inserting_data,function (err, result) {
    if (err){
      return false;
    }else{
      updateStatusOfRemainingBills(bill_id,consumer_account_number);
      return true;
    }
  });
}

function updateStatusOfRemainingBills(bill_id,consumer_account_number){
   var inserting_data = {
    "bill_status"           : 'inactive'
  }
  console.info("Bill Id => "+bill_id);
  var sql = 'UPDATE temp_bill_details SET ? WHERE bill_id != '+bill_id+' AND consumer_account_number = "'+consumer_account_number+'"';
  // var sql = 'UPDATE temp_bill_details SET ? WHERE consumer_account_number = "'+consumer_account_number+'"';
  console.info(sql);
  con.query(sql,inserting_data,function (err, result) {
    if (err){
      return false;
    }else{
      return true;
    }
  });
}


function calculateoutstandingamount(bill_id,consumer_account_number,amount_paid) {
  
   var sql ='SELECT  * FROM temp_bill_details where bill_id="'+bill_id+'" and consumer_account_number="'+consumer_account_number+'"';
   con.query(sql,function (err, result) {
    if (err){
      return false;
    }else{
      var tempvalue=0;
      var amountpaid=amount_paid;
      var outstanding_current_month_amount=0;
      var outstanding_arrears_amount=0;
      var outstanding_dpcamount=0;
      var outstanding_penalty=0;
      var balanceamount=0;
      var current_month_amount=result[0].current_month_amount;
      var arrears=result[0].arrears;
      var delayed_payment_charges=result[0].delayed_payment_charges;
      var penalty=result[0].penalty;
      var duedate=result[0].due_date;
      var current_date= new Date();
      tempvalue=amountpaid;
     if(tempvalue > current_month_amount){
      tempvalue=tempvalue-current_month_amount;
      if(tempvalue > arrears ){
        outstanding_current_month_amount=0;
        tempvalue=tempvalue-arrears;
        if(tempvalue > delayed_payment_charges ){
            outstanding_arrears_amount=0;
            tempvalue=tempvalue-delayed_payment_charges;
            if(tempvalue > penalty){
                outstanding_dpcamount=0;
                tempvalue=tempvalue-penalty;
                outstanding_penalty=tempvalue;
            }else{
              var c_pena=penalty-tempvalue;
                 outstanding_penalty=c_pena;
            }

        }else{
           var c_m_dpc=delayed_payment_charges-tempvalue;
           outstanding_dpcamount=c_m_dpc;
            outstanding_penalty=penalty;
        }
      }
      else{
          var c_m_arr=arrears-tempvalue;
          outstanding_arrears_amount=c_m_arr;
          outstanding_dpcamount=delayed_payment_charges;
           outstanding_penalty=penalty;
       }
     }
     else{
          var c_m_a_l=current_month_amount-tempvalue;
          outstanding_current_month_amount=c_m_a_l;
          outstanding_arrears_amount=arrears;
          outstanding_dpcamount=delayed_payment_charges;
          outstanding_penalty=penalty;
     }
     if(current_date < duedate){
      outstanding_penalty=0;
      balanceamount=outstanding_current_month_amount+outstanding_arrears_amount+outstanding_dpcamount+outstanding_penalty;
     }
     else{
       balanceamount=outstanding_current_month_amount+outstanding_arrears_amount+outstanding_dpcamount+outstanding_penalty;
     }
     
      var insertingdata={
        "outstanding_current_month_amount":outstanding_current_month_amount,
        "outstanding_arrears":outstanding_arrears_amount,
        "outstanding_dpc":outstanding_dpcamount,
        "balance_amount":balanceamount,
        "outstanding_penalty" :outstanding_penalty
      }
  var sql = 'UPDATE collection_details SET ? WHERE bill_id = '+bill_id+' AND consumer_account_number = "'+consumer_account_number+'"';
  console.info(sql);
  con.query(sql,insertingdata,function (err, result) {
    if (err){
      return false;
    }else{
      return true;
    }
  });
    }
  });

}

function sendSMSToConsumer(consumer_account_number,amount_paid,payment_date,created_by){
  var sql="SELECT U.mobile_number,TB.bill_month FROM consumer_accounts as CA LEFT JOIN  users U ON CA.user_id = U.user_id   LEFT JOIN  temp_bill_details  TB on  CA.consumer_account_number=TB.consumer_account_number WHERE CA.consumer_account_number="+consumer_account_number;
  con.query(sql,function (err, result) {
    if (err){
      return false;
    }else{
      console.info(result);
      var mobile_number=result[0].mobile_number;
      var billingMonth=result[0].bill_month;
      var payment_date1 = moment(payment_date).format("DD-MM-YYYY");
          sendSms(mobile_number,'MJP water bill  of '+billingMonth+'  Consumer '+consumer_account_number+' is Paid Amt '+amount_paid+' on '+payment_date+' . Collected by '+created_by+' .');

    }
  });
}
