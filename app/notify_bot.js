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
  let priceChanged = title.split('changed! ')[1];
  let iconParam = notification.icon;

  console.log(originCity, urlParam, destinationCity, priceChanged, iconParam);

  yield* linkMessage({
    mid: mid,
    originCity: originCity,
    destinationCity: destinationCity,
    urlParam: urlParam + '/240',
    priceChanged: priceChanged,
    iconParam: iconParam
  })

  console.log(notification)
  // yield* textMessage({
  //   mid: mid,
  //   text: text
  // });

  this.body = {
    ok: true
  };
}

module.exports = notifyBot;
