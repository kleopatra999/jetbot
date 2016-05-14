"use strict";
const bot = require('./bot');

function *test() {
  const query = this.request.query;
  this.request.body = {
    result: [
      {
        content: {
          from: "local",
          text: query.text
        }
      }
    ]
  };

  yield* bot.apply(this);
}

module.exports = test;