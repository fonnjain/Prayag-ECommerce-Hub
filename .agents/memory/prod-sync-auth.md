---
name: Production sync authentication
description: How the dev→prod catalogue sync authenticates against the live API
---

The prod catalogue sync (sync-prod-products) authenticates to the live API two ways: it prefers POST /api/auth/service-login presenting SESSION_SECRET as a bearer token (returns a 1h admin JWT), and falls back to classic email/password login with ADMIN_PASSWORD.

**Why:** SESSION_SECRET is guaranteed identical across dev and prod, so it is a reliable service credential when ADMIN_PASSWORD drifts from the real live admin password. Treat SESSION_SECRET as a privileged cross-environment credential accordingly.

**How to apply:** Task-branch changes to the API reach the live site only after the task merges AND the user republishes — a service-login 404 on the live URL means that republish has not happened yet.
