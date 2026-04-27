const dotenv = require('dotenv');

dotenv.config({ quiet: true });

const env = {
  port: Number(process.env.PORT || 5000),
  /** Prefer 127.0.0.1 over localhost to avoid slow/failed IPv6 (::1) connects on Windows. */
  backendUrl: process.env.BACKEND_URL || 'http://127.0.0.1:5001',
  jwtSecret: process.env.JWT_SECRET || 'change-me',
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 200),
  /** Outgoing proxy socket timeout (ms). Fails fast if the backend is down. */
  proxyTimeoutMs: Number(process.env.PROXY_TIMEOUT_MS || 20_000),
};

module.exports = { env };
