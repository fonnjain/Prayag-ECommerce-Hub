---
name: Product photo approvals
description: Safety rules for approving duplicate Drive catalogue photos and publishing them through catalogue sync.
---

Product-photo approvals must be stored as explicit exact SKU-to-manifest-path associations. The catalogue sync may reconcile or clear only URLs under `/images/drive/`; it must preserve manually managed primary and detail images.

**Why:** Filename normalization is safe only for discovering candidate images. It is not safe for choosing an ambiguous product photo, and an approval change must not overwrite a separately curated product image.

**How to apply:** Require the reviewed SKU to be uniquely eligible for its duplicate group, validate every selected path against that group’s manifest candidates, and have sync use exact SKU overrides before its unambiguous filename fallback.