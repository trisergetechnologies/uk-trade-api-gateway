const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { env } = require('./config/env');
const { optionalAuth } = require('./middlewares/auth.middleware');
const {
  createPreflightMiddleware,
  createCorsMiddleware,
} = require('./middlewares/cors.middleware');
const routes = require('./routes');

const app = express();

app.use(createPreflightMiddleware());
app.use(createCorsMiddleware());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
// Do not use express.json() globally: it consumes the body stream and breaks
// proxied POST/PATCH (e.g. /api/auth/login). The gateway forwards raw bytes to the backend.
app.use(morgan('dev'));
app.use(optionalAuth);
app.use(
  rateLimit({
    windowMs: env.rateLimitWindowMs,
    max: env.rateLimitMax,
    skip: (req) => req.method === 'OPTIONS',
  })
);

app.use('/', routes);

module.exports = app;
