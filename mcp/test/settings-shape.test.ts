// Checks the settings shape the tools expect: against the fake platform always, and against a copy of what
// the real platform returned when we built this, when that copy is there (it is not committed, so CI skips it).
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { getSettings } from "../src/platform.ts";
import { fakePlatform } from "./fake-platform.ts";

function assertShape(settings: { access: { group: string; apps: string[] }[]; policies: { id: string }[] }) {
  assert.ok(Array.isArray(settings.access));
  assert.ok(settings.access.every((a) => typeof a.group === "string" && Array.isArray(a.apps)));
  assert.ok(settings.policies.every((p) => typeof p.id === "string"));
}

test("the fake platform's settings have the shape the tools expect", async () => {
  fakePlatform("read");
  assertShape(await getSettings());
});

const recordedPath = new URL("./fixtures/local-settings.json", import.meta.url);

test("the recorded settings have the shape the tools expect", { skip: !existsSync(recordedPath) && "no recorded copy on this machine" }, () => {
  assertShape(JSON.parse(readFileSync(recordedPath, "utf8")));
});
