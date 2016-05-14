"use strict";
const request = require('request-promise');

function *createSubscription(params) {
  const email = `${params.mid}@line.me`;

  const formParams = {
    one_way: 'false',
    origin: params.origin,
    marker: 'direct',
    destination: params.destination,
    currency: 'USD',
    locale: 'th',
    months: params.months,
    "vacation_duration": {
      "max": 14,
      "min": 1
    }
  };

  let subscriptionParams = encodeURIComponent(JSON.stringify({
    raw_rules: formParams
  }));

  let url = `http://beta.jetradar.com/subscriptions/create?email=${email}&activate_subscriber=true&recieve_news=false&web_push_enabled=false&email_enabled=false&line_enabled=true&line_id=${params.mid}&subscription=${subscriptionParams}&lang=en`;

  try {
    console.log(url);
    let response = yield request({
      method: 'GET',
      url: url,
    });

    return JSON.parse(response);
  } catch(e) {
    // statements
    console.log(e);
    return [];
  }
}

module.exports = createSubscription;
