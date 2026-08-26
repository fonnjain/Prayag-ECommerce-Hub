---
name: PTMT official filters
description: Rules for maintaining the official PTMT Series, Collection, and Type filter mapping.
---

Use the official Prayag PTMT filter taxonomy only when every source product can be matched to the catalogue by its exact item code/SKU. The generic source entry that has no item code must not be guessed or name-matched.

**Why:** The ERP feed does not preserve the same Series and Collection labels as the official website. Inferring labels from SKU suffixes or product names would silently misclassify catalogue products.

**How to apply:** When refreshing the mapping, crawl each official PTMT filter's paginated results, read product-page item codes, and retain only exact local-SKU matches. Keep all source filter labels visible, but mark a code-less source entry unavailable instead of fabricating a match.