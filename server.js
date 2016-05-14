"use strict";
require('colors');
const koa = require('koa');
const router = require('./app/router');
const logger = require('./app/middlewares/logger');

const app = koa();
app.use(logger);
app.use(router.routes());

const port = process.env.NODE_PORT || 3000;
app.listen(port);
console.log(`Starting server at ` + `http://localhost:${port}`.yellow);