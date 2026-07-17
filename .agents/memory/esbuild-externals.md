---
name: esbuild externals for api-server
description: Packages that break when bundled by esbuild in artifacts/api-server must be added to build.mjs externals
---
Rule: if the API server build succeeds but crashes at start with "Cannot find module" from inside dist/index.mjs, the offending package must be externalized in `artifacts/api-server/build.mjs` (it is a runtime dependency, so node resolves it from node_modules).
**Why:** pdfkit/fontkit broke the bundle (fontkit requires @swc/helpers cjs paths that esbuild rewrites badly).
**How to apply:** add the package (and its native/CJS deps) to the `external` array, keep it in `dependencies` not devDependencies.
