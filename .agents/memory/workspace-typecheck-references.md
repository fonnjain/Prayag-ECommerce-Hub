---
name: Workspace typecheck references
description: Reliable TypeScript validation for artifacts that depend on workspace project references.
---

Use TypeScript build mode for an artifact's validation when it has composite workspace project references.

**Why:** A plain `tsc -p` can consume stale emitted declarations from a referenced workspace project. The app may build from current sources while its standalone typecheck reports exports or generated fields that no longer reflect the source contract.

**How to apply:** Keep the artifact typecheck command in `tsc --build` mode (or otherwise build references first) whenever it references workspace libraries. Validate both the artifact and the workspace release check after generated API contracts change.