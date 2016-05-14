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


  console.log(result.content.text)
  let suggest = yield* getSuggest(result.content.text);

  console.log(suggest)
  console.log(suggest[0].title);

  yield* send('Hello, world', {
    channelMid: fromId,
    userMid: userMid,
    text: suggest[0] && suggest[0].title || 'Sorry mista, place not found'
  });
}

function *getSuggest(query) {
  const autocompleteUrl = `http://www.jetradar.com/autocomplete/places?q=${query}&with_countries=false&locale=en`;

  return yield request({
    method: 'GET',
    url: autocompleteUrl,
  });
}

function *send(message, params) {
  const options = {
    method: 'POST',
    url: 'https://api.line.me/v1/events',
    headers: {
      'X-LINE-ChannelToken': '6BlHqpsKmwNPlxSbppx1bxDVIvqmJD3wGk8/+XYAs5gSaTaUivxeImbm+37rKU1qNgwg8FD09QsYIjbHc6Tvqptn186izvhKQqqBMMFOaB+xMikqtRnU5ds9zpq3k2ZpyY89kiBglxxZl0qvUrdyX618BSl7lGXPAT9HRw/DX2c='
    },
    body: {
      "to": [ params.userMid ],
      "toChannel":1383378250,
      "eventType":"138311608800106203",
      "content":{
        'contentType': 1,
        'toType': 1,
        'text': params.text || 'sorry mista'
      }
    },
    json: true
  };

  yield request(options);
}

module.exports = bot;


// http://www.jetradar.com/autocomplete/places?q=ban&with_countries=false&locale=en

