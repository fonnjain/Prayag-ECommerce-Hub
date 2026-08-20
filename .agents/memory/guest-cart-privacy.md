---
name: Guest cart privacy
description: Privacy and ownership rules for anonymous shopping carts
---

Rule: Anonymous carts use a server-issued, opaque HttpOnly cookie as their only identity. Cart item mutations must constrain both the item identifier and the resolved cart identifier.

**Why:** IP-address or caller-supplied identifiers allow people behind the same proxy to see the same cart and make cross-cart item IDs guessable targets.

**How to apply:** Preserve browser cookie credentials for storefront cart calls. Do not restore IP/header fallback identities, and owner-scope every cart read, update, deletion, coupon change, and checkout lookup through the server-resolved cart.