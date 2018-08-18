'use strict';
var async = require('async');
require('../../helpers/randomString.js');

module.exports = post;

function post(req, res) {
  var box = {
    req: req,
    res: res,
    reqParams: req.params,
    reqBody: req.body,
    resBody: {}
  };
  console.info(box.reqBody)
  console.info(box.whoAmI, 'Starting');

  async.series([
    checkInputParams.bind(null, box),
    putCodes.bind(null, box)
    ],
    function (err) {
      console.info(box.whoAmI, 'Completed');
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}
function checkInputParams(box, nextFunc) {
  var whoAmI = box.whoAmI + '_' + checkInputParams.name;
  console.debug('Executing ->', whoAmI );

  if (!box.reqBody)
    return nextFunc(
      new ActErr(whoAmI, ActErr.BodyNotFound, 'Missing body')
      );

  if (!box.reqBody.type)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :type')
      );
  if (!box.reqBody.code)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :code')
      );
  if (!box.reqBody.description)
      return nextFunc(
        new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :description')
        );
  if (!box.reqBody.created_by)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :created_by')
      );
  return nextFunc();
}
function putCodes(box, nextFunc) {
  var today = new Date();
  if(box.reqBody.slug == "" || box.reqBody.slug == undefined){
    slug = "NA";
  }else{
    slug = box.reqBody.slug;
  }
  var inserting_data = {
    "type"                  : box.reqBody.type ,
    "slug"                  :  slug,
    "code"                  : box.reqBody.code ,
    "description"           : box.reqBody.description ,
    "updated_by"            : box.reqBody.created_by,
    "updated_on"            : today
  }
  var sql = 'UPDATE codes SET ? WHERE id = '+ box.reqParams.code_id;
  con.query(sql,inserting_data,function (err, location) {
    if (err){
      console.info(err);          
      console.info("Error In => "+whoAmI);
      return nextFunc(
        new ActErr(whoAmI, ActErr.DBOperationFailed, 'putCodes', err)
        );
    }else{
      box.resBody.success = true;
      box.resBody.message = 'Agency Details Updated successfully';
    }
    return nextFunc();
  });
}