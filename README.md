# UK Trade API Gateway

Express proxy gateway for UK Trade.

## Quick start

1. Copy `.env.example` to `.env`.
2. Ensure `BACKEND_URL` points to running backend server.
3. Run `npm install`.
4. Start with `npm run dev`.

## Responsibilities

- Public API entrypoint
- Basic security middleware (helmet, CORS, rate limiting)
- JWT decode support for pass-through context
- Reverse proxy to backend under `/api`

## Notes

- Gateway is intentionally proxy-first; business logic remains in backend service.
