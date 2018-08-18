var mysql = require('mysql');
var db_config = require('../helpers/dbconfig.json');
var db_connection_password = "";

if(global.Env == 'dev'){
  db_connection_password = db_config.devdbPassword;
  db_Name = db_config.dbDevName;
}else if(global.Env == 'local'){
  db_connection_password = db_config.devlocalPassword;
  db_Name = db_config.dbName;
}else if(global.Env == 'test'){
  db_connection_password = db_config.testdbPassword;
  db_Name = db_config.dbTestName;
}


var con = mysql.createConnection({
  host: db_config.dbHostName,
  user: db_config.dbUsername,
  password: db_connection_password,
	database: db_Name
});
global.con = con;
con.connect(function(err) {
	if(err){
		console.info("Error in connecting with database");
		throw err;
  	}else{
  		console.info("Database Connected!");
  	}
});

module.exports = con;
