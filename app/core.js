"use strict";
const getSuggest = require('./get_suggest');
const sendMessage = require('./send_message');
const getUserInfo = require('./user_info');

// TODO: Clean context after 1h timeout;
let store = {};

function *core(request) {
  let mid = request.content.from;
  let text = request.content.text;
  let context = null;

  if (!mid) {
    console.log('ERROR', 'Empty MID');
    return;
  }

  if (!text) {
    console.log('ERROR', 'Empty text');
    return;
  }

  console.log('REQUEST'.yellow, text);

  // Split text to words.
  let words = text
    .toLowerCase()
    .replace(/[^\w]/ig, ' ')
    .split(/\s+/);

  if (!store.hasOwnProperty(mid)) {
    context = store[mid] = {
      originName: '',
      originIata: '',
      destinationName: '',
      destinationIata: '',
      months: []
    };

    let userInfo = yield* getUserInfo(mid);
    console.log(userInfo, ', biatch');

    yield* sendMessage({mid, text: 'Hello! Where are you going to flight from?'});
    return;
  } else {
    context = store[mid];
  }

  if (!context.originName) {
    let suggest = yield* getSuggest(text);
    context.originName = suggest[0] && suggest[0].title;
    context.originIata = suggest[0] && suggest[0].code;

    yield* sendMessage({mid, text: `Okay, flight from ${context.originName}.`});
    yield* sendMessage({mid, text: `Where are you going to?`});
  } else if (!context.destinationName) {
    let suggest = yield* getSuggest(text);
    context.destinationName = suggest[0] && suggest[0].title;
    context.destinationIata = suggest[0] && suggest[0].code;

    yield* sendMessage({mid, text: `Okay, flight to ${context.destinationName}.`});
    yield* sendMessage({mid, text: `When?`});
  } else if (context.months) {
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const monthsShort = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    words.forEach((word) => {
      let month = months.indexOf(word);
      if(month != -1) {
        context.months.push(month);
      } else {
        let month = monthsShort.indexOf(word);
        if (month != -1) {
          context.months.push(month);
        }
      }
    });

    yield* sendMessage({mid, text: `Okay, i will search flights in ${context.months.map(i => months[i]).join(', ')}.`});
  }

  if (isFilled(context)) {
    delete store[mid];
    yield* sendMessage({mid, text: `Okay, i say you when cheap price`});
  }
}

function isFilled(context) {
  return context.originName && context.destinationName && context.months.length;
}

module.exports = core;
