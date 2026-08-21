---
name: Mobile product page overflow
description: Responsive width checks for the product page, including header and tab-rail constraints.
---

Treat a mobile horizontal scrollbar as a layout defect to trace, not something to hide globally. Product-page overflow can originate from compact-screen header action controls and tab labels even when the newly edited component itself fits the viewport.

**Why:** Wide flex children and label padding can expand the root layout beyond a narrow viewport; clipping a distant carousel does not correct those true minimum-width constraints.

**How to apply:** After product-page layout work, verify at roughly 390px wide that the document width equals the viewport width. Keep header actions icon-first on small screens and ensure horizontally arranged tab controls use shrinkable, truncated labels.