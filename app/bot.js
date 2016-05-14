"use strict";
const request = require('request-promise');
const LINE_CHANNEL_TOKEN = '6BlHqpsKmwNPlxSbppx1bxDVIvqmJD3wGk8/+XYAs5gSaTaUivxeImbm+37rKU1qNgwg8FD09QsYIjbHc6Tvqptn186izvhKQqqBMMFOaB+xMikqtRnU5ds9zpq3k2ZpyY89kiBglxxZl0qvUrdyX618BSl7lGXPAT9HRw/DX2c=';

const core = require('./core');
const sendMessage = require('./send_message');

function *bot() {
  let result = this.request.body.result[0];
  let userMid = result.content.from;
  let response = yield* core(result);

  yield* sendMessage({
    mid: userMid,
    text: response
  });

  this.body = {
    ok: true
  };
}

module.exports = bot;
