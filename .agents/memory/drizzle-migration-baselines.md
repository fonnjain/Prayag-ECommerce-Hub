---
name: Drizzle migration baselines
description: Safe schema migrations when an existing database has no tracked Drizzle migration history.
---

When Drizzle has no prior migration history, generating a migration can produce a full current-schema baseline even though the development database already contains those tables. Do not treat that output as directly deployable against an existing database.

**Why:** Re-running `CREATE TABLE` statements against the established application database will fail before an additive schema change can be applied.

**How to apply:** Review generated SQL before committing. For an additive change on this established database, preserve only the necessary incremental `ALTER TABLE` and index statements; use the schema push workflow to apply the equivalent development change.