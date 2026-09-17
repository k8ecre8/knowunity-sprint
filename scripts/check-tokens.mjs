// Fails if a raw hex colour appears in a component or screen file.
// Every colour must come from tokens/tokens.json via a var(--…) reference.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = "src";
const SKIP = new Set(["foundations"]); // token swatch stories: hex is the subject matter
const EXTS = /\.(tsx?|css)$/;
const HEX = /#[0-9a-fA-F]{3,8}\b/g;

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (SKIP.has(entry.name)) return [];
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return EXTS.test(entry.name) ? [path] : [];
  });
}

const findings = [];
for (const file of walk(ROOT)) {
  readFileSync(file, "utf8").split("\n").forEach((line, i) => {
    for (const match of line.matchAll(HEX)) {
      findings.push(`${file}:${i + 1}: ${match[0]}`);
    }
  });
}

if (findings.length) {
  console.error(`Raw hex colours found (${findings.length}):`);
  for (const f of findings) console.error(`  ${f}`);
  process.exit(1);
}
console.log("No raw hex colours found.");
