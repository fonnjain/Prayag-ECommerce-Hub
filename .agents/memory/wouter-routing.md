---
name: wouter nested wildcard route breaks navigation
description: Why client-side navigation "only works on the home page" in wouter, and the fix.
---

# wouter: never wrap a shared-layout Switch in a `<Route path="*">`

**Symptom:** Client-side navigation works from `/` (home) but appears broken on every other page — clicking a `<Link>` updates the rendered content but the browser URL does not change (or navigation silently no-ops).

**Cause:** A route whose pattern ends in / is `*` (e.g. `<Route path="*">{() => <Layout><Switch>...</Switch></Layout>}</Route>`) makes wouter treat it as a **nested router** whose base becomes the matched prefix. On `/` the base is trivial so Links work; on an interior path the nested base absorbs the current path, so the nested `navigate()` builds a mangled pushState target → internal location state updates (content changes) but the address bar URL doesn't.

**Fix:** Do NOT nest a Switch inside a wildcard Route to attach a shared Header/Footer layout. Use a single **flat** `<Switch>` with all routes, and apply the layout conditionally around it:
```tsx
function Router() {
  const [location] = useLocation();
  const isBare = ["/admin","/dealer","/distributor"].includes(location); // routes without Header/Footer
  const content = <Switch>{/* all routes flat */}</Switch>;
  return isBare ? content : <WithLayout>{content}</WithLayout>;
}
```

**How to apply:** Whenever adding a shared layout wrapper for most-but-not-all routes in a wouter app, reach for conditional layout around one flat Switch — never a `path="*"` parent route containing the real Switch.

**Verify:** e2e (Playwright) is the reliable way to catch this — direct URL loads render fine (masking the bug); only clicking a `<Link>` from an interior page exposes the URL-not-updating symptom.
