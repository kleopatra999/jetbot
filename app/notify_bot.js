"use strict";
const request = require('request-promise');
const {sendMessage} = require('./send_message');

function *notifyBot() {
  let notification = this.request.body;

  let mid = notification.id;
  let departDate = notification.departDate;
  let returnDate = notification.returnDate;
  let title = notification.title;

  this.body = {
    ok: true
  };
}

module.exports = notifyBot;
