const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { env } = require('../config/env');
const { applyProxyCorsHeaders } = require('../middlewares/cors.middleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ success: true, service: 'uk-trade-api-gateway', timestamp: new Date().toISOString() });
});

// Mounting at `/api` strips that prefix from `req.url` before the proxy runs, so the upstream
// would receive `/auth/login` instead of `/api/auth/login` → 404. Restore the `/api` prefix.
router.use(
  '/api',
  createProxyMiddleware({
    target: env.backendUrl,
    changeOrigin: true,
    xfwd: true,
    logLevel: 'warn',
    timeout: env.proxyTimeoutMs,
    proxyTimeout: env.proxyTimeoutMs,
    pathRewrite: (path) => {
      const [pathname, ...qsParts] = path.split('?');
      const qs = qsParts.length ? `?${qsParts.join('?')}` : '';
      const prefixed = pathname.startsWith('/api')
        ? pathname
        : `/api${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
      return `${prefixed}${qs}`;
    },
    on: {
      proxyRes(proxyRes, req, res) {
        applyProxyCorsHeaders(req, res);
      },
      error(err, req, res) {
        if (!res || typeof res.writeHead !== 'function' || res.headersSent) {
          return;
        }
        applyProxyCorsHeaders(req, res);
        const statusCode = err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' ? 503 : 502;
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: false,
            message: `Gateway could not reach the backend (${env.backendUrl}). Start uk-trade-backend on port 5001 or fix BACKEND_URL.`,
            code: err.code || 'PROXY_ERROR',
          })
        );
      },
    },
  })
);

module.exports = router;
