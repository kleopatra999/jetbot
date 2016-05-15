"use strict";
const request = require('request-promise');
const LINE_CHANNEL_TOKEN = '6BlHqpsKmwNPlxSbppx1bxDVIvqmJD3wGk8/+XYAs5gSaTaUivxeImbm+37rKU1qNgwg8FD09QsYIjbHc6Tvqptn186izvhKQqqBMMFOaB+xMikqtRnU5ds9zpq3k2ZpyY89kiBglxxZl0qvUrdyX618BSl7lGXPAT9HRw/DX2c=';

function *textMessage(params) {
  const options = {
    method: 'POST',
    url: 'https://api.line.me/v1/events',
    headers: {
      'X-LINE-ChannelToken': LINE_CHANNEL_TOKEN
    },
    body: {
      'to': [params.mid],
      'toChannel': 1383378250,
      'eventType': '138311608800106203',
      'content': {
        'contentType': 1,
        'toType': 1,
        'text': params.text || 'Something went wrong, sorry…'
      }
    },
    json: true
  };

  yield request(options);
}

function *imageMessage(params) {
  const options = {
    method: 'POST',
    url: 'https://api.line.me/v1/events',
    headers: {
      'X-LINE-ChannelToken': LINE_CHANNEL_TOKEN
    },
    body: {
      'to': [params.mid],
      'toChannel': 1383378250,
      'eventType': '138311608800106203',
      'content': {
        'contentType': 2,
        'toType': 1,
        'originalContentUrl': params.url,
        'previewImageUrl': params.url
      }
    },
    json: true
  };

  yield request(options);
}

function *richMessage(params) {
  const options = {
    method: 'POST',
    url: 'https://api.line.me/v1/events',
    headers: {
      'X-LINE-ChannelToken': LINE_CHANNEL_TOKEN
    },
    body: {
      'to': [params.mid],
      'toChannel': 1383378250,
      'eventType': '138311608800106203',
      'content': {
        'contentType': 12,
        'toType': 1,
        'contentMetadata': {
          'SPEC_REV': '1',
          'DOWNLOAD_URL': params.imageUrl,
          'ALT_TEXT': params.text,
          'MARKUP_JSON': JSON.stringify({
            'canvas': {
              'width': 240,
              'height': 240,
              'initialScene': 'scene1'
            },
            'images': {
              'image1': {
                'x': 0,
                'y': 0,
                'w': 240,
                'h': 240
              }
            },
            'actions': {
              'openTargetUrl': {
                'type': 'web',
                'text': params.text,
                'params': {
                  'linkUri': params.targetUrl
                }
              }
            },
            'scenes': {
              'scene1': {
                'draws': [
                  {
                    'image': 'image1',
                    'x': 0,
                    'y': 0,
                    'w': 240,
                    'h': 240
                  }
                ],
                'listeners': [
                  {
                    'type': 'touch',
                    'params': [0, 0, 240, 240],
                    'action': 'openTargetUrl'
                  }
                ]
              }
            }
          })
        }
      }
    },
    json: true
  };

  yield request(options);
}

function *linkMessage(params) {
  const options = {
    method: 'POST',
    url: 'https://api.line.me/v1/events',
    headers: {
      'X-LINE-ChannelToken': LINE_CHANNEL_TOKEN
    },
    body: {
      'to': [params.mid],
      'toChannel': 1341301715,
      'eventType': '137299299800026303',
      'content': {
        'templateId': 'subscription_notification',
        'textParams': {
          "origin_city": params.originCity,
          "destination_city": params.destinationCity
        },
        "subTextParams": {
          "sub_param": params.priceChanged
        },
        "linkUriParams":{
          "url_param": params.urlParam,
        }
      }
    },
    json: true
  };

  console.log('LINK OPTIONS', options);
  yield request(options);
}

if (process.env.NODE_ENV != 'production') {
  module.exports = {
    textMessage: function *(params) {
      console.log('SEND'.green, params.text);
    },
    richMessage: function *(params) {
      console.log('RICH SEND'.blue, params.text);
    },
    imageMessage: function *(params) {
      console.log('SEND'.green, params.url);
    },
    linkMessage: function *(params) {
      console.log('LINK SEND'.red, params.text);
    }
  }
} else {
  module.exports = {
    textMessage: textMessage,
    richMessage: richMessage,
    imageMessage: imageMessage,
    linkMessage: linkMessage
  };
}
