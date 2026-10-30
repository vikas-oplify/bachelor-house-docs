---
title: Known limitations
sidebar_position: 9
description: What isn't built yet, what doesn't match, and behaviour that looks like a bug. Check here before logging an issue.
---

# Known limitations

What's missing, what doesn't match between the website and the backend, and what looks like a bug. Check here before logging an issue. Checked on 30 Oct 2026 against backend `chore/scaffold-from-reference` (`c4bcee6`) and website `main` (`f86531b`).

## Blocks the marketplace

| Gap | Effect today |
| --- | --- |
| **No listing search or listing detail API** | Tenants can't find anything. The website's listing pages show sample data. |
| **No enquiries** | Tenants can't contact a lister, and free credits and packages can't be spent. See [Contacting a lister](./tenants/contacting-a-lister.mdx). |
| **Bought plans don't reach listing submit** | The submit check for "a paid plan on this listing" always answers no. Only an owner's [Free listing](./listing/free-listing.mdx) can go live. A second listing, or a reactivation after the Free 30 days, gets `PLAN_REQUIRED` even after paying. |
| **No agent profile or approval** | Every agent submit fails with `AGENT_NOT_APPROVED`. |
| **Website not connected** | No screen calls the backend. Every form, button and list is UI only. |
| **No admin website** | Staff work only through the admin API. |

## Backend: queued or scheduled, but nothing runs it

These jobs are defined, and in some cases work is already queued for them, but no worker handles them yet:

| Job | What's missing |
| --- | --- |
| GST invoices (Zoho) | Fulfilled orders are queued for an invoice; none is issued |
| Refunds | Rejecting a listing with a paid order queues a full refund; none is paid out. Refunds are manual. |
| Razorpay webhook and reconcile | Payment only fulfils through the website's verify call. If the browser closes after paying, nothing picks it up. |
| Subscription lifecycle, reminders, slot recount | Plans don't start, end or remind on a schedule |
| Rank boosts, matching, homepage rotation, fairness | Not built |
| Analytics roll-ups and benchmarks | Not built |
| Report auto-pause, chat unread email, enquiry harvest | Not built |

## Backend: not built

- Editing a **live** listing. Only drafts can be edited; the 20% price-change re-review is unused.
- Listing **reports** (fake, already rented, wrong price, broker posing as owner).
- **Reviews**, **chat**, **wishlist**, **site visits**.
- Photo **shoots** for Elite Spotlight.
- **Owner dashboard** data: enquiries, leads, analytics.
- **Top-up** contact packs.
- Coupon audience **groups** (a group matches nobody).

## Settings that don't do anything yet

Some [settings](./platform/configurable-rules.mdx) look live but the code uses a fixed value. Changing them has no effect:

| Setting | Code uses |
| --- | --- |
| `coupon.max_discount_bp` | 40% |
| `listing.expiry_reminder_days` | 3 days |
| `listing.unit_anchor_lookback_days` | 180 days |
| `pg.availability_confirm_days` | 7 days |

`moderation.pg_trusted_after_days` and `moderation.review_target_hours` aren't used: every PG is reviewed and there is no review timer.

## Looks like a bug

| Behaviour | Detail |
| --- | --- |
| **Deleting a listing in review keeps the Free listing reserved** | Withdrawing a listing releases its Free reservation, but deleting does not. An owner who deletes their only listing while it's in review can't use their Free listing on another property (`PLAN_REQUIRED`). Raise with the backend team. |

## Website

| Mismatch | Detail |
| --- | --- |
| **Owner plan prices** | The website shows ₹499 / ₹799 / ₹1,299. The catalogue charges ₹1,499 / ₹2,499 / ₹3,999. |
| **Agent plan prices** | The website shows ₹3,999 / ₹4,999 / ₹6,999. The catalogue charges ₹7,999 / ₹10,999 / ₹17,999. |
| PG plan prices | Match (₹1,499 / ₹2,899 / ₹5,799) |
| No tenant packages page | BH Connect, BH Plus and BH Max aren't shown anywhere |
| `/for-tenant` shows PG plans | The route is misnamed: it renders "Why to list PG on BachelorHouse?" |
| `/rental-guide` is the "Post a property" marketing page | Misnamed route |
| No checkout, owner dashboard, account settings or notification screens | |
| Dead links | `/blog/*` and `/careers/*` article pages 404 (no Figma frames) |
| Signup asks for a city | The backend's profile has no city field |

## Intended behaviour (not bugs)

- A Free listing is **always** reviewed, even for a trusted owner.
- Pausing doesn't stop the clock. A paused listing still expires on its date.
- Deleting an account and signing up again **doesn't** give new free credits or a new Free listing.
- Buying a new tenant package replaces the old one, and unused contacts lapse.
- The public map pin is moved 50 to 300 m on purpose.
- Sign-in codes and payment messages can't be switched off.
