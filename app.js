// console.log("JHleloo Bindu's node worls");
var bodyParser = require("body-parser");
const express  = require("express");

//Init App
const app = express();

var mysql = require('mysql');

// Body Parser Middleware
app.use(bodyParser.json());

//CORS Middleware
app.use(function (req, res, next) {
    //Enabling CORS
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
});
var con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'r00t',
  database: 'ssu_local'
});


// app.use(function(req, res, next){
// 	res.locals.connection = mysql.createConnection({
// 		host     : 'localhost',
// 		user     : 'root',
// 		password : 'r00t',
// 		database : 'ssu_local'
// 	});
// 	res.locals.connect();
// 	next();
// });

//module.exports = con;
//app.use('/api/v1/users', users);

//Routing

// router.get('/', function(req, res, next) {
// 	res.locals.connection.query('SELECT * from job', function (error, results, fields) {
// 	  	if(error){
// 	  		res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
// 	  		//If there is error, we send the error in the error section with 500 status
// 	  	} else {
//   			res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
//   			//If there is no error, all is good and response is 200OK.
// 	  	}
//   	});
// });
//Home Route
app.get("/",function(req,res){
res.send("hello world");
})

app.get("/api/job", function(req,res){
                var query = "select * from job";
                con.query('query',function(err,result,fields){
                   console.log(result)
                }
              // executeQuery (res,req, query);
});
//Start Server
app.listen(3800,function(){
  console.log("server Running on port 3800");
})
