'use strict';
var async = require('async');
var sha1 = require('sha1');

require('../../helpers/randomString.js');

module.exports = post;

function post(req, res) {
  var box = {
    req: req,
    res: res,
    reqBody: req.body,
    resBody: {}
  };
  var whoAmI = post.name;
  async.series([
    checkInputParams.bind(null, box),
    postCodes.bind(null, box)
    ],
    function (err) {
      console.info(whoAmI, 'Completed');
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

  /*if (!box.reqBody.service_provider_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :service_provider_id')
      );*/
  if (!box.reqBody.agency_id)
    return nextFunc(
      new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :agency_id')
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

function postCodes(box, nextFunc) {
  var whoAmI = postCodes.name;
  var today = new Date();
  var status = 'active';
  var slug;
  if(box.reqBody.slug == "" || box.reqBody.slug == undefined){
    slug = "NA";
  }else{
    slug = box.reqBody.slug;
  }
  var inserting_data = {
    "service_provider_id"   : 1 ,
    "agency_id"       		  : box.reqBody.agency_id ,
    "type"                  : box.reqBody.type ,
    "slug"   	              :  slug,
    "code"                  : box.reqBody.code ,
    "description"  		      : box.reqBody.description ,
    "status"        		    : status ,
    "created_by"      		  : box.reqBody.created_by,
    "created_on"      		  : today
  }
        var sql = 'INSERT INTO codes SET ? ';
        con.query(sql,inserting_data,function (err, result) {
          if (err){
            console.info(err);          
            console.info("Error In => "+whoAmI);
            return nextFunc(
              new ActErr(whoAmI, ActErr.DBOperationFailed, 'postCodes', err)
              );
          }else{
            box.resBody.success = true;
            box.resBody.message = 'Code Created successfully';
            box.resBody.job_id      = result.insertId;
            activity(box.reqBody.created_by,'created',"description")
          }
          return nextFunc();
        });
      
}