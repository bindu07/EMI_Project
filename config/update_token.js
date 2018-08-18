'use strict';
var async = require('async');
require('./database.js');
require('./activity.js');
module.exports = updateToken;

function updateToken(user_id,token,status) {
  var whoAmI = updateToken.name;
  var today = new Date();
  var inserting_data = {
    "token"           : 
    "created_on"                : today
  }
  var sql = 'INSERT INTO agencies SET ? ';
  con.query(sql,inserting_data,function (err, location) {
    if (err){
      console.info(err);          
      console.info("Error In => "+whoAmI);
      return nextFunc(
        new ActErr(whoAmI, ActErr.DBOperationFailed, 'postAgency', err)
        );
    }else{
      box.resBody.success = true;
      box.resBody.message = 'Agency created successfully';
      activity(box.reqBody.created_by,'created',"Agency created successfully "+box.reqBody.name)
    }
  });
      
}