---
name: Production catalogue facets
description: Production-specific verification required when syncing structured product facets.
---

A development facet backfill and a successful full product transfer can still leave structured facet fields empty in production. Cross-environment import handlers must explicitly map every structured product field, and must reject payloads that omit required facet keys.

**Why:** The live facet endpoint depends on production `sub_category`, `series`, `collection`, and `size_label` values; an observed product transfer completed while the import handler silently discarded those fields.

**How to apply:** When adding structured catalogue data, update the import contract and its validation together. After deployment, query production facet counts and fetch a live category facet endpoint. Treat zero filled values or an empty endpoint response as a failed propagation, not as a frontend issue.