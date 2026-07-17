---
name: PRAYAG orders auth model
description: How order/invoice endpoints authenticate and why guest checkout is blocked
---
Rule: all /api/orders* routes require a Bearer JWT (SESSION_SECRET); reads enforce ownership (owner or admin role), returning 404 for foreign orders and 401 unauthenticated. No userId fallback.
**Why:** an earlier `userId || 1` fallback caused an IDOR (anyone could fetch any invoice/order); architect review flagged it and the user's checkout now redirects guests to /login.
**How to apply:** new order-related endpoints must reuse getAuthUser/canAccessOrder in the orders route; frontend attaches tokens via setAuthTokenGetter in prayag main.tsx, and binary downloads (PDF invoice) need authenticated fetch + blob, not plain <a> links.
