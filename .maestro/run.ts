// Entry point for `bun run test:e2e`. `bun <file>` loads .env.local into
// process.env, but `bun run <script>` doesn't expose it to the script's shell
// ($VAR expands empty), so the credentials are passed to Maestro from here.
import { spawnSync } from "node:child_process";

const { E2E_USER_EMAIL, E2E_USER_PASSWORD } = process.env;
if (!E2E_USER_EMAIL || !E2E_USER_PASSWORD) {
  console.error("Set E2E_USER_EMAIL and E2E_USER_PASSWORD in .env.local");
  process.exit(1);
}

const result = spawnSync(
  "maestro",
  [
    "test",
    "-e",
    `E2E_EMAIL=${E2E_USER_EMAIL}`,
    "-e",
    `E2E_PASSWORD=${E2E_USER_PASSWORD}`,
    ".maestro",
    ...process.argv.slice(2),
  ],
  { stdio: "inherit" },
);
process.exit(result.status ?? 1);
