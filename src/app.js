const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { env } = require('./config/env');
const { optionalAuth } = require('./middlewares/auth.middleware');
const routes = require('./routes');

const app = express();

app.use(cors());
app.use(helmet());
// Do not use express.json() globally: it consumes the body stream and breaks
// proxied POST/PATCH (e.g. /api/auth/login). The gateway forwards raw bytes to the backend.
app.use(morgan('dev'));
app.use(optionalAuth);
app.use(
  rateLimit({
    windowMs: env.rateLimitWindowMs,
    max: env.rateLimitMax,
  })
);

app.use('/', routes);

module.exports = app;
