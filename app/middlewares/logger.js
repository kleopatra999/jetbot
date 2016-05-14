"use strict";
const bytes = require('bytes');
const colors = require('colors');
const humanize = require('humanize-number');
const Counter = require('passthrough-counter');

module.exports = function *logger(next) {
  // request
  let start = new Date;

  try {
    yield next;
  } catch (err) {
    // log uncaught downstream errors
    log(this, start, null, err);
    throw err;
  }

  // calculate the length of a streaming response
  // by intercepting the stream with a counter.
  // only necessary if a content-length header is currently not set.
  let length = this.response.length;
  let body = this.body;
  let counter;
  if (null == length && body && body.readable) {
    this.body = body
      .pipe(counter = Counter())
      .on('error', this.onerror);
  }

  // log when the response is finished or closed,
  // whichever happens first.
  let ctx = this;
  let res = this.res;

  let onfinish = done.bind(null, 'finish');
  let onclose = done.bind(null, 'close');

  res.once('finish', onfinish);
  res.once('close', onclose);

  function done(event) {
    res.removeListener('finish', onfinish);
    res.removeListener('close', onclose);
    log(ctx, start, counter ? counter.length : length, null, event);
  }
};

const colorCodes = {
  5: 'red',
  4: 'yellow',
  3: 'cyan',
  2: 'green',
  1: 'green'
};

function log(ctx, start, len, err, event) {
  // get the status code of the response
  let status = err
    ? (err.status || 500)
    : (ctx.status || 404);

  // set the color of the status code;
  let s = status / 100 | 0;
  let color = colorCodes[s];

  // get the human readable response length
  let length;
  if (~[204, 205, 304].indexOf(status)) {
    length = '';
  } else if (null == len) {
    length = '-';
  } else {
    length = bytes(len);
  }

  console.log(
    '%s'.bold
    + ' ' + '%s'.gray
    + ' ' + colors[color]('%s')
    + ' ' + '%s'.gray
    + ' ' + '%s'.gray +
    (event === 'close' ? ' CLOSE'.yellow : ''),
    ctx.method,
    ctx.originalUrl,
    status,
    time(start),
    length
  );
}

/**
 * Show the response time in a human readable format.
 * In milliseconds if less than 10 seconds,
 * in seconds otherwise.
 */
function time(start) {
  let delta = new Date - start;
  delta = delta < 10000
    ? delta + 'ms'
    : Math.round(delta / 1000) + 's';
  return humanize(delta);
}
