const cors = require('cors');
const { env } = require('../config/env');

/** Public browser origins allowed to call this gateway (frontend only). Backend is not CORS-enabled. */
function isOriginAllowed(origin) {
  if (!origin) return false;
  if (env.corsAllowAll) return true;
  return env.corsOrigins.includes(origin);
}

/**
 * Answers browser preflights before any proxy/auth/rate-limit.
 * Without this, OPTIONS can fall through to the proxy or fail at nginx with no ACAO header.
 */
function createPreflightMiddleware() {
  return (req, res, next) => {
    if (req.method !== 'OPTIONS') return next();

    const origin = req.headers.origin;
    if (!origin) return next();

    if (!isOriginAllowed(origin)) {
      return res.sendStatus(403);
    }

    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    const requestHeaders = req.headers['access-control-request-headers'];
    res.setHeader(
      'Access-Control-Allow-Headers',
      requestHeaders || 'Content-Type, Authorization'
    );
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.sendStatus(204);
  };
}

/** Adds ACAO on normal gateway responses (e.g. /health). */
function createCorsMiddleware() {
  return cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      callback(null, isOriginAllowed(origin));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  });
}

/**
 * Ensures proxied backend responses carry CORS headers for the browser.
 * Streamed proxy responses may not pick up the global `cors()` hook reliably.
 */
function applyProxyCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (!isOriginAllowed(origin)) return;
  if (!res.getHeader('Access-Control-Allow-Origin')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  if (!res.getHeader('Access-Control-Allow-Credentials')) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
}

module.exports = {
  isOriginAllowed,
  createPreflightMiddleware,
  createCorsMiddleware,
  applyProxyCorsHeaders,
};
