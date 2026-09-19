// Fails if a MascotSlot is used without a decision about its accessible name.
// Each use either passes `label` (the expression carries meaning the screen's text does not)
// or says it is decorative with a comment inside the tag: <MascotSlot name="standby" /* decorative */ />
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = "src";
const EXTS = /\.tsx$/;
const STORIES = /\.stories\.tsx$/; // stories show the prop, they are not uses
const TAG = /<MascotSlot\b[\s\S]*?\/>/g;
const DECIDED = /\blabel=|\/\*\s*decorative\b/;

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return EXTS.test(entry.name) && !STORIES.test(entry.name) ? [path] : [];
  });
}

const findings = [];
for (const file of walk(ROOT)) {
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(TAG)) {
    if (DECIDED.test(match[0])) continue;
    const line = source.slice(0, match.index).split("\n").length;
    findings.push(`${file}:${line}: ${match[0].replace(/\s+/g, " ")}`);
  }
}

if (findings.length) {
  console.error(`MascotSlot with no label and no /* decorative */ marker (${findings.length}):`);
  for (const f of findings) console.error(`  ${f}`);
  process.exit(1);
}
console.log("Every MascotSlot is labelled or marked decorative.");
