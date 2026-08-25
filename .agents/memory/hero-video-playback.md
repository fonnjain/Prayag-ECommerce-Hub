---
name: Hero video playback
description: Browser compatibility guidance for locally hosted PRAYAG product-video reels.
---

Use WebM with VP9 as the primary source for locally hosted hero product reels, and retain H.264 MP4 only as a fallback source.

**Why:** The preview browser served H.264 MP4 files correctly but could not decode them, leaving the hero media element at `readyState = 0` with no advancing playback. The equivalent VP9 WebM assets loaded and autoplayed reliably.

**How to apply:** Add a local poster image for the initial render, then place the WebM `<source>` before the MP4 fallback. Verify the active video reaches a playable ready state and its current time advances in the actual browser, not only through HTTP checks.