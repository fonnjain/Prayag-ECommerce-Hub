---
name: Manifest product photo matching
description: Safety rule for associating the Drive product-image manifest with catalogue SKUs.
---

Map a Drive image to a product only when the image filename's normalized item code has exactly one manifest match. Skip duplicated normalized codes unless there is a separately reviewed, explicit association.

**Why:** The Drive library contains repeated filenames that can be legitimate colour variants but can also be unrelated assets reused across ranges. Treating all repeats as alternate images can show a customer the wrong product.

**How to apply:** Preserve manually managed imagery. For automatic catalogue mapping, assign only a single unambiguous primary image; add variants later through an approved mapping rather than filename guessing.