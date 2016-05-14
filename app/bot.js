"use strict";
const request = require('request-promise');

function *bot(next) {
  this.body = {ok: true};
}

module.exports = bot;
