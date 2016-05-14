"use strict";
const request = require('request-promise');
const sendMessage = require('./send_message');

function *notifyBot() {
  console.log('wut');
  console.log(this.request.body);
  // let result = this.request.body.result[0];
  // let userMid = result.content.from;
  // let response = yield* core(result);


  this.body = {
    ok: true
  };
}

module.exports = notifyBot;


//
