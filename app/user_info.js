"use strict";
const request = require('request-promise');
const LINE_CHANNEL_TOKEN = '6BlHqpsKmwNPlxSbppx1bxDVIvqmJD3wGk8/+XYAs5gSaTaUivxeImbm+37rKU1qNgwg8FD09QsYIjbHc6Tvqptn186izvhKQqqBMMFOaB+xMikqtRnU5ds9zpq3k2ZpyY89kiBglxxZl0qvUrdyX618BSl7lGXPAT9HRw/DX2c=';

function *getUserInfo(mids) {
  const options = {
    method: 'GET',
    url: `https://api.line.me/v1/profiles?mids=${mids}`,
    headers: {
      'X-LINE-ChannelToken': LINE_CHANNEL_TOKEN
    },
    json: true
  };

  console.log(options)

  return yield request(options);
}

module.exports = getUserInfo;
