'use strict';
var async = require('async');
var sha1 = require('sha1');
var Razorpay = require('razorpay');
var request = require('request');

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
     payAmount.bind(null, box)
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
  if (!box.reqBody.id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :id')
      );
  if (!box.reqBody.service_provider_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :service_provider_id')
      );
  if (!box.reqBody.service_provider_name)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :service_provider_name')
      );
  if (!box.reqBody.bill_detail_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :bill_detail_id')
      );
  if (!box.reqBody.user_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :user_id')
      );
   if (!box.reqBody.consumer_account_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :consumer_account_id')
      );
   if (!box.reqBody.transcation_type)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :transcation_type')
      );
  if (!box.reqBody.amount)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :amount')
      );

   if (!box.reqBody.balance_amount)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :balance_amount')
      );

  if (!box.reqBody.created_by)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :created_by')
      );
  return nextFunc();
}

function payAmount(box, nextFunc) {
var whoAmI = payAmount.name;
  var today = new Date();
  var inserting_data = {
    "id"                        : box.reqBody.id,
    "agency_id"                 : box.reqBody.agency_id,
    "service_provider_id"       : box.reqBody.service_provider_id,
    "payment_category_id"       : box.reqBody.payment_category_id,
    "service_provider_name"     : box.reqBody.service_provider_name,
    "bill_detail_id"            : box.reqBody.bill_detail_id,
    "user_id"                   : box.reqBody.user_id,
    "consumer_account_id"       : box.reqBody.consumer_account_id,
    "account_number"            : box.reqBody.account_number,
    "transcation_type"          : box.reqBody.transcation_type,
    "amount"                    : box.reqBody.amount ,
    "balance_amount"            : box.reqBody.balance_amount,
    "payment_status"            : box.reqBody.payment_status,
    "created_by"                : box.reqBody.created_by
  }
   console.info(inserting_data);
  var instance = new Razorpay({
  key_id: 'rzp_test_uzQzRQTI9pnDAl',
  key_secret: '02GUg0Rw06zJZykxfLFNpHKo'
});
request({
  method: 'POST',
  url: 'https://rzp_test_uzQzRQTI9pnDAl:02GUg0Rw06zJZykxfLFNpHKo@api.razorpay.com/v1/payments/'+inserting_data.id+'/capture',
  form: {
    amount: inserting_data.amount
  }
}, function (error, response, body) {
  if(error){
     box.resBody.Error=body;
     return nextFunc(
              new ActErr(whoAmI, ActErr.body, 'payAmount', err)
              );
  }
  else{
      console.info('Response:', body);
       console.info('Status:', response.statusCode);
       if(response.statusCode==200){
      savePaymentDetails(body,box);
      saveNewCashCollectionDeatils(body,box);
      updateStatusOfBill(box.reqBody.bill_detail_id,box.reqBody.amount,box.reqBody.consumer_account_id,box.reqBody.payment_status);
      box.resBody.success = true;
      box.resBody.transaction_id=body;
      box.resBody.message = 'Payment Successfully';
      activity(box.reqBody.created_by,'Payed',"successfully ")
       }
       else{
       savePaymentDetails(body,box);
       console.info('Response:', body);
       console.info('Status:', response.statusCode);
      box.resBody.success = false;
      box.resBody.message = 'Payment failed';
      activity(box.reqBody.created_by,'Paid',"failed ")
       }

  }
 return nextFunc();
});

}
 function savePaymentDetails(body,box){
   var data=body;
   var profile = JSON.parse(data);
  var whoAmI = savePaymentDetails.name;
  var today = new Date();
  var inserting_data = {
    "service_provider_id"               : box.reqBody.service_provider_id,
    "service_provider_name"             : box.reqBody.service_provider_name,
    "bill_detail_id"                    : box.reqBody.bill_detail_id,
    "user_id"                           : box.reqBody.user_id,
    "consumer_account_id"               : box.reqBody.consumer_account_id,
    "transcation_type"                  : box.reqBody.transcation_type,
    "bank_name"                         : profile.bank,
    "account_number"                    : box.reqBody.account_number,
    "transcation_id"                    : profile.id,
    "amount_paid"                       : parseInt((profile.amount/100)-(box.reqBody.convenience_fee+box.reqBody.payment_gateway_charges)),
    "currency"                          : profile.currency,
    "balance_amount"                    : box.reqBody.balance_amount,
    "created_by"                        : box.reqBody.created_by,
    "convenience_fee"                   : box.reqBody.convenience_fee,
    "payment_gateway_charges"           : box.reqBody.payment_gateway_charges,
    "created_on"                        : today
 }
     var sql = 'INSERT INTO  payment_details SET ? ';

        con.query(sql,inserting_data,function (err, location) {
          if (err){
             return false;
           }else{
             return true;
          }
        });

  }

function saveNewCashCollectionDeatils(body,box){
  var data=body;
  var profile = JSON.parse(data);
  console.info(profile);
  var today = new Date();
  var inserting_data = {
    "utility_board_id"                  : box.reqBody.utility_board_id,
    "agency_id"                         : box.reqBody.agency_id,
    "user_id"                           : box.reqBody.user_id,
    "consumer_account_number"           : box.reqBody.consumer_account_id,
    "payment_category_id"               : box.reqBody.payment_category_id,
    "bill_id"                           : box.reqBody.bill_detail_id,
    "bill_date"                         : today,
    "total_amount"                      : box.reqBody.total_amount,
    "currency"                          : profile.currency,
    "payment_mode"                      : "Online",
    "amount_paid"                       : parseInt((profile.amount/100)-(box.reqBody.convenience_fee+box.reqBody.payment_gateway_charges)),
    "transcation_id"                    : profile.id,
    "payment_date"                      : today,
    "balance_amount"                    : box.reqBody.balance_amount,
    "payment_status"                    : box.reqBody.payment_status,
    "bank_name"                         : profile.bank,
    "transcation_type"                  : box.reqBody.transcation_type,
    "convenience_fee"                   : box.reqBody.convenience_fee,
    "payment_gateway_charges"           : box.reqBody.payment_gateway_charges,
    "created_by"                        : box.reqBody.created_by,
    "created_on"                        : today
  }

  var sql = 'INSERT INTO  collection_details SET ?';
   console.info(sql);
   con.query(sql,inserting_data,function (err, location) {
           if (err){
             return false;
           }else{
            calculateoutstandingamount(box.reqBody.bill_detail_id,box.reqBody.consumer_account_id,profile.amount,box.reqBody.convenience_fee,box.reqBody.payment_gateway_charges);
             return true; 
          }

        });
}

function updateStatusOfBill(bill_id,amount_paid,consumer_account_number,payment_status){
   var today = new Date();
   var inserting_data = {
    "amount_paid"           : amount_paid,
    "status"                : "receipt",
    "payment_status"        : payment_status,
    "amount_paid_on"        : today
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

function calculateoutstandingamount(bill_id,consumer_account_number,amount_paid,convenience_fee,payment_gateway_charges) {
  
   var sql ='SELECT  * FROM temp_bill_details where bill_id="'+bill_id+'" and consumer_account_number="'+consumer_account_number+'"';
   con.query(sql,function (err, result) {
    if (err){
      return false;
    }else{
      var tempvalue=0;
      var amountpaid1=((amount_paid/100)-convenience_fee);
      var amountpaid=amountpaid1-payment_gateway_charges;
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
  console.info(insertingdata);
  con.query(sql,insertingdata,function (err, result) {
    if (err){
       console.info("response false");
      return false;
    }else{
       console.info("response true");
      return true;
    }
  });
    }
  });
  
}
