---
title: Testing
sidebar_position: 1
description: Unit, integration and end-to-end tests, and the coverage gate.
---

# Testing

The backend uses **Vitest 5** with **Supertest**. There are three kinds of test:

| Kind | Files | Runs against | Command |
| --- | --- | --- | --- |
| **Unit** | `src/**/__tests__/*.test.ts` | Nothing: fakes and pure functions, in parallel | `npm test` |
| **Integration** | `src/**/*.int.test.ts`, `tests/integration/**` | A real Postgres (`app_test`), Redis and MinIO, one file at a time | `npm test` |
| **End-to-end smoke** | `tests/e2e/smoke.test.ts` | The built Docker image, booted with migrate, seed, server and worker | `bash tests/e2e/stack.sh up && npm run test:e2e` |

`npm test` runs both unit and integration projects, so it needs `npm run stack:up` first. Integration tests use `TEST_DATABASE_URL` (default `postgres://app:app@localhost:5433/app_test`); `tests/helpers/global-setup.ts` migrates it, and helpers provide factories, typed HTTP calls and a staff session.

## Coverage gate

`npm run test:coverage` fails below **80% lines, statements and functions, and 75% branches**. Entry points, migrations, `index.ts` files and type files are excluded. The thresholds only go up (hard limit G3), and a failing test may not be skipped to get green (G4).

## End-to-end smoke

`docker-compose.e2e.yml` layers the app image on the local stack with `APP_ENV=local`, so it runs `NODE_ENV=production` code without needing AWS secrets. The smoke suite calls the running container over HTTP and checks **every response against the OpenAPI contract**: the documented status and schema. It signs in by recovering the OTP from its keyed hash in Redis, since the code never leaves the server except by SMS.

## Before a PR

`npm run verify` runs what CI runs: typecheck, lint (zero warnings), import cycles, format check, OpenAPI drift and tests with coverage. Hard limit G6 requires it to pass locally.

## The website

The client has no tests yet. Its only check is `npm run lint` (ESLint with the Next.js config).
