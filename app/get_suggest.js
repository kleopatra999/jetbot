"use strict";
const request = require('request-promise');

function *getSuggest(query) {
  const autocompleteUrl = `http://beta.jetradar.com/autocomplete/places?q=${encodeURIComponent(query)}&with_countries=false&locale=en&fuzzy=true`;

  try {
    let response = yield request({
      method: 'GET',
      url: autocompleteUrl
    });

    return JSON.parse(response);
  } catch (e) {
    // statements
    console.log(e);
    return [];
  }
}

module.exports = getSuggest;
