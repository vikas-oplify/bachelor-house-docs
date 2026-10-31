---
title: Local setup
sidebar_position: 2
description: Run the backend, worker and website on your machine.
---

# Local setup

You need **Node 24** (`nvm use` reads `.nvmrc`) and **Docker**. The website needs Node 20 or later.

## Backend

```bash
cd bachelor-house-backend
git checkout chore/scaffold-from-reference
npm ci
cp .env.example .env
npm run stack:up      # Postgres + PostGIS (5433), Redis (6379), MinIO (9000/9001), Mailpit (8025)
npm run db:migrate    # creates extensions, enums and every table
npm run db:seed       # settings, staff, amenities, Pune places, plans, templates
npm run dev           # API on http://localhost:3000, restarts on change
npm run dev:worker    # in a second terminal: queues and schedules
```

Check it's up: `curl localhost:3000/health/live` and `curl localhost:3000/health/ready` (checks the database). The OpenAPI contract is served at `http://localhost:3000/v1/openapi.json` everywhere except production.

### One-time setup

- **MinIO buckets.** Open `http://localhost:9001` (`minioadmin` / `minioadmin`) and create `bh-media`, `bh-kyc` and `bh-invoices`. Uploads fail until they exist.
- **Staff sign-in.** Set `SUPER_ADMIN_EMAIL` and `STAFF_ALLOWED_EMAILS` before `npm run db:seed`, so the seed creates your staff user. Staff sign-in also needs `GOOGLE_CLIENT_ID`; without it, it fails closed.
- **Old volume.** If you have a Postgres volume from the earlier `postgres:17-alpine` image, run `docker compose down -v` once.

### What works without credentials

| Feature | Without credentials |
| --- | --- |
| OTP sign-in | Needs `TURNSTILE_SECRET_KEY`: captcha fails closed when it's unset. Use Cloudflare's always-pass test secret `1x0000000000000000000000000000000AA` locally. The code is **not** sent or logged (the log adapter masks the number and drops the text); see [Getting a sign-in code locally](#getting-a-sign-in-code-locally). |
| SMS, email, WhatsApp, push | Every channel uses the log adapter: messages are rendered and logged, nothing is sent |
| Payments | `POST /v1/orders` answers 503 until `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set (use test keys) |
| Sessions | `CUSTOMER_SESSION_SECRET` unset means a random key per boot, so restarting the API signs everyone out |
| Media URLs | Point at MinIO, since `CLOUDFRONT_BASE_URL` is unset |

Every variable is described in [Environments and config](../operations/environments.md).

### Getting a sign-in code locally

The OTP only ever leaves the server by SMS. Redis keeps an HMAC of it under `bh:otp:code:{<phone hash>}` (field `h`), keyed by `OTP_HMAC_SECRET`. The e2e smoke test (`tests/e2e/smoke.test.ts`, `recoverOtp`) gets the code back by hashing every 6-digit candidate with `createOtpCrypto(secret)` until one matches. Do the same in a local script, or set `MSG91_*` test credentials to receive a real SMS. There is no development bypass code.

### Everyday commands

| Command | Does |
| --- | --- |
| `npm run verify` | Everything CI checks: types, lint, import cycles, format, OpenAPI drift, tests with coverage |
| `npm test` / `npm run test:watch` | Unit and integration tests (integration needs the stack) |
| `npm run db:generate` | Generate a migration after changing a `*.table.ts` |
| `npm run openapi:generate` | Regenerate `openapi/openapi.json` after changing a route |
| `npm run db:down` | Stop the stack (`docker compose down -v` also wipes data) |

## Website

```bash
cd bachelor-house-client
npm ci
npm run dev -- -p 3001   # http://localhost:3001
```

The API already uses port 3000, so start the website on another port. Once the website calls the API, add its origin to the backend's `CORS_ORIGINS` (`http://localhost:3001`); the default there is `http://localhost:5173`. See [The website](../website/client.md).

## These docs

```bash
cd bachelor-house-docs
npm ci
npm start                 # http://localhost:3000/bachelor-house-docs/
npm run sync              # regenerate the reference from the two repos
```

See [Maintaining these docs](../operations/maintaining-docs.md).
