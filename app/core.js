"use strict";
const getSuggest = require('./get_suggest');
const {textMessage, imageMessage, richMessage, linkMessage} = require('./send_message');
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
  console.log('REQUEST', request);

  let mid = request.content.from;
  let text = request.content.text;
  let opType = request.content.opType;

  if (opType == 4) {
    mid = request.content.params[0];
    let userName = yield* getUserName(mid);

    yield* textMessage({mid, text: `Hello, ${userName}!\nI will search best flights for you.`});
    yield* textMessage({mid, text: `Tell me your destination and where are you going. For example "I'm going to Phuket from Bangkok" or "what about from Bangkok to Tokyo?"`});
    return;
  }

  let context = null;

  if (!mid) {
    console.log('ERROR', 'Empty MID');
    return;
  }

  if (!text) {
    console.log('ERROR', 'Empty text');
    return;
  }

  let userName = yield* getUserName(mid);


  if (text == 'test rich') {
    yield* richMessage({
      mid,
      text: 'test message',
      imageUrl: 'http://beta.jetradar.com/graph.png?w=240&h=240&last_prices=257&average_price=327',
      targetUrl: 'http://www.jetradar.com/'
    });
    return;
  }

  if (text == 'test link') {
    yield* linkMessage({
      mid,
      text: 'link message',
      imageUrl: 'http://beta.jetradar.com/graph.png?w=240&h=240&last_prices=257&average_price=327',
      targetUrl: 'http://www.jetradar.co.th/?locale=en'
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
  } else {
    context = store[mid];
  }

  const parseText = function*() {
    let success = false;

    let origin = yield* parsePlace('from', words);
    if (origin) {
      context.originName = origin.name;
      context.originIata = origin.iata;
      success = true;
    }

    let destination = yield* parsePlace('to', words);
    if (destination) {
      context.destinationName = destination.name;
      context.destinationIata = destination.iata;
      success = true;
    }

    context.months = parseMonths(words);
    if (context.months.length) {
      success = true;
    }

    return success;
  };

  const detectNextState = function*() {
    // Send user message about what data we have in context.
    if (context.originName && context.destinationName && context.months.length) {

      context.state = STATE_START;

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

      let success = yield* parseText();
      if (success) {
        yield* detectNextState();
      } else {
        yield* textMessage({mid, text: `¯\\_(ツ)_/¯`});
        context.state = STATE_START;
      }
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
    yield* textMessage({mid, text: `Great!`});

    if (context.destinationIata == 'MOW') {
      yield* imageMessage({mid, url: 'https://line-hack-jetradar.herokuapp.com/bear.jpg'});
    }

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

function capitalize(s) {
  return s && s[0].toUpperCase() + s.slice(1);
}

function *getUserName(mid) {
  let userName;

  try {
    let userInfo = yield* getUserInfo(mid);
    userName = userInfo.contacts[0].displayName;
  } catch (e) {
    userName = 'friend';
  }

  return userName;
}

module.exports = core;
