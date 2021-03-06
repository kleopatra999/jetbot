"use strict";
const router = require('koa-router')();
const json = require('koa-json');

router.use(json({
  pretty: process.env.NODE_ENV != 'production'
}));

router.get('/ping', function *(next) {
  this.body = {
    ok: true,
    pong: 'pong'
  };
});

router.post('/receive', require('./bot'));
router.post('/notify', require('./notify_bot'));

module.exports = router;
