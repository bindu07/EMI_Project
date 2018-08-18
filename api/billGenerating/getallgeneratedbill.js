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
	    getallgeneratedbills.bind(null, box)
	    ],
	    function (err) {
	      if (err)
	        return respondWithError(res, err);
	      sendJSONResponse(res, box.resBody);
	    });
	}

	function getallgeneratedbills(box, nextFunc) {
	  var whoAmI = getallgeneratedbills.name;
	  var sql ='SELECT TB.bill_id,TB.job_number,TB.consumer_account_number from temp_bill_details as TB left join job_details as JD on TB.job_number=JD.job_id and TB.consumer_account_number=JD.consumer_account_number  where JD.status="billgenerated" and JD.job_id="'+box.reqParams.job_number+'"';
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
