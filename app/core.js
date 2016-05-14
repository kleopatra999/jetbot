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
let STATE_FINISH = 'STATE_FINISH';

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
    yield* richMessage({
      mid,
      text: 'test message',
      imageUrl: 'http://beta.jetradar.com/graph.png?w=240&h=240&last_prices=257&average_price=327',
      targetUrl: 'http://www.jetradar.com/'
    });
    return;
  }

  // Remove common words.
  text = splitTextToWords(text).join(' ');
  text = text.replace('want to', '');

  console.log('REQUEST'.yellow, text);

  // Split text to words.
  let words = splitTextToWords(text);

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

    context.months = parseMonths(words);

    if (!isPartiallyFilled(context)) {
      yield* textMessage({
        mid,
        text: `Hello, ${userName}!\nTell me your destination and where are you going. For example "I'm going to Phuket from Bangkok" or "what about from Bangkok to Tokyo?"`
      });
    }

  } else {
    context = store[mid];
  }

  const detectNextState = function*() {
    // Send user message about what data we have in context.
    if (context.originName && context.destinationName && context.months.length) {

      yield* textMessage({
        mid,
        text: `Okay, flight from ${context.originName} to ${context.destinationName} in ${monthsToString(context.months)}.`
      });

    } else if (context.originName && context.destinationName) {

      yield* textMessage({mid, text: `Okay, flight from ${context.originName} to ${context.destinationName}.`});
      yield* textMessage({mid, text: `When?`});
      context.state = STATE_ASK_MONTHS;

    } else if (context.originName) {

      yield* textMessage({mid, text: `Okay, flight from ${context.originName}.`});
      yield* textMessage({mid, text: `Where are you going TO?`});
      context.state = STATE_ASK_DESTINATION;

    } else if (context.destinationName) {

      yield* textMessage({mid, text: `Okay, flight to ${context.destinationName}.`});
      yield* textMessage({mid, text: `Where are you going to flight FROM?`});
      context.state = STATE_ASK_ORIGIN;

    } else {

      yield* textMessage({mid, text: `Where are you going to flight FROM?`});
      context.state = STATE_ASK_ORIGIN;

    }
  };


  switch (context.state) {
    case STATE_START:

      yield* detectNextState();

      break;

    case STATE_ASK_ORIGIN:

      let suggestOrigin = yield* getSuggest(text);
      if (suggestOrigin[0]) {
        context.originName = suggestOrigin[0].city_name;
        context.originIata = suggestOrigin[0].city_code;
      }

      yield* detectNextState();

      break;

    case STATE_ASK_DESTINATION:

      let suggestDestination = yield* getSuggest(text);
      if (suggestDestination[0]) {
        context.destinationName = suggestDestination[0].city_name;
        context.destinationIata = suggestDestination[0].city_code;
      }

      yield* detectNextState();

      break;

    case STATE_ASK_MONTHS:

      context.months = parseMonths(words);

      if (context.months.length) {
        yield* detectNextState();
      } else {
        yield* textMessage({mid, text: `Please, repeat when?`});
        context.state = STATE_ASK_MONTHS;
      }

      break;

    case STATE_FINISH:

      context.state = STATE_START;

      break;
  }

  if (isFilled(context)) {
    yield* textMessage({mid, text: `Subscription created!`});

    yield* createSubscription({
      mid,
      origin: {iata: context.originIata},
      destination: {iata: context.destinationIata},
      months: context.months
    });

    console.log('SUBSCRIPTION CREATED'.green, `${context.originIata} -> ${context.destinationIata} [${monthsToString(context.months, true)}]`);
    delete store[mid];
  }
}

function splitTextToWords(text) {
  return text
    .toLowerCase()
    .replace(/[^\w]/ig, ' ')
    .split(/\s+/);
}

function *parsePlace(preposition, words) {
  let from = words.indexOf(preposition);

  if (~from && from + 1 < words.length) {
    // Try with two words first.
    let text = words[from + 1] + ' ' + (words[from + 2] || '');

    let suggest = yield* getSuggest(text);
    if (suggest[0]) {

      return {
        name: suggest[0].city_name,
        iata: suggest[0].city_code
      }
    }

    // Try with one.
    text = words[from + 1];
    suggest = yield* getSuggest(text);
    if (suggest[0]) {
      return {
        name: suggest[0].city_name,
        iata: suggest[0].city_code
      }
    }
  }

  return false;
}

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const MONTHS_SHORT = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

function parseMonths(words) {
  let foundedMonths = [];

  words.forEach((word) => {
    let month = MONTHS.indexOf(word);
    if (~month) {
      foundedMonths.push(month);
    } else {
      let month = MONTHS_SHORT.indexOf(word);
      if (~month) {
        foundedMonths.push(month);
      }
    }
  });

  return foundedMonths;
}

function monthsToString(months, short) {
  short = short || false;
  return months.map(i => capitalize((short ? MONTHS_SHORT : MONTHS)[i])).join(', ');
}

function isFilled(context) {
  return context.originName && context.destinationName && context.months.length;
}

function isPartiallyFilled(context) {
  return context.originName || context.destinationName || context.months.length;
}

function capitalize(s) {
  return s && s[0].toUpperCase() + s.slice(1);
}

module.exports = core;
