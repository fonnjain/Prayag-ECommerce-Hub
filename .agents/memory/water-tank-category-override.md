---
name: Water tank category override
description: Correct category assignment for water-tank products imported from the external catalogue feed.
---

Classify water-tank products as Storage Tanks even when the source division labels them Pipes & Fittings. Treat a `WT-` item code or an explicit “water tank” product description as the identifying signal.

**Why:** The source feed places these tank SKUs under its broad Pipes & Fittings division, but customers expect them in the dedicated Storage Tanks category.

**How to apply:** Keep this exception in every catalogue import and incremental sync. Move only the water-tank products; leave all other pipe/fitting items in their original category.