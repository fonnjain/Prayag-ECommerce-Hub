---
name: SPA query-param state must be reactive
description: Stale filters when URL query changes without remount in wouter/React apps.
---

**Rule:** In a SPA, never initialize page state (filters, category, search) from `window.location.search` only in `useState`'s initial value. `window.location.search` is not reactive, and client-side navigation to the same route does not remount the component — the URL changes but the content stays stale.

**Why:** PRAYAG bug: navbar category links "worked only from the home page" — from home the products page mounted fresh (filter applied), but switching categories while already on /products changed the URL without updating the grid.

**How to apply:** Use wouter's `useSearch()` (reactive) plus a `useEffect` on the search string to re-sync state, or derive state directly from the URL. When e2e-testing nav, always include the "already on the target page, switch via link" case — fresh-mount tests mask this bug.
