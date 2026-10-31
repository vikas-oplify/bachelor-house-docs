---
title: Codebase conventions
sidebar_position: 3
description: Module layout, layers, and the steps to add an endpoint or a table.
---

# Codebase conventions

The backend follows the standards in its own repo: `docs/standards/ARCHITECTURE.md`, `CODING_STANDARDS.md`, `HARD_LIMITS.md` and `CI_CD.md`. `AGENTS.md` and `CLAUDE.md` guide AI coding agents, and `docs/personas/` defines the architect, engineer, QA and reviewer roles. This page is the short version.

## A module

```text
src/modules/listings/
├── index.ts                  public API: the only file other modules import
├── listings.table.ts         Drizzle tables (source of truth for migrations)
├── listings.schemas.ts       Zod request schemas, inferred types, response DTOs
├── listings.contract.ts      route declarations (defineRoute): path, auth, schemas, errors
├── listings.routes.ts        mounts the declared routes on a router
├── listings.controller.ts    HTTP ↔ service, nothing else
├── listings.service.ts       business rules and transactions, no Express
├── listings.repository.ts    queries only
└── __tests__/                *.test.ts (unit) and *.int.test.ts (real Postgres)
```

Bigger modules split by concern (`listings.submit.ts`, `listings.lifecycle.ts`, `listings.expiry.ts`), with the same layering.

## Layers

`route → middleware (validate, auth) → controller → service → repository → database`

| Layer | Does | Must not |
| --- | --- | --- |
| Route / contract | Path, verb, auth level, schemas, error codes | Contain logic |
| Controller | Read validated input, call the service, shape the response | Hold business rules, call repositories |
| Service | Rules, orchestration, transactions; throws `DomainError` | Import Express or touch `req`/`res` |
| Repository | Queries and row mapping | Hold rules or throw HTTP errors |

Modules talk only through each other's `index.ts`; `npm run lint:cycles` fails on circular imports. When a module needs something another module doesn't have yet, it declares a **port** (an interface) with a safe default. `PublishRights` in `listings.rights.ts` is the main example: its default, `noPublishRights`, says no paid plan or agent cover exists ([Listings](../backend/listings.md#publish-rights)).

## Adding an endpoint

1. Declare it in the module's `*.contract.ts` with `defineRoute({ operationId, method, path, summary, tags, auth, request, success, errors, idempotent })`. `auth` is `public`, `user` or `staff`.
2. Build the handler with `route.handle(async ({ body, query, params }, req, res) => …)`. `handle` wraps the declared Zod schemas, so the handler only sees validated input.
3. Mount it with `route.mount(router, handler)`. `mount` refuses a handler that didn't come from that route's `handle`, and refuses an `idempotent` route without the idempotency guard.
4. Add the route list to `API_ROUTES` in `src/contract.ts` if the module is new.
5. Run `npm run openapi:generate` and commit `openapi/openapi.json` in the same PR. CI runs `openapi:check`.
6. Staff routes also need `requirePermission('<permission>')`. Permissions and the roles that hold them are in `src/modules/staff/staff.permissions.ts`.

## Adding a table

1. Define it in the module's `*.table.ts` and re-export it from `src/db/schema.ts`.
2. Run `npm run db:generate`. Commit the SQL migration and the snapshot under `src/db/migrations/`.
3. Never edit a merged migration; write a new one. CI regenerates migrations and fails if the schema changed without one.

Enums live in `src/db/enums.ts`. Money and time columns follow [Concurrency and time](../backend/concurrency-and-time.md#money-and-time).

## Hard limits (selection)

- No `any`, no `console.*` in `src/`, no `process.env` outside `src/config/env.ts`, no floating promises.
- No `eslint-disable`, `@ts-ignore` or `as any`. A single `eslint-disable-next-line` needs a reason and an issue link.
- All input, including webhooks, is validated with Zod. No string-built SQL.
- Never log secrets, tokens or raw auth headers. Phone numbers and emails are masked by `src/lib/pii.ts`.
- New dependencies need approval. Conventional Commits are enforced by commitlint. No direct pushes to `main`.
- `npm run verify` passes before a PR.
