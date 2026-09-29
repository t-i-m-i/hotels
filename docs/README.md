# docs/

Three kinds of documents live here:

- **`considerations/`** — design tradeoffs and decisions (why we chose one
  approach over another). Edited in place as thinking evolves.
- **`guides/`** — how-tos and current-state descriptions of a feature or
  workflow. Edited in place as things change; they describe the _current_
  state, not history.
- **`logs/`** — a dated, append-only log of work sessions. Each entry is a
  snapshot of what was done, why, and anything non-obvious that came up (gotchas,
  things that were confusing, decisions made in the moment). Logs are never
  edited after the fact — if something in an old log turns out to be wrong,
  correct it in a newer entry or in a `considerations`/`guides` doc instead.

Naming: `logs/NNN-short-topic.md`, zero-padded, incrementing (`001-`, `002-`, …).

There's no separate roadmap doc — the feature list in the root `README.md`
is the plan.
