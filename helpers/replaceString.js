'use strict'

function replaceString(mystring){
  	mystring = mystring.replace(/[@.]/g , ''); 
  	return mystring;
}

module.exports = replaceString;
