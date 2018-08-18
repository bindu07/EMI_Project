"use strict";
process.title = "auth_server";
module.exports = validateCsrf;

console.info("Header validation Initilized");
function validateCsrf(headers) {
  var response = false;
  console.info("validateCsrf function");
  var b64string = require("../helpers/csrf.json");
  if (global.Env != "dev") {
    if (
      headers.ab_authorization == "" ||
      headers.ab_authorization == undefined
    ) {
      response = false;
    } else {
      console.info(
        "CSRF TOKEN FROM API REQUEST => " + headers.ab_authorization
      );
      var csrf_token = b64string.dev_csrf_token;
      var decoded_value = decoded_string(headers.ab_authorization);
      console.info(csrf_token);
      console.info(decoded_value);
      if (csrf_token == decoded_value) {
        response = true;
      }
    }
  } else {
    response = true;
  }
  return response;
}

function encoded_string(actual_string) {
  var buffer = new Buffer(actual_string);
  var toBase64 = buffer.toString("base64");
  console.info(actual_string + " encoding to base64 is " + toBase64);
  return toBase64;
}

function decoded_string(base64_string) {
  var buffer = new Buffer(base64_string, "base64");
  var toAscii = buffer.toString("ascii");
  console.info(base64_string + " encoding to Ascii is " + toAscii);
  return toAscii;
}
