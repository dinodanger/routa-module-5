// PreToolUse hook: refuse any change to mcp/src/token-check.ts.
// Exit code 2 blocks the tool call and sends stderr back to Claude.
import { resolve } from "node:path";

const PROTECTED = "mcp/src/token-check.ts";
const FILE_TOOLS = new Set(["Edit", "Write", "MultiEdit", "NotebookEdit"]);

// Shell constructs that write, move, delete or rewrite a file.
const WRITES = [
  /(^|[^<&0-9])>>?\s*\S/, // redirection: > and >>
  /\btee\b/,
  /\bsed\b[^|;&]*\s(-[a-zA-Z]*i|--in-place)/,
  /\bperl\b[^|;&]*\s-[a-zA-Z]*i/,
  /\b(mv|cp|rm|ln|truncate|dd|install|rsync|unlink|shred)\b/,
  /\bgit\s+(checkout|restore|reset|apply|am|stash|rm|mv|clean|merge|rebase|cherry-pick|revert|switch)\b/,
  /\b(python3?|node|ruby|deno|bun)\b[^|;&]*\s(-c|-e|--eval)\b/,
  /\b(writeFile|appendFile|open\(|write_text|write_bytes)/,
];

const deny = (reason) => {
  console.error(`Blocked: ${reason}. ${PROTECTED} is protected; ask the user to change it themselves.`);
  process.exit(2);
};

let input;
try {
  input = JSON.parse(await new Promise((ok) => {
    let s = "";
    process.stdin.on("data", (d) => (s += d)).on("end", () => ok(s));
  }));
} catch {
  deny("could not parse hook input, so the call cannot be checked");
}

const { tool_name: tool, tool_input: args = {}, cwd = process.cwd() } = input;
const target = resolve(process.env.CLAUDE_PROJECT_DIR ?? cwd, PROTECTED);

if (FILE_TOOLS.has(tool)) {
  const path = args.file_path ?? args.notebook_path;
  if (path && resolve(cwd, path) === target) deny(`${tool} on ${PROTECTED}`);
} else if (tool === "Bash") {
  const command = args.command ?? "";
  if (/token-check/.test(command) && WRITES.some((re) => re.test(command))) {
    deny("this shell command looks like it writes to the file");
  }
}
