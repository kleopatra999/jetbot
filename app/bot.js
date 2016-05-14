"use strict";
const request = require('request-promise');

const CHANNEL_SECRET = '9d9ca5008c9ce541e3b575112633c97d';
const CHANNEL_ID = '1466971612';

function *bot(next) {
  this.body = {
    ok: true
  };

  let result = this.request.body.result[0];
  let fromId = result.from;
  let userMid = result.content.from;

  console.log(this.request.body);
  console.log(result.from);
  console.log(result.content);

  yield* send('Hello, world', {
    channelMid: fromId,
    userMid: userMid
  });
}

function *send(message, params) {
  const options = {
    method: 'POST',
    url: 'https://trialbot-api.line.me/v1/events',
    headers: {
      'X-Line-ChannelID': CHANNEL_ID,
      'X-Line-ChannelSecret': CHANNEL_SECRET,
      'X-Line-Trusted-User-With-ACL': params.fromId
    },
    body: {
      "to": [ params.userMid ],
      "toChannel":1383378250,
      "eventType":"138311608800106203",
      "content":{
        'contentType': 1,
        'toType': 1,
        'text': 'Витя Лох'
      }
    },
    json: true
  };

  yield request(options);
}

module.exports = bot;


// http://www.jetradar.com/autocomplete/places?q=ban&with_countries=false&locale=en

