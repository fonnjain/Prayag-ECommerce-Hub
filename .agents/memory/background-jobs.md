---
name: Long-running background jobs
description: How to keep a long batch job alive in this Replit environment
---
Rule: shell-launched background processes (even with setsid/nohup/disown) are killed when the agent shell session ends. Run long batch jobs as a console workflow instead; it survives across sessions and exits cleanly when done.
**Why:** A dealer-geocoding batch (~80k rows, 1 req/sec) kept dying silently when launched via nohup from the shell.
**How to apply:** For any multi-hour resumable script, bundle it with the artifact's esbuild (`tsx` is not installed) and register a `console` workflow with autoStart; make the script resume from DB state so restarts are safe. Remove the workflow once the job is finished.
