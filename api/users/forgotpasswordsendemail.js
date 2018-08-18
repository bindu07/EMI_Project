'use strict';
var async = require('async');
var nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
var token = jwt.sign({ foo: 'bar' }, 'shhhhh');
module.exports = get;

function get(req, res) {

  var box = {
    req: req,
    reqParams: req.params,
    res: res,
    reqBody: req.body,
    resBody: {}
  };

  async.series([
    forgotpasswordemailsend.bind(null, box)
    ],
    function (err) {
      if (err)
        return respondWithError(res, err);
      sendJSONResponse(res, box.resBody);
    });
}

function forgotpasswordemailsend(box, nextFunc) {
  var whoAmI = forgotpasswordemailsend.name;
  var sql = 'SELECT email_id from  users where email_id="'+box.reqBody.email_id+'"';
  console.info(sql);
  con.query(sql,
    function(err_validate, result_validate){  
      if(result_validate.length == 1){
        var User = [];
        console.info(box.reqBody.email_id);
            token;
        async.waterfall([
          function () {
            var users = {
              "email":box.reqBody.email_id,
            };
            token = jwt.sign({ foo: 'bar', iat: Math.floor(Date.now() / 1000) - 30 }, 'shhhhh');
            users["token"] = token;
            User.push(users);
            forgotpasswordemailsend1(box,nextFunc);    
          }
          ]);
      }else{
       box.res.status(401).json({
        success: false,
        status:'Unauthorized',
        message:"Account Already Exists !"
      });

     }
      
   });
}
function forgotpasswordemailsend1(box,nextFunc) {
  var smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    tls: true,
    auth: {
      user: 'mjp.pwreset@gmail.com',
      pass: 'mjppwreset@123'
    }
  };
  var smtpTransport = nodemailer.createTransport(smtpConfig);
  var mailOptions = {
   to: box.reqBody.email_id,
   from: 'mjp.pwreset@gmail.com',
   subject: 'SSU Password Reset',
   html: '<b><p>You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
   'Please click on the following link to complete the process:</p><a href = "http://54.169.114.99/updateforgotpassword/#/reset?email='+box.reqBody.email_id+'">Reset Password</a><p>If you did not request this, please ignore this email and your password will remain unchanged.</p></b>'
 };
 smtpTransport.sendMail(mailOptions, function (err,response) {
  if(err){
    console.info(err)
           box.resBody.success = false;
            box.resBody.data = err;
  }
  else{
         console.info(response)
            box.resBody.success = true;
            box.resBody.data = response;
 }
 return nextFunc();

})  

}


