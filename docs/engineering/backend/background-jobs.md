---
title: Background jobs
sidebar_position: 5
description: How the worker runs queues and schedules, and the rules every job follows.
---

# Background jobs

The worker (`src/worker.ts`) runs **BullMQ** on Redis. Every job's name, queue and schedule is declared in one catalogue, `src/lib/queue/jobs.ts`; the business logic lives in the owning module. The full, current list is in the [jobs reference](../reference/jobs.md).

## Queues

| Queue | Concurrency | For |
| --- | --- | --- |
| `notifications` | 5 | Delivery attempts, reminders |
| `media` | 5 | Image processing, sweeper, orphan cleanup |
| `media-video` | 1 | Video transcoding (heavy, so alone) |
| `listings` | 5 | Expiry, quality score |
| `billing` | 5 | Orders, subscriptions, entitlements, invoices |
| `ranking` | 5 | Analytics, rotation, matching |
| `maintenance` | 2 | Retention, partitions, KYC purge, privacy, CMS publishing |

Default job options: **5 attempts** with exponential backoff from 5 seconds; completed jobs kept 1 hour (up to 1,000), failed jobs 14 days. Only jobs out of retries are reported to Sentry.

## How a job is wired

1. Declare it in `JOBS` in `jobs.ts` with its queue and, if repeatable, its `schedules` (cron, in UTC unless `tz: IST`). Daily jobs without a time run at **02:15 IST**.
2. Write the handler in the module and export a factory from its `index.ts`.
3. Add it to `handlers` in `src/worker.ts`.

On start, the worker upserts a BullMQ scheduler for **each scheduled job that has a handler**. Scheduler ids are stable (`name` or `name#key`), so restarts and several workers never duplicate a schedule. A job **without a handler never runs**; anything enqueued for it waits in Redis. Today 18 of 38 catalogue jobs have no handler, including every Razorpay, Zoho, refund, subscription, boost, matching and analytics job.

API code enqueues through lazy enqueuers (`createLazyEnqueue(REDIS_URL)` and similar), which connect to Redis on first use, so a request that never enqueues never opens a connection.

## Rules every job follows

From [ADR 0004](../decisions.md#0004) and [0014](../decisions.md#0014):

- **The row is the truth.** A job loads its row, checks the state and returns if the work is done. Running a job twice is safe.
- **Enqueue after commit.** The business change commits first; the enqueue follows. If the enqueue is lost, a **sweeper** finds the row and re-queues it (`notifications.dispatch` every minute, `media.sweeper` every 5 minutes for media stuck in `processing`).
- **Idempotent enqueue.** Pass a `jobId` to make the add itself idempotent (BullMQ ignores an id that still exists).
- **Jobs tidy, reads decide.** Benefits and visibility are checked against `now()` at read time. `listings.expire` and `entitlements.expire` only tidy statuses afterwards, so a late job can never extend a benefit.
- **Single runner where it matters.** `src/lib/queue/exclusive.ts` runs a function only if no other process holds a Postgres advisory lock of that name, so housekeeping jobs never delete the same rows twice. `run-once.ts` reloads the row inside the job and does the work only if it's still needed.

## Shutdown

On `SIGTERM` the worker stops taking jobs, lets running ones finish, closes Redis and the database pool and flushes Sentry, within 30 seconds; after that it force-exits. The API does the same within 10 seconds.
