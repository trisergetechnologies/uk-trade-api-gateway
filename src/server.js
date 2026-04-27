const http = require('http');
const https = require('https');
const { URL } = require('url');
const app = require('./app');
const { env } = require('./config/env');

function probeBackendOnce() {
  try {
    const base = new URL(env.backendUrl);
    const lib = base.protocol === 'https:' ? https : http;
    const port = base.port || (base.protocol === 'https:' ? 443 : 80);
    const req = lib.request(
      {
        hostname: base.hostname,
        port,
        path: '/api/health',
        method: 'GET',
        timeout: 4000,
      },
      (r) => {
        r.resume();
        if (r.statusCode === 200) {
          console.log(`[gateway] Backend OK at ${env.backendUrl}`);
        } else {
          console.warn(`[gateway] Backend ${env.backendUrl} returned HTTP ${r.statusCode}`);
        }
      }
    );
    req.on('timeout', () => {
      req.destroy();
      console.warn(
        `[gateway] Backend health check timed out (${env.backendUrl}). Is uk-trade-backend running? Try BACKEND_URL=http://127.0.0.1:5001`
      );
    });
    req.on('error', (err) => {
      console.warn(
        `[gateway] Cannot reach backend (${env.backendUrl}): ${err.code || err.message}. Start the backend or set BACKEND_URL.`
      );
    });
    req.end();
  } catch (e) {
    console.warn('[gateway] Invalid BACKEND_URL:', e.message);
  }
}

app.listen(env.port, () => {
  console.log(`API gateway listening on ${env.port}`);
  probeBackendOnce();
});
