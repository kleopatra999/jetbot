"use strict";
const request = require('request-promise');
const {textMessage} = require('./send_message');

function *notifyBot() {
  let notification = this.request.body;

  let mid = notification.id;
  let departDate = notification.departDate;
  let returnDate = notification.returnDate;
  let title = notification.title;
  let text = `We've found a ticket! ${title}. Depart date is ${departDate}; return date is ${returnDate}`;

  textMessage({
    mid: mid,
    text: title
  })

  this.body = {
    ok: true
  };
}

module.exports = notifyBot;
