"use strict";
require('colors');
const koa = require('koa');
const body = require('koa-body');
const serve = require('koa-static');
const router = require('./app/router');
const logger = require('./app/middlewares/logger');

const app = koa();
app.use(logger);
app.use(body());
app.use(serve(__dirname + '/public'));
app.use(router.routes());

const port = process.env.PORT || 3000;
app.listen(port);
console.log(`Starting server at ` + `http://localhost:${port}`.yellow);
