---
name: PTMT official filters
description: Rules for maintaining the official Prayag PTMT Series, Collection, and Type filter mapping.
---

Use the official Prayag PTMT filter taxonomy only when every source product can be matched to the catalogue by its exact item code/SKU. A code may be shown in the product title or explicitly in the official card image alt text; never infer it from a URL slug or name.

**Why:** The ERP feed does not preserve the same Series and Collection labels as the official website. The source filters paginate their results, and its Shower card identifies item code `181` only in the official image alt text. A small number of product pages have a title/URL code that conflicts with their internal Item Code field; inferring labels from SKU suffixes or product names would silently misclassify catalogue products.

**How to apply:** When refreshing the mapping, crawl every page of each official PTMT filter, read product-page item codes (or an explicitly supplied card image-alt code), and retain only exact local-SKU matches. If a product title/URL code conflicts with an internal Item Code field, use the explicit title/URL code as the identity and retain the conflicting field only as audit metadata; never apply that page's content to the sibling SKU. Keep an actually code-less source entry unavailable instead of fabricating a match.

**Audit behavior:** A source-inventory audit is review-only: decode source pager links before crawling them, use a unique product-title code as authoritative, and use image-alt codes only for a code-less card. Derivative asset names such as `123-D-2` are not product codes, and label case/whitespace changes do not alter taxonomy membership.

**Why:** The official markup HTML-encodes pagination and can reuse generic or derivative image alt text. Treating either as a product identifier produces false removals and ambiguous entries, which hides real catalogue drift.

**How to apply:** Review any reported exact code or `(filter kind, label, code)` membership change against the official product page before updating the approved mapping; never let the audit edit customer-facing filters automatically.