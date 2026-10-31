---
title: CI/CD
sidebar_position: 2
description: The checks every pull request runs, and the state of deployment.
---

# CI/CD

## Backend CI

`.github/workflows/ci.yml` runs on every pull request and on pushes to `main`, `beta` and `chore/scaffold-from-reference`. A newer push cancels the running one.

| Job | Checks |
| --- | --- |
| `quality` | Typecheck, lint, import cycles, format, **OpenAPI contract in sync** (`openapi:check`), **migrations in sync** (regenerates migrations and fails if the schema changed without one) |
| `commitlint` | Every commit in a PR follows Conventional Commits |
| `test` | Unit and integration tests with coverage, against Postgres + PostGIS, Redis and MinIO service containers. Coverage is uploaded as an artifact for 7 days. |
| `security` | `npm audit --audit-level=high` on production dependencies; **gitleaks** secret scan over the full history |
| `build` | `npm run build` and `docker build` (after `quality` and `test`) |
| `e2e-smoke` | Boots the image (migrate + seed, server, worker) and runs the contract-checked smoke tests |

`codeql.yml` runs GitHub CodeQL analysis, Dependabot opens dependency updates, and `CODEOWNERS` sets the required reviewers. Locally, Husky runs lint-staged on commit and commitlint on the message.

## Branches

The design decides `beta` → staging and `main` → production ([ADR 0018](../decisions.md#0018)). Changes go through pull requests with one approval and green CI; nobody pushes to `main` directly.

## Deployment

:::caution[No deploy pipeline]
There is no CD workflow or infrastructure code in the repo. The image is built in CI but not pushed anywhere, and there's no staging or production environment yet.
:::

What's ready for when there is:

- **One image, two commands:** `node dist/server.js` (the image's default, with a health check on `/health/live`) and `node dist/worker.js`. The image runs as a non-root user and includes ffmpeg.
- **Migrations and seeds** in production: `npm run db:migrate:prod` and `npm run db:seed:prod`. Seeds never overwrite values staff changed.
- **Config:** `APP_ENV=staging` or `production` loads one JSON secret from AWS Secrets Manager (`APP_SECRETS_ID`) and refuses to start if any required value is missing ([Environments and config](./environments.md)).
- **Shutdown:** both processes stop cleanly on `SIGTERM` (10 seconds for the API, 30 for the worker), which suits rolling deploys.

## The website and these docs

`bachelor-house-client` has no CI workflow. These docs deploy to GitHub Pages from `main` through `.github/workflows/deploy.yml` ([Maintaining these docs](./maintaining-docs.md)).
