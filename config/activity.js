module.exports = activity;

function activity(created_by,activity_type,description){
	var today = new Date();
	var inserting_data = {
	    "created_by"      	: created_by,
	    "activity_type"	: activity_type, 
	    "description"	: description, 
	    "lmts"      	: today
  	}
	var sql = 'INSERT INTO activity SET ? ';
  	con.query(sql,inserting_data,function (err, location) {
    	if (err){
      		console.info(err);          
      		console.info("Error In => "+activity.name);
      		return false;
    	}else{
      		return true;
    	}
  	});
}

global.activity = activity;