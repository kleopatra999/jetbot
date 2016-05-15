"use strict";
const request = require('request-promise');

function *getCheapest(params) {
  let nowYear = new Date().getFullYear();
  let nextYear = new Date().getFullYear() + 1;
  let nowMonth = new Date().getMonth();

  let months = "";
  params.months.forEach((month) => {
    if (month<10 && month>=nowMonth) {
      months = `${months}&calendar_request[depart_months][]=${nowYear}-0${month}-01`;
    } else if (month>=10 && month>=nowMonth) {
      months = `${months}&calendar_request[depart_months][]=${nowYear}-${month}-01`;
    } else if (month<10 && month<nowMonth){
      months = `${months}&calendar_request[depart_months][]=${nextYear}-0${month}-01`;
    } else {
      months = `${months}&calendar_request[depart_months][]=${nextYear}-${month}-01`;
    }
  });

  const calendarUrl = `http://www.jetradar.com/api/calendar/full/month?utf8=%E2%9C%93&calendar_request[min_trip_duration]=1&calendar_request[max_trip_duration]=14&calendar_request[destination_iata]=${params.destination.iata}&calendar_request[origin_iata]=${params.origin.iata}${months}&calendar_request[one_way]=false`;

  try {
    let response = yield request({
      method: 'GET',
      url: calendarUrl
    });
    let data = JSON.parse(response);
    let price = data.links.cheapest[0].value * data.currency["USD"].rate;
    return price.toFixed();
  } catch (e) {
    // statements
    console.log('ERROR'.red, e);
    return [];
  }
}

module.exports = getCheapest;
