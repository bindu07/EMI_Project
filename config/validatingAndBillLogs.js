module.exports = validatingAndBillLogs;

function validatingAndBillLogs(created_by,job_id,job_detail_id,consumer_account_number,activity_type){
  var meter_reading_validation  = "No";
  var bill_generated            = "No";
  var MeterReadingHistory       = "No";
  var today                     = new Date();
  if(activity_type == "meter"){
    meter_reading_validation = "Yes";
  }else if(activity_type == "bill"){
    bill_generated = "Yes";
  }else if(activity_type == 'Meter Reading History'){
    MeterReadingHistory = activity_type;
  }
  var inserting_data = {
      "created_by"                  : created_by,
      "job_id"                      : job_id, 
      "job_detail_id"               : job_detail_id, 
      "consumer_account_number"     : consumer_account_number,
      "meter_reading_validation"    : meter_reading_validation,
      "meter_reading_history"    : MeterReadingHistory,
      "bill_generated"              : bill_generated,
      "created_on"                  : today
    }
  var sql = 'INSERT INTO batchJobLogs SET ? ';
  con.query(sql,inserting_data,function (err, location) {
    if (err){
        console.info(err);          
        console.info("Error In => "+validatingAndBillLogs.name);
        return false;
    }else{
        return true;
    }
  });
}
global.validatingAndBillLogs = validatingAndBillLogs;