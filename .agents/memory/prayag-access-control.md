---
name: PRAYAG access control model
description: Who may see distributor/retailer network data vs the public dealer locator
---
Rule: Network/KYC endpoints (`/distributor|direct-dealer|retailer/network*`) require a JWT with a business role (dealer/distributor/admin). Public self-registration is always forced to role "customer" server-side — business roles are assigned by admin only. Customers get only the public `/dealers/locator` (safe location fields, no phone/KYC) and the /find-dealer page.

**Why:** Imported retailer data contains Aadhar/PAN/bank PII; user asked that customers only find dealers via Google-Maps locator, everything else behind login.

**How to apply:** Any new endpoint exposing distributor/retailer records must use the business-role check, and locator-style public endpoints must return only name+address/location fields.

**Known gap (accepted for now):** portal dashboard/orders/schemes endpoints use the app-wide demo pattern `req.userId || 1` and are not role-gated — they serve demo/aggregate data only. Sensitive network/KYC endpoints ARE gated. If real per-user order data ever lands in these endpoints, add JWT+role guards and frontend Authorization headers first.
