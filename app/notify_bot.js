"use strict";
const request = require('request-promise');
const {textMessage, linkMessage} = require('./send_message');

function *notifyBot() {
  let notification = this.request.body;

  let mid = notification.id;
  let departDate = notification.depart_date;
  let returnDate = notification.return_date;
  let title = notification.title;

  let urlParam = notification.url.split('co.th')[1];
  let cities = title.split('Alert. ')[1].split(': ')[0]

  let originCity = cities.split(' - ')[0]
  let destinationCity = cities.split(' - ')[1];

  console.log(originCity, urlParam, destinationCity);

  yield* linkMessage({
    mid: mid,
    originCity: originCity,
    destinationCity: destinationCity,
    urlParam: urlParam
  })

  console.log(notification)
  console.log(mid, text)
  // yield* textMessage({
  //   mid: mid,
  //   text: text
  // });

  this.body = {
    ok: true
  };
}

module.exports = notifyBot;
