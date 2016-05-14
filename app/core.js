"use strict";
const getSuggest = require('./get_suggest');

// TODO: Clean context after 1h timeout;
let store = {};

function *core(request) {
  let mid = request.content.from;
  let text = request.content.text;
  let context = null;

  if (!store.hasOwnProperty(mid)) {
    context = store[mid] = {
      originName: '',
      originIata: '',
      destinationName: '',
      destinationIata: '',
      months: []
    };
  } else {
    context = store[mid];
  }

  let suggest = yield* getSuggest(text);

  store[mid].originName = suggest[0] && suggest[0].title;

  if (isFilled(store[mid])) {
    // TODO: create price alert.
  } else {
    if (!origin) {
      store[mid].expect = 'origin';
    }
  }
}

module.exports = core;
