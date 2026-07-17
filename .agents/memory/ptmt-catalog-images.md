---
name: PTMT catalog image extraction
description: How PTMT product images were mapped from the catalog PDF, and which SKUs have no photo in the catalog.
---

- PTMT product images live in `artifacts/prayag/public/images/products/ptmt/<catNo>.png`; DB `products.image_url` points there (SKU = `PTMT-<catNo>`).
- Mapping was done by pairing PDF image-draw coordinates with clustered "M.R.P." text anchors per page (pdfjs getOperatorList + getTextContent). Zip page dirs = PDF pages 1:1; PDF page 1 is printed page 01 (no cover).
- **No photo exists in the catalog** for the 2in1 Telephonic Wall Mixer (all `1374-*` SKUs, 9 items) and `131-Q` — these keep placeholder images. Don't hunt for them again.
- Some catalog photos are drawn mirrored (negative width in PDF CTM) — normalize before position matching.
