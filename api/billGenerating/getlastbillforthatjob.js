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
	    var start_date = box.reqParams.start_date;
	    var end_date=box.reqParams.end_date
	    var startDate1 = moment(start_date).format("YYYY-MM-DD 00:00:01");
	    console.info(startDate1);
	    var end_date1 = moment(end_date).format("YYYY-MM-DD 23:59:59");
	  var sql ='SELECT BD.bill_id,BD.job_number FROM temp_bill_details as BD LEFT JOIN consumer_accounts CA ON BD.consumer_account_number = CA.consumer_account_number LEFT JOIN  users as U ON U.user_id = CA.user_id  LEFT JOIN job_details as JD ON JD.consumer_account_number = CA.consumer_account_number AND JD.job_id=BD.job_number AND BD.job_number=JD.job_id WHERE BD.job_number="'+box.reqParams.job_id+'" order by bill_id desc limit 1';
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
