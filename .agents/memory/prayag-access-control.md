---
name: PRAYAG access control model
description: Who may see distributor/retailer network data vs the public dealer locator
---
Rule: Full network/KYC endpoints (`/distributor|direct-dealer|retailer/network*`) are admin-only. Dealer and distributor portal endpoints are exact-role gated (with admin override). Public self-registration is always forced to role "customer" server-side — business roles are assigned by admin only. Customers get only the public `/dealers/locator` (safe location fields, no phone/KYC) and the /find-dealer page.

**Why:** Imported retailer data contains Aadhaar/PAN/bank PII, so a generic business login is not enough authority to browse it.

**How to apply:** Any new endpoint exposing distributor/retailer records must require admin authorization. Locator-style public endpoints must return only name+address/location fields, and portal endpoints must choose explicit allowed roles rather than a broad business-role guard.
