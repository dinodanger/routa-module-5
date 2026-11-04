// Every change is shown before it is applied: a tool that calls patchSettings
// must also call showChange. Only apply-change.ts is exempt, because it
// applies a change that preview-change already showed.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = "mcp/src/tools";
const EXEMPT = new Set(["apply-change.ts", "index.ts"]);
const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const calls = (src: string, fn: string) => new RegExp(`\\b${fn}\\s*\\(`).test(src);

const failures = readdirSync(dir)
  .filter((f) => f.endsWith(".ts") && !EXEMPT.has(f))
  .filter((f) => {
    const src = stripComments(readFileSync(join(dir, f), "utf8"));
    return calls(src, "patchSettings") && !calls(src, "showChange");
  });

for (const f of failures) {
  console.error(`${join(dir, f)}: calls patchSettings without calling showChange`);
}
if (failures.length) process.exit(1);
console.log("lint: ok");
