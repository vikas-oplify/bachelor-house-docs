---
title: The website
sidebar_position: 1
description: How the Next.js website is built, and what connecting it to the API involves.
---

# The website

`bachelor-house-client` is a **Next.js 16** App Router app with **React 19**, **Tailwind CSS 4**, `react-hook-form`, `lucide-react` icons and the **Figtree** font. Its screens follow the Figma file "Bachelor House New"; `SCREENS.md` in the repo maps each route to its frame. Every route is listed in the [website routes reference](../reference/client-routes.md).

:::caution[Not connected]
No file in the client calls the backend. Every page renders static or sample data, and forms (sign-in, posting wizards, contact) keep their state in the browser only. The [Product guide](/product/build-status) marks these as *Screen only*.
:::

## Layout

```text
app/
├── layout.tsx              root: Figtree, Navbar, Footer, site metadata
├── page.tsx                home (flats and PG tabs)
├── (static)/               about, contact, careers, blogs, FAQs, legal, for-owner/agent/tenant, rent receipt…
├── properties/             flat list and detail ([id])
├── pg/                     PG home, list, detail, post-property
├── agent/[id]/             agent profile
├── post-property/          flat posting wizard
└── login/, signup/         OTP sign-in screens
components/
├── Homepage/, PG/, PropertyDetailsPage/, About/, Careers/, Legal/, RentReceipt/
├── PostProperty/           flat wizard: steps, stepper, side columns, options
├── PostPG/                 PG wizard: steps, room modal, KYC step
├── Auth/                   AuthFlow, OtpInput, AuthShell
└── ui/                     Button, Badge, cards, FAQ section
context/Tabcontext.tsx      flats/PG tab state
```

Route groups in parentheses don't appear in the URL. Some routes don't match their content, which `SCREENS.md` records: `/for-tenant` renders the PG lister page and `/rental-guide` renders "Post a property" marketing.

## Connecting it to the API

What the backend expects from a browser client:

| Concern | What to do |
| --- | --- |
| **Origin** | Add the site's origin to the backend's `CORS_ORIGINS` (exact scheme, host and port). Locally, run the site on a port other than 3000, which the API uses. |
| **Cookies** | Send `credentials: "include"`. The API sets `bh_at` and `bh_rt`; the site never reads them. Share `COOKIE_DOMAIN` between site and API subdomains in deployed environments. |
| **CSRF** | Every `POST`, `PUT`, `PATCH` and `DELETE` sends `X-Requested-With: bh-web`. |
| **Refresh** | On `401 SESSION_EXPIRED`, call `POST /v1/auth/refresh` once and retry. Treat `409 REFRESH_IN_PROGRESS` as "retry shortly", and `REFRESH_TOKEN_REUSED` as signed out. |
| **Captcha** | The OTP request and public forms need a Cloudflare Turnstile token. |
| **Idempotency** | Generate a UUID `Idempotency-Key` for `POST /v1/orders` and reuse it on retry. |
| **Drafts** | Send the last `draftVersion` in `If-Match` when saving a wizard step; on `409`, reload the draft. |
| **Uploads** | Ask for a signed form, `POST` the file straight to S3, then call `complete`. Show the photo once its media row is `ready`. |
| **Errors** | Show `error.message`; branch on `error.code`. `VALIDATION_FAILED` has per-field `details`. Log `requestId`. |
| **Types** | Generate a client from `openapi/openapi.json` (OpenAPI 3.1), or share the Zod schemas. |

### Screens and the endpoints behind them

| Screen | Endpoints | Backend |
| --- | --- | --- |
| `/login`, `/signup` | `POST /v1/auth/otp/request`, `/v1/auth/otp/verify`, then `POST /v1/me/profile/complete` for a new account | <Status s="built" /> |
| `/post-property` | `POST /v1/me/listings`, `PUT …/draft/steps/{step}`, media uploads, `POST …/submit` | <Status s="built" /> |
| `/pg/post-property` (incl. KYC) | Same as above, plus `POST /v1/me/kyc-submissions` | <Status s="built" /> |
| `/for-owner`, `/for-agent`, `/for-tenant` plans | `GET /v1/plans`, `POST /v1/orders`, `/verify` | <Status s="built" /> (prices differ, see [Plans and pricing](/product/money/plans-and-pricing)) |
| `/contact`, `/feedback`, `/advertise`, `/careers`, newsletter | `POST /v1/contact-messages`, `/v1/feedback`, `/v1/advertise-enquiries`, `/v1/jobs/{slug}/applications`, `/v1/newsletter/subscriptions` | <Status s="built" /> |
| `/about`, `/faqs`, `/blogs`, `/testimonials`, legal pages | `GET /v1/pages/{slug}`, `/v1/faqs`, `/v1/articles`, `/v1/testimonials` |
| `/unsubscribe` | `GET`/`POST /v1/unsubscribe/{token}` | <Status s="built" /> | <Status s="built" /> |
| `/properties`, `/pg/properties`, detail pages | Search and listing detail | <Status s="none" /> |
| Contact the owner, agent profile | Enquiries, agent profiles | <Status s="none" /> |
| `/rent-receipt` | Runs in the browser only | |

The [API reference](/engineering/reference/api) has every endpoint's fields and error codes. There is no admin portal yet; staff endpoints are under `/v1/admin`.
