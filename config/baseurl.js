var base_url_config = require('../helpers/base_url.json');
console.info("Setting up Base Url");
var base_url = base_url_config.base_url;
console.info("Base url => "+base_url_config.base_url);
module.exports = base_url;
