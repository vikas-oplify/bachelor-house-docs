# BachelorHouse Docs

Product documentation for BachelorHouse: how every feature works today, and how much of it is built, across `bachelor-house-backend` and `bachelor-house-client`.

Built with [Docusaurus 3](https://docusaurus.io/), Mermaid diagrams and offline full-text search, themed with the BachelorHouse client's colours and type (design direction A, "Listings").

## Quick start

```bash
npm install
npm start        # http://localhost:3000/bachelor-house-docs/
```

## Sources

Every rule was checked against:

| Repo | Branch |
| --- | --- |
| bachelor-house-backend | `chore/scaffold-from-reference` |
| bachelor-house-client | `main` |

When either moves, update `docs/product/build-status.mdx` and `docs/product/known-limitations.md` first.

## Scripts

| Script | Does |
| --- | --- |
| `npm start` | Dev server with hot reload |
| `npm run build` | Production build into `build/`. Fails on broken links. |
| `npm run serve` | Serve the production build. Search works here. |

## Structure

```text
docs/
├── product/        Product guide: overview, what's built, feature pages, known limitations
└── journeys/       Step-by-step journeys per persona, each step with its build status
src/
├── pages/index.js          Home page (hero search, audience cards, journeys)
├── components/Status       Build-status pill: built / partial / screen / none
├── components/AtAGlance    The "At a glance" card, from a page's `glance` front matter
├── components/JourneyRail  Numbered step rail; `paid` steps are gold
├── theme/DocItem/TOC       Puts the At a glance card above the table of contents
└── css/custom.css          BachelorHouse theme tokens, Mermaid colours
```

### Writing a page

- Feature pages take a `glance` block in front matter (see `src/components/AtAGlance/index.js`).
- Business rules go in `:::note[Rule · …]` callouts (rendered gold).
- Use `<Status s="built" />` etc. for status; never describe status in prose only.
- End feature pages with **Edge cases worth testing** for QA.
