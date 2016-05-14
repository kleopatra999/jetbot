"use strict";
const getSuggest = require('./get_suggest');
const {textMessage, richMessage} = require('./send_message');
const getUserInfo = require('./user_info');
const createSubscription = require('./create_subscription');

// TODO: Clean context after 1h timeout;
let store = {};

let STATE_START = 'STATE_START';
let STATE_ASK_ORIGIN = 'STATE_ASK_ORIGIN';
let STATE_ASK_DESTINATION = 'STATE_ASK_DESTINATION';
let STATE_ASK_MONTHS = 'STATE_ASK_MONTHS';

function *core(request) {
  let mid = request.content.from;
  let text = request.content.text;
  let context = null;
  let userInfo = null;

  if (!mid) {
    console.log('ERROR', 'Empty MID');
    return;
  }

  if (!text) {
    console.log('ERROR', 'Empty text');
    return;
  }

  if (text == 'test rich') {
    yield* richMesage({mid, text: 'test message', imageUrl: 'http://pics.avs.io/240/240/PG.png', targetUrl: 'http://www.jetradar.com/'});
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
      state: STATE_START,
      originName: '',
      originIata: '',
      destinationName: '',
      destinationIata: '',
      months: []
    };

    let userName = '';

    try {
      userInfo = yield* getUserInfo(mid);
      userName = userInfo.contacts[0].displayName;
    } catch (e) {
      userName = 'friend';
    }

    let origin = yield* parsePlace('from', words);
    if (origin) {
      context.originName = origin.name;
      context.originIata = origin.iata;
    }

    let destination = yield* parsePlace('to', words);
    if (destination) {
      context.destinationName = destination.name;
      context.destinationIata = destination.iata;
    }

    yield* sendMessage({mid, text: `Hello, ${userName}! WELCOME MESSAGE`});
  } else {
    context = store[mid];
  }

  switch (context.state) {
    case STATE_START:

      // Send user message about what data we have in context.
      if (context.originName && context.destinationName) {
        yield* sendMessage({mid, text: `Okay, flight from ${context.originName} to ${context.destinationName}.`});
        yield* sendMessage({mid, text: `When?`});
        context.state = STATE_ASK_MONTHS;
      } else if (context.originName) {
        yield* sendMessage({mid, text: `Okay, flight from ${context.originName}.`});
        yield* sendMessage({mid, text: `Where are you going TO?`});
        context.state = STATE_ASK_DESTINATION;
      } else if (context.destinationName) {
        yield* sendMessage({mid, text: `Okay, flight to ${context.destinationName}.`});
        yield* sendMessage({mid, text: `Where are you going to flight FROM?`});
        context.state = STATE_ASK_ORIGIN;
      } else {
        yield* sendMessage({mid, text: `Where are you going to flight FROM?`});
        context.state = STATE_ASK_ORIGIN;
      }

      break;

    case STATE_ASK_ORIGIN:

      let suggestOrigin = yield* getSuggest(text);
      if (suggestOrigin[0]) {
        context.originName = suggestOrigin[0].title;
        context.originIata = suggestOrigin[0].code;
      }

      context.state = STATE_START;

      break;

    case STATE_ASK_DESTINATION:

      let suggestDestination = yield* getSuggest(text);
      if (suggestDestination[0]) {
        context.destinationName = suggestDestination[0].title;
        context.destinationIata = suggestDestination[0].code;
      }

      context.state = STATE_START;

      break;

    case STATE_ASK_MONTHS:

      context.months = parseMonths(words);
      context.state = STATE_START;

      break;
  }

  if (isFilled(context)) {
    let params = store[mid]
    yield* textMessage({mid, text: `Okay, i say you when cheap price`});
    let result = yield* createSubscription({
      mid: mid,
      origin: {iata: params.originIata},
      destination: {iata: params.destinationIata},
      months: params.months
    });
    console.log(result);
    console.log('success!');
    delete store[mid];
  }
}

function *parsePlace(preposition, words) {
  let from = words.indexOf(preposition);

  if (~from && from + 1 < words.length) {
    // Try with two words first.
    let text = words[from + 1] + ' ' + (words[from + 2] || '');
    let suggest = yield* getSuggest(text);
    if (suggest[0]) {
      return {
        name: suggest[0].title,
        iata: suggest[0].code
      }
    }

    // Try with one.
    text = words[from + 1];
    suggest = yield* getSuggest(text);
    if (suggest[0]) {
      return {
        name: suggest[0].title,
        iata: suggest[0].code
      }
    }
  }

  return false;
}

function parseMonths(words) {
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const monthsShort = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  let foundedMonths = [];

  words.forEach((word) => {
    let month = months.indexOf(word);
    if (~month) {
      foundedMonths.push(month);
    } else {
      let month = monthsShort.indexOf(word);
      if (~month) {
        foundedMonths.push(month);
      }
    }
  });

  return foundedMonths;
}

function isFilled(context) {
  return context.originName && context.destinationName && context.months.length;
}

module.exports = core;
