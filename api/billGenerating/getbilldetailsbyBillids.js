	   'use strict';
	var async = require('async');
	var moment = require('moment');
	module.exports = get;

	function get(req, res) {
		console.info("enter");
	  var box = {
	    req: req,
	    reqParams: req.params,
	    res: res,
	    reqBody: req.body,
	    resBody: {}
	  };

	  async.series([
	    getBilldetailsinPdf.bind(null, box)
	    ],
	    function (err) {
	      if (err)
	        return respondWithError(res, err);
	      sendJSONResponse(res, box.resBody);
	    });
	}

	function getBilldetailsinPdf(box, nextFunc) {
		var whoAmI = getBilldetailsinPdf.name;
	  var sql ="SELECT BD.*,CA.*,U.*,JD.url,JD.meter_reading,JD.consumption,JD.previous_reading as previousreading,JD.reading_taken_on FROM temp_bill_details as BD LEFT JOIN consumer_accounts CA ON BD.consumer_account_number = CA.consumer_account_number LEFT JOIN  users as U ON U.user_id = CA.user_id  LEFT JOIN job_details as JD ON JD.consumer_account_number = CA.consumer_account_number AND BD.job_number=JD.job_id WHERE  BD.bill_id between '"+box.reqParams.bill_id_from+"' AND '"+box.reqParams.bill_id_to+"'";
	  console.info(sql);
	  con.query(sql,
	  function (err, result) {
	        if (err){
	          console.info(err)
	          console.info("Error In => "+whoAmI);
	          return nextFunc(
	            new ActErr(whoAmI, ActErr.DBOperationFailed, 'Get BilldetailsinPdf', err)
	            );
	        }else{
	          if(result.length >= 1){
	          	
	            box.resBody.success = true;
	            box.resBody.data = result;
	          }else{
	            box.resBody.success = false;
	            box.resBody.message = "No Records Found !";
	          }
	        }
	    return nextFunc();
	  }
	  );
	}
