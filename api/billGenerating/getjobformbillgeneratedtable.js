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
	  var sql ='SELECT * FROM bill_generating_job WHERE job_id="'+box.reqParams.job_id+'" limit 1';
	  console.info(sql);
	  con.query(sql,
	  function (err, result) {
	        if (err){
	          console.info(err)
	          console.info("Error In => "+whoAmI);
	          return nextFunc(
	            new ActErr(whoAmI, ActErr.DBOperationFailed, 'Get job_id', err)
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
