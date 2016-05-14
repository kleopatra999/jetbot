"use strict";
const request = require('request-promise');

function *getSuggest(query) {
  const autocompleteUrl = `http://www.jetradar.com/autocomplete/places?q=${query}&with_countries=false&locale=en`;

  let response = yield request({
    method: 'GET',
    url: autocompleteUrl,
  });

  return JSON.parse(response);
}

module.exports = getSuggest;