# 020 — Maestro e2e credentials from .env.local

The e2e account's email and password were hardcoded in the tracked
`.maestro/booking-flow.yaml` (`env:` block and the seeding curl in the header).
They now live in `.env.local` as `E2E_USER_EMAIL` / `E2E_USER_PASSWORD`, shared
with the web app's Playwright suite (`hotels-web-next`, log 012), which uses the
same names.

## What changed

- `.maestro/run.ts` (new): entry point for `bun run test:e2e`. Reads the two
  vars from `process.env`, exits with a message if either is missing, then runs
  `maestro test -e E2E_EMAIL=… -e E2E_PASSWORD=… .maestro` and forwards extra
  args and the exit code.
- `package.json`: `test:e2e` is `bun .maestro/run.ts`.
- `.maestro/booking-flow.yaml`: hardcoded credentials removed; the curl uses
  placeholders and the header explains how the values arrive.
- `.env.example`, README: document the vars.

## Non-obvious

- **Maestro has no env-file option**, only `-e KEY=VALUE` (checked on 2.10.0).
- **`bun run <script>` doesn't help.** Bun loads `.env.local` into its own
  process, but a script like `maestro test -e E2E_EMAIL=$E2E_USER_EMAIL …`
  expands `$E2E_USER_EMAIL` empty. `bun <file>` does expose the loaded values to
  the file's `process.env`, hence the small TypeScript wrapper rather than a
  shell one-liner.
- **No `EXPO_PUBLIC_` prefix, on purpose.** Expo inlines `EXPO_PUBLIC_*` vars
  into the JS bundle, which would ship the password in the app.
- **Running `maestro test` directly** now needs the two `-e` flags; there are no
  defaults left in the flow.
- **Git history still contains the old password.** Removing it from the file
  doesn't change that; rotating it is the real fix and waits on a
  change-password endpoint in `hotels-api`.
- Verified with a stub `maestro` on `PATH` (arguments arrive intact); the real
  flow wasn't run, since it needs a booted simulator.
