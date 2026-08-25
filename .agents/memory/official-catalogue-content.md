---
name: Official catalogue content
description: Rules for carrying product details from official Prayag pages into the store catalogue.
---

Use official product-page content only when it can be matched to an exact supplier SKU. Preserve curated official descriptions and specifications during supplier/MRP refreshes through a clear source marker in the product metadata.

**Why:** The official Prayag media host rejects third-party image embedding, resulting in broken image requests in the storefront. Public page text and specifications can be curated safely, but product photos must be approved and hosted locally before they are shown.

**How to apply:** Keep the existing product-grid and detail-page UI. Enrich matching products with source-derived descriptions and feature metadata; use the standard safe placeholder until a verified local image maps uniquely to that SKU. Do not guess around ambiguous source image filenames.

The official Kitchen Sinks Q-series range (Q748, Q752, Q732, Q740, Q736, and Q744 variants) has approved local images and source specifications, but neither the official pages nor the supplier MRP feed supply pricing.

**Why:** Publishing a guessed price would create an inaccurate purchasable listing.

**How to apply:** Present this range in the store’s standard light catalogue-card visual language, but keep it official and non-priced with exact local-image and source-page mappings. Only convert variants into normal purchasable product records when a real MRP source exposes the matching item codes.