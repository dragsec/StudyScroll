import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const chunkRoot = path.join(process.cwd(), ".next", "static", "chunks");
const datasetRoot = path.join(process.cwd(), "datasets", "questions", "v1");
const forbiddenSignatures = new Set([
  '"verdict":"sus"',
  '"verdict":"legit"',
]);

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const fullPath = path.join(directory, entry.name);
      return entry.isDirectory() ? filesUnder(fullPath) : [fullPath];
    }),
  );
  return nested.flat();
}

const files = (await filesUnder(chunkRoot)).filter((file) => file.endsWith(".js"));
const datasetFiles = (await filesUnder(datasetRoot)).filter((file) => file.endsWith(".json"));

for (const file of datasetFiles) {
  const dataset = JSON.parse(await readFile(file, "utf8"));
  for (const question of dataset.questions ?? []) {
    for (const answer of question.answers ?? []) {
      forbiddenSignatures.add(answer.feedback?.legit);
      forbiddenSignatures.add(answer.feedback?.sus);
    }
  }
}

forbiddenSignatures.delete(undefined);
const leaks = [];

for (const file of files) {
  const content = await readFile(file, "utf8");
  for (const signature of forbiddenSignatures) {
    if (content.includes(signature)) {
      leaks.push(`${path.relative(process.cwd(), file)} contains ${JSON.stringify(signature)}`);
    }
  }
}

if (leaks.length > 0) {
  console.error("Private answer data was found in client chunks:\n" + leaks.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Checked ${files.length} client chunks; no private answer signatures found.`);
}
