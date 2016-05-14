"use strict";
const request = require('request-promise');
const {textMessage} = require('./send_message');

function *notifyBot() {
  let notification = this.request.body;

  let mid = notification.id;
  let departDate = notification.depart_date;
  let returnDate = notification.return_date;
  let title = notification.title;
  let url = notification.url;
  let text = `We've found a ticket! ${title}. Depart date is ${departDate}; return date is ${returnDate}. here you go: ${url}`;
  text = url;

  console.log(notification)
  console.log(mid, text)
  yield* textMessage({
    mid: mid,
    text: text
  });

  this.body = {
    ok: true
  };
}

module.exports = notifyBot;
