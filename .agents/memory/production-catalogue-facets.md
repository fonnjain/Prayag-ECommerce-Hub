---
name: Production catalogue facets
description: Production-specific verification required when syncing structured product facets.
---

A development facet backfill and a successful full product transfer can still leave structured facet fields empty in production. Do not infer successful propagation from matching product totals or a successful sync log.

**Why:** The live facet endpoint depends on production `sub_category`, `series`, `collection`, and `size_label` values; an observed product transfer completed while those fields remained empty in production.

**How to apply:** After any catalogue sync that changes structured fields, query the production facet counts and fetch a live category facet endpoint. Treat zero filled values or an empty endpoint response as a failed propagation, not as a frontend issue.