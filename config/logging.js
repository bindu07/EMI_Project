module.exports = console;
console.log("configuring logs ");
var winston = require('winston');

var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!

var yyyy = today.getFullYear();
if(dd<10){
    dd='0'+dd;
} 
if(mm<10){
    mm='0'+mm;
} 
var today_date = dd+'-'+mm+'-'+yyyy;
if(global.Env == undefined || global.Env == ""){
  global.Env = 'dev';
  var log_file_path = '../logs/mSMARTEU-'+today_date+'.log';
}else{
  var log_file_path = './logs/mSMARTEU-'+today_date+'.log';
}

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ 
    	filename:log_file_path,
    })
  ]
});

console.error=logger.error;
console.log=logger.ingo;
console.info=logger.info;
console.debug=logger.debug;
console.warn=logger.warn;
module.exports = console;
console.info("log's configured successfully");
console.info('Here is your first log');