"use strict";
const request = require('request-promise');

const core = require('./core');
const sendMessage = require('./send_message');

function *bot() {
  let result = this.request.body.result[0];
  let userMid = result.content.from;
  let response = yield* core(result);

  this.body = {
    ok: true
  };
}

module.exports = bot;
