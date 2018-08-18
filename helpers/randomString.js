'use strict';
require('./replaceString.js');
console.info('Random String Generation ');
function randomString(charSet) {
    charSet = charSet || 'ACM09ABT';
    charSet = replaceString(charSet);
    var len = 5;
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}

module.exports = randomString;
