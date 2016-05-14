"use strict";
const request = require('request-promise');

function *send(params) {
  const options = {
    method: 'POST',
    url: 'https://api.line.me/v1/events',
    headers: {
      'X-LINE-ChannelToken': LINE_CHANNEL_TOKEN
    },
    body: {
      'to': [params.mid],
      'toChannel': 1383378250,
      'eventType': '138311608800106203',
      'content': {
        'contentType': 1,
        'toType': 1,
        'text': params.text
      }
    },
    json: true
  };

  yield request(options);
}

if (process.env.NODE_ENV != 'production') {
  module.exports = function *(params) {
    console.log('SEND', params.text);
  };
} else {
  module.exports = send;
}
