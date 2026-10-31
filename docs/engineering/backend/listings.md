---
title: Listings
sidebar_position: 3
description: How listings are stored, how the wizard saves drafts, and what submit does.
---

# Listings

The `listings` module owns posting, submit, the lifecycle and PG room alerts. `moderation` owns the review queue, `media` the photos and `ranking` the quality score. What users see is in the Product guide: [Posting a flat](/product/listing/posting-a-flat), [Listing lifecycle](/product/listing/listing-lifecycle).

## Storage

**Class-table inheritance** ([ADR 0006](../decisions.md#0006)):

| Table | Holds |
| --- | --- |
| `listings` | Everything a listing has: lister, vertical, status, title, place, rent range, BHK, gender, badges, dates, the draft JSON, public code and slug |
| `residential_details` | One row per flat: furnishing, floor, area, deposit… |
| `pg_details` | One row per PG: food, rules, timings… |
| `pg_room_types` | Many per PG: sharing type, rent, beds, availability |
| `listing_amenities`, `pg_room_type_amenities` | Amenities with quantities |
| `listing_media` | Photos and video attached to the listing (→ `media_assets`) |
| `property_units` | The physical unit, shared by every listing of it |
| `listing_status_history`, `listing_revisions`, `listing_activations` | Audit trail of states, edits and live periods |
| `availability_alerts` | PG "notify me" alerts |

Search fields (min and max rent, BHK, gender, sharing types) are kept on `listings` and updated in the same transaction as the detail rows, so search will need only one table. A database CHECK makes title, city, locality and rent mandatory whenever the status isn't `draft`. Full columns: [data model › Listings](../reference/data-model/listings.md).

**Public codes** come from sequences `seq_code_residential` (`BHR10001`…), `seq_code_pg` (`BHP10001`…) and `seq_code_agent` (`BHA101`…). Public URLs will be `<slug>-<code>`; a stale slug redirects ([ADR 0017](../decisions.md#0017)).

## Drafts

1. `POST /v1/me/listings` creates a `draft` row with an empty `draft` JSON, so photos can attach to its id straight away.
2. `PUT /v1/me/listings/{id}/draft/steps/{step}` validates one wizard step with its own strict schema (`listings.steps.ts`, `listings.pg-steps.ts`) and stores it in the draft JSON, bumping `draft_version`. The client sends the version it last saw in `If-Match`; an older one gets `409`, which protects against two open tabs.
3. `GET /v1/me/listings/{id}` returns the draft with step completion.

Only drafts are editable. Editing a live listing (typed `PATCH` sections) isn't built.

## Submit

`POST /v1/me/listings/{id}/submit` (`listings.submit.ts`) runs in one transaction:

| Step | What happens | Fails with |
| --- | --- | --- |
| 1–2 | Every wizard step is validated again, plus the text check. Photos are judged from `listing_media`, not the saved step. | `LISTING_INCOMPLETE`, `VALIDATION_FAILED` |
| 3 | The listing row is locked and re-read, so nothing changed since the checks | |
| 4 | **Unit:** `property_units` is matched by unit key (society, tower, unit number) or created, using photo hashes too | |
| 5 | **Publish rights**, under locks (below) | `PLAN_REQUIRED`, `AGENT_NOT_APPROVED`, `CONSENT_REQUIRED`, `SLOT_LIMIT_EXCEEDED` |
| 6 | **Automatic checks** (`listings.checks.ts`): banned words in free text, photos repeating each other or another account's photos (perceptual hash distance) | |
| 7 | **Routing:** typed detail rows are written and the slug set. The review reason is `pg` for every PG, `first_listing` for every owner listing, `agent_first_five` until an agent has `moderation.agent_reviewed_listings` (5) approved listings, then `possible_duplicate` or `auto_flag`. With a reason the listing goes to `pending_review`; without one (a trusted agent, no flags) straight to `active`. A PG whose KYC isn't approved also returns the blocker `kyc_pending`. | |

After commit, the quality score job is queued.

### Publish rights \{#publish-rights\}

Step 5 asks the `PublishRights` port (`listings.rights.ts`):

- **Owner or PG:** `assignedPlan()` returns the active paid plan on this listing. If there is none, the Free entitlement is **reserved** in `free_allowance_ledger` (keyed by the phone HMAC). Approval consumes it; reject or withdraw releases it.
- **Agent:** `approvedAgent()` must find an approved profile, the authority declaration must be accepted, and `coverAgentListing()` takes a slot under the city subscription's row lock.

:::caution[Not wired]
`createApp()` is called without `publishRights`, so both the listings and moderation modules use `noPublishRights`. It returns no paid plan and throws `AGENT_NOT_APPROVED` for every agent. Paid plans are bought and fulfilled (orders create `subscriptions` and `entitlements` rows) but never reach submit. Wiring it needs the subscriptions lookup and agent profiles. See [Known limitations](/product/known-limitations).
:::

:::caution[Likely bug: Free reservation on delete]
Withdraw and reject release the reserved Free entitlement, but `DELETE /v1/me/listings/{id}` on a listing in review only soft-deletes it; the lifecycle's `remove()` doesn't call the ledger. The reservation stays, so the owner can't use their Free listing on another property.
:::

## Lifecycle

`listings.lifecycle.ts` moves listings between states: withdraw, pause, mark rented, archive, reactivate, delete and confirm availability. Each change writes `listing_status_history` with a reason code. Reactivation needs cover again, through the same publish rights.

Expiry is enforced twice ([ADR 0014](../decisions.md#0014)):

- At read time, every query that shows a listing checks `expires_at > now()`.
- `listings.expire` runs every minute and moves past-end listings to `expired`, giving an agent's slot back. `listings.expiry-reminders` runs hourly.

## Quality score

`search.quality-score` (in `ranking`) recomputes a listing's score after submit and nightly at 03:00 IST, from weights in `ranking_config_versions`. Featured badges apply only at 60 or more. See [Quality score](/product/listing/quality-score).
