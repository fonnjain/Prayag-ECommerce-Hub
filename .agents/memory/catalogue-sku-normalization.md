---
name: Catalogue SKU normalization
description: Canonical product SKU form and safe cleanup rules for supplier catalogue matching.
---

Store every product SKU in compact form: trim it and remove every whitespace character before using it as an identifier, matching it to supplier data, or resolving image approvals.

**Why:** The supplier source can format one item code inconsistently (for example, `FT-20 M` versus `FT-20M`). Without a canonical form, active products can miss MRP/image updates and duplicate product rows appear. The legacy spaced duplicates were inactive and unreferenced, while the compact products were the active canonical records.

**How to apply:** Normalize incoming feed codes before de-duplication, category routing, visibility checks, and product upserts. Public product search should include SKU as well as name. Before deleting a spaced duplicate, confirm a compact active counterpart exists and check that orders, carts, wishlists, and images do not reference the duplicate; otherwise preserve it for review rather than deleting it.