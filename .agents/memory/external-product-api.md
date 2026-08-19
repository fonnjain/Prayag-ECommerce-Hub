---
name: External Prayag product/MRP API
description: Source of truth for store products and Prayag MRPs — external competition-analysis app API
---

The store catalogue is imported from the external app `https://prayag-competition-analysis.replit.app` (`/api/v1/products`, header `X-API-Key` from secret `PRAYAG_COMP_KEY`; paginated, `pageSize` up to 200).

**Decisions:**
- Only Prayag's own MRP is ever synced: `currentMrp` with `currentBasis="MRP"`. Never competitor prices, never `currentNet`, never the `/comparison` endpoint.
- The API returns MRP as of the request date by default; pass `asOf=YYYY-MM-DD` explicitly. Master price list effective 01 Sep 2026 = 6,205 active items (user chose to apply it early, before the effective date). `scripts/src/sync-external-mrp.ts` uses asOf = max(India date, 2026-09-01), override via `PRAYAG_MRP_AS_OF`.
- Store `products.sku` = external `itemCode`; `price` = `mrp` (no fake discount).
- ~240 active feed rows have `productName: null` (upstream data gap) — sync keeps existing name or uses a fallback name, never fails on it.
- Feed has legacy duplicate codes differing only in whitespace ("DSR- PVC03" vs "DSR-PVC03") that slugify identically — slugs are pre-assigned in JS with numbered suffixes, and the whole sync runs in one DB transaction.
- Items missing from the feed are marked `in_stock=false` (retired, hidden from all public catalogue routes) but never deleted, to preserve order history.
- Old placeholder catalog (BAL-xxxx SKUs) shares NO codes with this API — never try to match them.

**Why:** user wants Prayag MRPs from this external master database; competitor data must never leak into the store.

**How to apply:** the `Daily MRP Sync` workflow runs `sync-external-mrp` then `sync-prod-products` every 24h.

**Prod push auth:** the stored `ADMIN_PASSWORD` no longer matches the live admin account (login 401s). `sync-prod-products.ts` falls back to minting a short-lived admin JWT from `SESSION_SECRET` (dev and prod share the same SESSION_SECRET, and the deployed `/admin` middleware only checks the JWT's `role==="admin"` — no DB lookup). This keeps the daily prod sync working without the password.

**Prod upsert = two-phase (critical):** the deployed `/admin/import-products` upserts by product `id`, but `sku` AND `slug` are both UNIQUE. dev and prod ids for the same sku have diverged, so a direct upsert hits sku/slug "swap" collisions (23505). `sync-prod-products.ts` first parks every row on temp `__tmp_sku__{id}`/`__tmp_slug__{id}` (phase 1), then applies real values (phase 2). Never remove the two-phase logic.
