"use strict";
const request = require('request-promise');
const LINE_CHANNEL_TOKEN = '6BlHqpsKmwNPlxSbppx1bxDVIvqmJD3wGk8/+XYAs5gSaTaUivxeImbm+37rKU1qNgwg8FD09QsYIjbHc6Tvqptn186izvhKQqqBMMFOaB+xMikqtRnU5ds9zpq3k2ZpyY89kiBglxxZl0qvUrdyX618BSl7lGXPAT9HRw/DX2c=';

function *send(params) {
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

  console.log('OPTIONS', options);

  yield request(options);
}

send.image = function *image(params) {
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

  console.log('OPTIONS', options);

  yield request(options);
}

send.rich = function *rich(params) {
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
          'MARKUP_JSON': {
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
          }
        }
      }
    },
    json: true
  };

  console.log('OPTIONS', options);

  yield request(options);
}

if (process.env.NODE_ENV != 'production') {
  module.exports = function *(params) {
    console.log('SEND'.green, params.text);
  };
} else {
  module.exports = send;
}
