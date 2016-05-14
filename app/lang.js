"use strict";
const request = require('request-promise');
const TH_REGEX = /[\u0E00-\u0E7F]/;

function isThaiText(text){
  return TH_REGEX.test(text);
}

module.exports = isThaiText;
