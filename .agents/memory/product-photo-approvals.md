---
name: Product photo approvals
description: Safety rules for approving duplicate Drive catalogue photos and publishing them through catalogue sync.
---

Product-photo approvals must be stored as explicit exact SKU-to-manifest-path associations. The catalogue sync may reconcile or clear only URLs under `/images/drive/`; it must preserve manually managed primary and detail images.

**Why:** Filename normalization is safe only for discovering candidate images. It is not safe for choosing an ambiguous product photo, and an approval change must not overwrite a separately curated product image.

**How to apply:** Require the reviewed SKU to be uniquely eligible for its duplicate group, validate every selected path against that group’s manifest candidates, and have sync use exact SKU overrides before its unambiguous filename fallback.

Approval writes use a PostgreSQL session advisory lock plus a content-hash version supplied by the reviewer. A writer must lock, reread, and compare the snapshot before replacing the JSON file; stale snapshots return a conflict rather than overwriting another approval.

**Why:** Atomic file replacement alone cannot stop two independently scaled API processes from reading the same old file before either writes. Session locks are released when a crashed process loses its database connection, unlike expiring or orphan-prone file locks.

**How to apply:** Preserve the reviewer version through the API contract, and never replace the shared advisory lock with an age-based lock file. Any alternate persistence design must retain conditional version checks and crash-safe lock release.