"use strict";
const request = require('request-promise');
const LINE_CHANNEL_TOKEN = '6BlHqpsKmwNPlxSbppx1bxDVIvqmJD3wGk8/+XYAs5gSaTaUivxeImbm+37rKU1qNgwg8FD09QsYIjbHc6Tvqptn186izvhKQqqBMMFOaB+xMikqtRnU5ds9zpq3k2ZpyY89kiBglxxZl0qvUrdyX618BSl7lGXPAT9HRw/DX2c=';

const getSuggest = require('./get_suggest');

const sendMessage = require('./send_message');

// TODO: Clean context after 1h timeout;
let store = {};

function *bot() {
  let result = this.request.body.result[0];
  let userMid = result.content.from;

  console.log(result.content.text);
  let suggest = yield* getSuggest(result.content.text);

  let response = suggest[0] && suggest[0].title || 'Sorry we haven\'t, found the place:(';

  if (userMid == 'local') {
    this.body = {
      ok: true,
      text: response
    };
  } else {
    yield* sendMessage({
      userMid: userMid,
      text: response
    });

    this.body = {
      ok: true
    };
  }
}

module.exports = bot;
