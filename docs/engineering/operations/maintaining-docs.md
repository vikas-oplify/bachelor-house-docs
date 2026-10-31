---
title: Maintaining these docs
sidebar_position: 4
description: How the reference is generated, and what to update by hand when the code moves.
---

# Maintaining these docs

This site is Docusaurus 3, in the `bachelor-house-docs` repo, deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`. The build fails on a broken link.

## Generated reference

`npm run sync` (`scripts/sync.mjs`) regenerates everything under `docs/engineering/reference/` and `src/data/sync.json`. It reads the two repos with `git show <ref>:<path>`, so it doesn't matter what each repo has checked out.

```bash
git -C ../bachelor-house-backend fetch
git -C ../bachelor-house-client fetch
npm run sync
```

| Option | Default |
| --- | --- |
| `REPOS_DIR` | The folder above this project |
| `BACKEND_REF` | `origin/chore/scaffold-from-reference` |
| `CLIENT_REF` | `main` |

| Page | Source |
| --- | --- |
| API | `openapi/openapi.json`, grouped by first OpenAPI tag (`API_PAGES` in the script) |
| Data model | The latest drizzle-kit snapshot in `src/db/migrations/meta/`, with doc comments from `*.table.ts` |
| Error codes | `ERROR_CATALOGUE` in `src/lib/errors.ts`, with usage counts from the contract |
| Settings | `src/modules/settings/settings.keys.ts`, plus a search for each key in code |
| Background jobs | `src/lib/queue/jobs.ts`, with handlers from `src/worker.ts` |
| Website routes | `page.tsx` files under the client's `app/` |

The script prints a warning when an OpenAPI tag isn't mapped to a page, or when it can't parse every error code. Add new tags to `API_PAGES`. It deletes generated files whose source is gone. CI only builds; the sync runs locally, where the repos are, and its output is committed.

## Hand-written pages

When the code moves, check these first:

| Change | Update |
| --- | --- |
| A feature is built or wired | `docs/product/build-status.mdx`, `docs/product/known-limitations.md`, the feature page's `glance.backend` / `glance.website`, the journey steps |
| `publishRights` wired, a job gets a handler | [Listings](../backend/listings.md#publish-rights), [Money and billing](../backend/money-and-billing.md#not-built), [Architecture](../getting-started/architecture.md#what-isnt-built) |
| A new ADR | [Design decisions](../decisions.md) |
| A new env variable | [Environments and config](./environments.md) |
| The website calls the API | [The website](../website/client.md) |

Writing conventions for product pages are in the repo `README.md`.
