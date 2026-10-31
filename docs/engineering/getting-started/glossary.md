---
title: Glossary
sidebar_position: 4
description: Terms used in the code and design documents.
---

# Glossary

| Term | Meaning |
| --- | --- |
| **Vertical** | The kind of listing: `residential` (flat) or `pg`. Stored on `listings.vertical`. |
| **Lister** | Whoever posts a listing: an owner, a PG operator or an agent. Tenants never list. |
| **Draft JSON** | `listings.draft`: wizard progress saved step by step, with `draft_version` for optimistic locking. Typed detail rows are written only at submit. |
| **Class-table inheritance** | One `listings` table for shared fields; `residential_details`, `pg_details` and `pg_room_types` for the vertical's own fields ([ADR 0006](../decisions.md#0006)). |
| **Public code** | The short id shown to people: `BHR…` (flat), `BHP…` (PG), `BHA…` (agent), from Postgres sequences. Internal UUIDs are never shown ([ADR 0017](../decisions.md#0017)). |
| **Property unit** | `property_units`: one physical flat or PG, shared by every listing of it, so a relisted unit keeps its history. |
| **Free ledger** | `free_allowance_ledger`, keyed by an HMAC of the phone number: tenant free contact credits and the owner or PG Free listing. Survives account deletion ([ADR 0007](../decisions.md#0007)). |
| **Entitlement** | A countable quota (`entitlements` + `entitlement_usages`): Free reveals, matching credits, boosts, shoots, staff grants. `used + reserved ≤ granted` is a CHECK. |
| **Plan version** | `plan_versions`: the price and benefits of a plan from a date. Published versions never change; a change is a new version. |
| **Plan snapshot** | `orders.plan_snapshot`: what was bought, frozen at purchase. |
| **Publish rights** | The port listing submit uses to ask "does this listing have a paid plan or agent cover?". Not wired yet. |
| **Contact gate** | The planned single path by which a lister's phone number reaches a tenant: `POST /v1/enquiries` ([ADR 0008](../decisions.md#0008)). Not built. |
| **Outbox** | Notification rows written in the same transaction as the business change, delivered later by a job ([ADR 0021](../decisions.md#0021)). |
| **Sweeper** | A scheduled job that re-queues rows stuck in an intermediate state (media in `processing`, notifications not picked up). |
| **Idempotency key** | `Idempotency-Key` header on payment and other side-effect routes; the first 2xx answer is replayed for 24 hours. |
| **Paise** | 1/100 rupee. Prices, tax and payments are `bigint` paise; rents and deposits are whole rupees ([ADR 0016](../decisions.md#0016)). |
| **IST business date** | A date computed in Asia/Kolkata (+05:30, no DST), stored as Postgres `date`. Timestamps are UTC `timestamptz`. |
| **Realm** | `customer` or `staff`: the two session types, with separate cookies and signing keys. |
| **Family** | A chain of rotated refresh tokens from one sign-in. Reusing an old token revokes the whole family. |
| **APP_ENV** | `local`, `test`, `staging` or `production`. Staging and production read secrets from AWS Secrets Manager and need every provider credential. |
| **BR-…, EC-…, T-…, Q-…** | Ids from the design pack: business rules, edge cases, build tasks and open questions. Code comments cite them. |
| **Doc 02 / 03 / 04 / 09** | Design pack chapters cited in code: architecture (02), data model (03), API (04), search and ranking (09). They aren't in the repo. |
