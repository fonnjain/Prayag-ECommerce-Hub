---
name: Catalogue sync and order history
description: Constraint to preserve historical order references during production catalogue replacement
---

Production product replacement cannot blindly delete every stale product: historical order items may still reference catalogue rows through a foreign key. The sync must identify live IDs, remove stale rows in recoverable batches, and preserve any referenced rows until order items store their own product snapshots.

**Why:** Foreign-key protection means a catalogue prune can fail even when the new product data is valid.

**How to apply:** Identify referenced product IDs from order items before deletion, abort on unrelated errors, and verify the final ID set contains only the new catalogue plus explicitly referenced legacy rows.