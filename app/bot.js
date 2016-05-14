"use strict";
const request = require('request-promise');

const LINE_CHANNEL_TOKEN = '6BlHqpsKmwNPlxSbppx1bxDVIvqmJD3wGk8/+XYAs5gSaTaUivxeImbm+37rKU1qNgwg8FD09QsYIjbHc6Tvqptn186izvhKQqqBMMFOaB+xMikqtRnU5ds9zpq3k2ZpyY89kiBglxxZl0qvUrdyX618BSl7lGXPAT9HRw/DX2c=';

function *bot() {
  let result = this.request.body.result[0];
  let userMid = result.content.from;

  console.log(result.content.text)
  let suggest = yield* getSuggest(result.content.text);

  console.log(suggest)
  console.log(suggest[0]);

  let response = suggest[0] && suggest[0].title || 'Sorry we haven\'t, found the place:(';

  if (userMid == 'local') {
    this.body = {
      ok: true,
      text: response
    };
  } else {
    yield* send({
      userMid: userMid,
      text: response
    });

    this.body = {
      ok: true
    };
  }
}

function *getSuggest(query) {
  const autocompleteUrl = `http://www.jetradar.com/autocomplete/places?q=${query}&with_countries=false&locale=en`;

  let response = yield request({
    method: 'GET',
    url: autocompleteUrl,
  });

  return JSON.parse(response);
}

function *send(params) {
  const options = {
    method: 'POST',
    url: 'https://api.line.me/v1/events',
    headers: {
      'X-LINE-ChannelToken': LINE_CHANNEL_TOKEN
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

