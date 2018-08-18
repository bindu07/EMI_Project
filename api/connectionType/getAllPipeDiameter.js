'use strict';
var async = require('async');
module.exports = get;

function get(req, res) {
  console.info("enter");
  var box = {
    req: req,
    res: res,
    reqBody: req.body,
    resBody: {}
  };

  async.series([
    getAllPipeDiameter.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function getAllPipeDiameter(box, nextFunc) {
  var whoAmI = getAllPipeDiameter.name;
  var sql = "SELECT * FROM pipe_diameter";
  con.query(sql,
  function (err, result) {
        if (err){
          console.info(err)
          console.info("Error In => "+whoAmI);
          return nextFunc(
            new ActErr(whoAmI, ActErr.DBOperationFailed, 'Get All PipeDiameter Type', err)
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
