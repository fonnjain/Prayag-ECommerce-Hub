---
name: PTMT official filters
description: Rules for maintaining the official PTMT Series, Collection, and Type filter mapping.
---

Use the official Prayag PTMT filter taxonomy only when every source product can be matched to the catalogue by its exact item code/SKU. A code may be shown in the product title or explicitly in the official card image alt text; never infer it from a URL slug or name.

**Why:** The ERP feed does not preserve the same Series and Collection labels as the official website. The source filters paginate their results, and its Shower card identifies item code `181` only in the official image alt text. Inferring labels from SKU suffixes or product names would silently misclassify catalogue products.

**How to apply:** When refreshing the mapping, crawl every page of each official PTMT filter, read product-page item codes (or an explicitly supplied card image-alt code), and retain only exact local-SKU matches. Keep an actually code-less source entry unavailable instead of fabricating a match.