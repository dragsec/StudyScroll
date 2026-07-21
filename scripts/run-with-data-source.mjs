import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const [dataSource, nextCommand, ...nextArguments] = process.argv.slice(2);

if (!new Set(["mock", "postgres"]).has(dataSource)) {
  console.error("Choose either the mock or postgres data source.");
  process.exit(1);
}

if (!new Set(["dev", "start"]).has(nextCommand)) {
  console.error("Choose either the dev or start Next.js command.");
  process.exit(1);
}

const require = createRequire(import.meta.url);
const nextCli = require.resolve("next/dist/bin/next");
const child = spawn(process.execPath, [nextCli, nextCommand, ...nextArguments], {
  env: {
    ...process.env,
    QUESTION_DATA_SOURCE: dataSource,
  },
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error(`Could not start Next.js: ${error.message}`);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exitCode = code ?? 1;
});
