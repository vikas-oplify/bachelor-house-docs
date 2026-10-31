---
title: Design decisions
sidebar_position: 3
description: A summary of each of the backend's 22 architecture decision records, and how much of each is built.
---

# Design decisions

The backend records decisions that are hard to reverse in `docs/adr/` ([full text on GitHub](https://github.com/oplifyterminal/bachelor-house-backend/tree/chore/scaffold-from-reference/docs/adr)). Each summary below adds **In code today**, checked against `chore/scaffold-from-reference`.

Only 0001–0003 are *Accepted*; 0003 still awaits a technical review. The rest are *Proposed* and are being built as written. 0019–0022 were renumbered because the design pack reused numbers.

| ADR | Decision | In code today |
| --- | --- | --- |
| [0001](#0001) | Baseline stack: Node 24, TypeScript, Express 5, Zod, Pino, Vitest | <Status s="built" /> |
| [0002](#0002) | PostgreSQL and Drizzle | <Status s="built" /> |
| [0003](#0003) | Express + Drizzle + Zod instead of NestJS + Prisma; REST only | <Status s="built" /> |
| [0004](#0004) | Modular monolith, api + worker | <Status s="built" /> |
| [0005](#0005) | OpenAPI generated from Zod | <Status s="built" /> |
| [0006](#0006) | Class-table inheritance, draft JSON | <Status s="built" /> |
| [0007](#0007) | Free ledger, plan versions, entitlements | <Status s="partial" /> |
| [0008](#0008) | Contact gate through the enquiry API | <Status s="none" /> |
| [0009](#0009) | Postgres search before a search engine | <Status s="none" /> |
| [0010](#0010) | Razorpay one-time orders, no auto-renew | <Status s="partial" /> |
| [0011](#0011) | GST in the backend, Zoho numbers invoices | <Status s="partial" /> |
| [0012](#0012) | Search sessions in Redis, signed cursor | <Status s="none" /> |
| [0013](#0013) | Versioned ranking configuration | <Status s="partial" /> |
| [0014](#0014) | Benefits checked at read time | <Status s="built" /> |
| [0015](#0015) | Fixed lock order | <Status s="built" /> |
| [0016](#0016) | Money and time conventions | <Status s="built" /> |
| [0017](#0017) | Public codes and slug URLs | <Status s="partial" /> |
| [0018](#0018) | Hosting on ECS Fargate in ap-south-1 | <Status s="none" /> |
| [0019](#0019) | Cookie sessions, rotating refresh, OTP-only | <Status s="built" /> |
| [0020](#0020) | Direct-to-S3 uploads, worker media pipeline | <Status s="built" /> |
| [0021](#0021) | Notification outbox, template registry | <Status s="built" /> |
| [0022](#0022) | KYC storage, access logging, retention | <Status s="built" /> |

## 0001 · Baseline stack \{#0001\}

Node.js 24 LTS, strict TypeScript (ESM), Express 5, Zod 4, Pino, Vitest 5 + Supertest with coverage thresholds, ESLint + Prettier, Husky + lint-staged + commitlint, GitHub Actions, and a modular monolith. Rejected: plain JavaScript, NestJS, Fastify, Jest, microservices.

**In code today:** as decided. ESM needs `.js` import suffixes.

## 0002 · PostgreSQL and Drizzle \{#0002\}

PostgreSQL 17 with Drizzle ORM and node-postgres. drizzle-kit generates reviewed SQL migrations from `*.table.ts`; migrations are never edited after merge. Integration tests run on a real Postgres. Rejected: Prisma (separate schema language), Kysely, TypeORM, raw `pg`.

**In code today:** as decided. CI fails when a table changes without a migration.

## 0003 · Express, Drizzle, Zod; REST only \{#0003\}

The original tech-stack document proposed NestJS, Prisma and some GraphQL. The team chose Express 5 + Drizzle + Zod, because Drizzle handles PostGIS, GiST, exclusion constraints, partial indexes and row locks directly, and one Zod schema both validates and generates OpenAPI. REST only. Redis + BullMQ, S3 + CloudFront + Sharp + ffmpeg, and AWS stay. New libraries (ioredis, bullmq, AWS SDK, jose, Sentry) were approved on 20 Oct 2026; sharp, Razorpay and the invoice renderer were pending at the time.

**In code today:** as decided. `sharp` is now a dependency; Razorpay is called over plain HTTPS.

## 0004 · Modular monolith, api + worker \{#0004\}

One codebase by feature module, one image, two commands. The worker registers schedules idempotently at start. The row is the truth and a job only a trigger; sweepers re-queue stuck rows. Video gets its own queue. Split along modules (search, notifications, billing first) at around 1M monthly users.

**In code today:** as decided. See [Background jobs](./backend/background-jobs.md).

## 0005 · OpenAPI from Zod \{#0005\}

REST under `/v1`. Every body, query and path parameter has a Zod schema, and the same schemas generate the OpenAPI 3.1 document. Unknown fields are rejected; bodies are limited to 100 KB.

**In code today:** as decided. CI runs `openapi:check`.

## 0006 · Listings: class-table inheritance and draft JSON \{#0006\}

Shared fields in `listings`; vertical fields in `residential_details`, `pg_details`, `pg_room_types`. Search fields are denormalised onto `listings` in the same transaction. The wizard saves to a `draft` JSON with `draft_version` (409 on a stale save); submit writes the typed rows. A CHECK makes title, city, locality and rent mandatory outside `draft`.

**In code today:** built. Typed `PATCH` edits after publication aren't. See [Listings](./backend/listings.md).

## 0007 · Free ledger, plan versions, entitlements \{#0007\}

Three stores: the phone-keyed `free_allowance_ledger` (survives deletion), immutable typed `plan_versions`, and countable `entitlements` + `entitlement_usages` with `used + reserved ≤ granted`. Spend under `FOR UPDATE` in the fixed lock order. Agent slots change with the listing state under the subscription lock. A nightly recount alerts on drift.

**In code today:** all three stores are built and used by checkout and fulfilment. Listing submit doesn't read subscriptions yet (`noPublishRights`), and the slot recount has no handler.

## 0008 · Contact gate \{#0008\}

Phone numbers reach a tenant only through `POST /v1/enquiries`, in one transaction that checks the listing is live, spends a credit and records the enquiry. A Free listing's enquiries start locked until the owner reveals up to 2. The lister's view of the tenant is computed on every request. Chat is a child of the enquiry.

**In code today:** not built: no enquiries, contact reveal or chat.

## 0009 · Postgres search first \{#0009\}

Retrieval in Postgres (B-tree and GIN filters, weighted `tsvector` + `pg_trgm`, PostGIS `ST_DWithin`), up to 1,000 candidates; ranking in Node. Move to Meilisearch only when p95 passes 300 ms or database CPU stays above 60%.

**In code today:** not built. The extensions (`pg_trgm`, `unaccent`, PostGIS) are installed by migration `0001`.

## 0010 · Razorpay one-time orders \{#0010\}

`POST /v1/orders` prices server-side under a checkout lock and creates the Razorpay order; the browser never sends an amount. Verify and webhook both call one idempotent `fulfilOrder`. Reconciliation every 15 minutes; unpaid orders expire after 30. Renewal is a new order; reminders 7, 3 and 1 day before expiry.

**In code today:** orders, verify, fulfilment and expiry are built. The webhook route, reconciliation and reminders aren't. See [Money and billing](./backend/money-and-billing.md).

## 0011 · GST and Zoho \{#0011\}

The backend computes base, discount, taxable, CGST/SGST/IGST and total in paise, with CHECKs on the identities. `splitGst` rounds once, half up; CGST takes the odd paisa. Zoho Books issues invoice and credit-note numbers; the sync retries for 24 hours and never blocks fulfilment.

**In code today:** the GST computation is built. The Zoho sync is queued but has no handler or client. The rounding rule still needs finance's confirmation.

## 0012 · Search sessions in Redis \{#0012\}

Search scores in Node, fills paid and organic queues under per-batch caps, collapses one card per unit, and stores the order in Redis (`ss:{sessionId}`, 30 minutes idle, 4 hours max) behind an HMAC-signed cursor. Served batches are logged for exposure and fairness. A degraded mode serves organic only, or stateless cursors if Redis is down.

**In code today:** not built.

## 0013 · Versioned ranking configuration \{#0013\}

Ranking weights and caps live in `ranking_config_versions`, changed only by a super admin, never edited once used, and the version is stored on every served batch.

**In code today:** the table exists and the quality score reads its configuration from it. Search ranking, which would use the rest, isn't built.

## 0014 · Benefits at read time \{#0014\}

Validity windows are `[starts_at, ends_at)` in UTC. Every query that grants a benefit checks the end against `now()`; jobs only tidy statuses.

**In code today:** as decided for listings, entitlements and orders.

## 0015 · Fixed lock order \{#0015\}

(tenant advisory lock) → order → listing → subscription → free ledger → entitlement.

**In code today:** followed by checkout, fulfilment and submit. See [Concurrency and time](./backend/concurrency-and-time.md).

## 0016 · Money and time \{#0016\}

Rents in whole rupees (`integer`); prices and payments in paise (`bigint`); branded `Rupees` and `Paise` types. UTC timestamps, IST business dates, validity in exact hours.

**In code today:** as decided.

## 0017 · Public codes and slugs \{#0017\}

`BHR`, `BHP`, `BHA` codes from sequences; URLs as `<slug>-<code>` with a 301 for a stale slug; UUIDs never shown. Codes are guessable, so access never depends on them.

**In code today:** the sequences, codes and slugs are built. The public listing routes that would redirect aren't.

## 0018 · Hosting on ECS Fargate \{#0018\}

AWS `ap-south-1`: Fargate for api (2 × 0.5 vCPU, autoscale to 6) and worker (1 × 1 vCPU); RDS Postgres 17 + PostGIS Multi-AZ; ElastiCache; S3 + CloudFront; ALB + WAF; Secrets Manager and KMS; CloudWatch and Sentry. Staging (`beta`) single-AZ; production from `main`. Estimated USD 350–550 a month for production.

**In code today:** the config side is built (Secrets Manager loading, `APP_ENV`, S3/KMS/CloudFront variables, Sentry). There's no infrastructure code or deploy workflow. See [CI/CD](./operations/ci-cd.md).

## 0019 · Sessions and OTP-only sign-in \{#0019\}

15-minute HS256 access token with a `kid` and one previous key accepted; 30-day rotating refresh token with reuse detection, stored hashed; HttpOnly cookies on the parent domain. Customers sign in by OTP only; staff by Google on an allowlist. CSRF needs a custom header and an allowed Origin. Turnstile and Redis rate limits on OTP.

**In code today:** as decided. See [Auth and sessions](./backend/auth-and-sessions.md).

## 0020 · Uploads and media pipeline \{#0020\}

Signed S3 POST forms (10 minutes, typed and sized), direct upload, then `complete`. The worker checks the signature, strips metadata, writes WebP and AVIF at 320/800/1600 px, a perceptual hash and a blur placeholder; video to MP4 H.264 ≤ 1080p with a poster. No SVG. `uploads/` expires after 24 hours.

**In code today:** as decided. See [Media and KYC](./backend/media-and-kyc.md).

## 0021 · Notification outbox \{#0021\}

Insert a notification row in the business transaction; a job delivers it. Templates per channel and locale with provider template ids. Configurable channel order with fallback; delivery rows updated by webhooks; preferences and suppression checked at send time.

**In code today:** built. The fallback order is a constant (WhatsApp → SMS), not yet a setting. See [Notifications](./backend/notifications.md).

## 0022 · KYC storage and retention \{#0022\}

A separate private, KMS-encrypted bucket; 60-second staff view links, each view audited; only type, last 4 characters and decision kept; files deleted 180 days after the decision; KYC belongs to the operator.

**In code today:** as decided. Retention still needs legal review.
