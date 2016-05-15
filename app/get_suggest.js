"use strict";
const request = require('request-promise');

function *getSuggest(query) {
  // const autocompleteUrl = `http://beta.jetradar.com/autocomplete/places?q=${encodeURIComponent(query)}&with_countries=false&locale=en&fuzzy=true`;
  const autocompleteUrl = `http://www.jetradar.com/autocomplete/places?q=${encodeURIComponent(query)}&with_countries=false&locale=en`;

  console.log('AUTOCOMPLETE', query);
  try {
    let response = yield request({
      method: 'GET',
      url: autocompleteUrl
    });

    return JSON.parse(response);
  } catch (e) {
    // statements
    console.log('ERROR'.red, e);
    return [];
  }
}

module.exports = getSuggest;
