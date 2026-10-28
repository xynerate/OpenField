import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const wrangler = new URL("../node_modules/wrangler/bin/wrangler.js", import.meta.url).pathname;
const root = fileURLToPath(new URL("../", import.meta.url));
const seedFile = fileURLToPath(new URL("../seed.sql", import.meta.url));
const action = process.argv[2] || "seed";

function runWrangler(args) {
  return execFileSync(process.execPath, [wrangler, "d1", ...args], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, WRANGLER_SEND_METRICS: "false" },
  });
}

if (action === "export") {
  runWrangler(["export", "open-fieldservice-db", "--local", "--no-schema", "--output=seed.sql"]);
  const raw = readFileSync(seedFile, "utf8");
  const idempotent = raw.replace(/^INSERT INTO /gm, "INSERT OR REPLACE INTO ");
  writeFileSync(seedFile, idempotent.endsWith("\n") ? idempotent : idempotent + "\n");
  console.log("Exported local database (including logo & bank details) to seed.sql");
} else if (action === "seed") {
  if (!existsSync(seedFile)) {
    console.log("No seed.sql found, skipping seed.");
    process.exit(0);
  }
  runWrangler(["execute", "open-fieldservice-db", "--local", "--file=seed.sql"]);
  console.log("Loaded seed.sql into local database.");
} else {
  console.error(`Unknown action: ${action}. Use 'export' or 'seed'.`);
  process.exit(1);
}
