---
name: PTMT catalog image extraction
description: How PTMT product images were mapped from the catalog PDF, and which SKUs have no photo in the catalog.
---

- PTMT product images live in `artifacts/prayag/public/images/products/ptmt/<catNo>.png`; DB `products.image_url` points there (SKU = `PTMT-<catNo>`).
- Mapping was done by pairing PDF image-draw coordinates with clustered "M.R.P." text anchors per page (pdfjs getOperatorList + getTextContent). Zip page dirs = PDF pages 1:1; PDF page 1 is printed page 01 (no cover).
- **No photo exists in the catalog** for the 2in1 Telephonic Wall Mixer (all `1374-*` SKUs, 9 items) and `131-Q` — these keep placeholder images. Don't hunt for them again.
- Some catalog photos are drawn mirrored (negative width in PDF CTM) — normalize before position matching.

## Google Drive hi-res source (July 2026)
- User's Drive folder (18tmQ9INp5CaTuzST_bROac9-yF56hQmr) connected via Google Drive integration; ~1,948 images across all brand lines.
- DB PTMT suffix → series: A=Sapphire, AB=Black Sapphire, H=Helix, L=Lagoona, LS=Erosa, N=Novo, Q=Quadra, R=Ovian, U=Ultra.
- Drive PTMT folders use DIFFERENT series (Cobra/Grand/Diamond/Vitro/Flora/Ibix/Black Pearl/Old Handle/Roman) not in DB — do NOT map by guessing suffixes (e.g. -HW, -IR ≠ -H, -R).
- 48 exact catNo matches replaced with hi-res (mostly L/LS/N/Q series). MARBEL ULTRA/LAGOONA/DELTA/OVIAN/QUADRA Drive folders are empty — Sapphire/Ultra/Ovian/Quadra/Lagoona/Helix hi-res photos don't exist in Drive yet.
- Drive also has unmatched inventory (CP 6000–9000 series, Sanitaryware, Showers BHS/BOS, Bathroom Acce BA-*, Hardware, Floor Traps FT-*, Geysers) usable if those products are added to DB later.
