---
title: Environments and config
sidebar_position: 3
description: The four APP_ENV values and every environment variable the backend reads.
---

# Environments and config

All configuration is read once, at boot, by `src/config/env.ts` and validated with Zod. An invalid or missing value stops the process with a readable message. No other file reads `process.env` (hard limit C3). Runtime business rules are a separate thing: they're [settings](../reference/settings.md) in the database.

## APP_ENV

| `APP_ENV` | Used for | Secrets | Providers |
| --- | --- | --- | --- |
| `local` | Your machine, and the e2e image | `.env` | Log adapters; defaults point at the Docker stack |
| `test` | Vitest | Test defaults | Log adapters |
| `staging` | Deployed from `beta` (planned) | AWS Secrets Manager | Real, all required |
| `production` | Deployed from `main` (planned) | AWS Secrets Manager | Real, all required |

When `APP_ENV` is unset it follows `NODE_ENV`, so a production build is never treated as local by accident. In **staging and production**, the process first loads the JSON secret named by `APP_SECRETS_ID` and merges it over the environment (secret values win), then requires every variable marked *Deployed* below.

## Variables

### Core

| Variable | Default | Notes |
| --- | --- | --- |
| `NODE_ENV` | `development` | `development`, `test` or `production` |
| `PORT` | `3000` | |
| `LOG_LEVEL` | `info` | Pino level |
| `DATABASE_URL` | required | `postgres://…` |
| `DATABASE_POOL_MAX` | `10` | |
| `CORS_ORIGINS` | empty | Comma-separated exact origins (no path or trailing slash). Also the CSRF allow-list. |
| `COOKIE_DOMAIN` | host-only | Parent domain for session cookies, for example `.bachelorhouse.in` |
| `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX` | `60000`, `100` | The `/v1` rate limit per IP |
| `APP_ENV` | follows `NODE_ENV` | See above |
| `APP_SECRETS_ID` | | **Deployed.** Secrets Manager secret name |
| `AWS_REGION` | `ap-south-1` | |
| `REDIS_URL` | `redis://localhost:6379` | **Deployed** |
| `WEB_BASE_URL` | `http://localhost:3000` | Site origin used in emailed links |
| `PUBLIC_API_URL` | `http://localhost:3000` | API origin used in unsubscribe links (must be https when deployed) |

### Storage

| Variable | Default | Notes |
| --- | --- | --- |
| `S3_BUCKET_MEDIA`, `S3_BUCKET_KYC`, `S3_BUCKET_INVOICES` | `bh-media`, `bh-kyc`, `bh-invoices` | **Deployed** |
| `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | | MinIO only; leave unset on AWS |
| `CLOUDFRONT_BASE_URL` | | **Deployed.** Public media base URL |
| `KMS_KEY_ID_KYC` | | **Deployed.** SSE-KMS key for the KYC bucket |

### Sessions and security

| Variable | Default | Notes |
| --- | --- | --- |
| `OTP_HMAC_SECRET` | stand-in | **Deployed.** 32+ characters. HMAC of OTP codes, phone numbers and the Free ledger. Rotating it invalidates open codes. |
| `CUSTOMER_SESSION_SECRET` | random per boot | **Deployed.** 32+ characters |
| `CUSTOMER_SESSION_SECRET_PREVIOUS` | | The key before a rotation; verifies, never signs |
| `STAFF_SESSION_SECRET` | random per boot | **Deployed.** 32+ characters |
| `GOOGLE_CLIENT_ID` | | **Deployed.** Unset: staff sign-in fails closed |
| `STAFF_ALLOWED_EMAILS`, `STAFF_ALLOWED_DOMAIN` | | Who may sign in as staff (also needs a `staff_users` row) |
| `SUPER_ADMIN_EMAIL` | | The staff user the seed creates |
| `TURNSTILE_SECRET_KEY` | | Unset: captcha fails closed |
| `UNSUBSCRIBE_HMAC_SECRET` | stand-in | **Deployed.** Signs unsubscribe links |

### Providers

| Variable | Notes |
| --- | --- |
| `MSG91_AUTH_KEY`, `MSG91_OTP_TEMPLATE_ID`, `MSG91_WEBHOOK_TOKEN` | **Deployed.** SMS and the OTP DLT template; webhook token 16+ characters |
| `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_WEBHOOK_TOKEN` | **Deployed.** Email. `BREVO_SENDER_NAME` defaults to `BachelorHouse`. |
| `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN` | **Deployed.** `WHATSAPP_API_VERSION` defaults to `v21.0`. |
| `MSG91_WEBHOOK_IPS`, `BREVO_WEBHOOK_IPS` | Optional source IP allow-lists for webhooks |
| `FCM_PROJECT_ID`, `FCM_SERVICE_ACCOUNT_JSON` | Optional. Push stays off until both are set. |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Without both, `POST /v1/orders` answers 503. Not required at boot. |
| `SENTRY_DSN` | **Deployed.** `SENTRY_TRACES_SAMPLE_RATE` defaults to 0 (errors only). |

Razorpay keys are the one payment credential not checked at boot, so a deployed environment can start without payments.
