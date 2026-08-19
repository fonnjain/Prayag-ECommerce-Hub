---
name: External Prayag product/MRP API
description: Source of truth for store products and MRPs — external competition-analysis app API
---

The store catalogue is imported from the external app `https://prayag-competition-analysis.replit.app` (`/api/v1/products`, header `X-API-Key` from secret `PRAYAG_COMP_KEY`; paginated, pageSize capped at 50).

**Decisions:**
- Store `products.sku` = external `itemCode`; `price` = `mrp` (no fake discount); only items with a real `currentMrp` are imported (~6,017 of 6,764).
- Division → category slug map lives in `scripts/src/import-external-products.ts`.
- Old placeholder catalog (1,731 items, BAL-xxxx style SKUs, 999/1299 pricing) shares NO codes or names with this API — never try to match them; replacement was the user-approved path.

**Why:** user wants MRPs to come from this external database; placeholder catalog had made-up prices.

**How to apply:** for price refreshes or catalog updates, re-run/extend `import-external-products.ts` (upsert by sku). Production DB must be synced separately.
