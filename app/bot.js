"use strict";
const request = require('request-promise');

function *bot(next) {
  this.body = {
    ok: true
  };
  console.log(this.request.body);
  console.log(this.request.body[0].result.content);
}

module.exports = bot;


// http://www.jetradar.com/autocomplete/places?q=ban&with_countries=false&locale=en
