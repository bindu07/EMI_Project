module.exports = meterReadingHistory;

function meterReadingHistory(meter_number,meter_reading,job_detail_id,consumer_account_number,activity_type){
  var today                     = new Date();
  var inserting_data = {
      "meter_number"                  : meter_number,
      "meter_reading"                 : meter_reading, 
      "reading_taken_on"              : reading_taken_on, 
      "consumer_account_number"       : consumer_account_number,
      "created_by"                    : created_by,
      "created_on"                    : today
    }
  var sql = 'INSERT INTO meter_reading_history SET ? ';
  con.query(sql,inserting_data,function (err, location) {
    if (err){
        console.info(err);          
        console.info("Error In => "+meterReadingHistory.name);
        return false;
    }else{
        return true;
    }
  });
}
global.meterReadingHistory = meterReadingHistory;