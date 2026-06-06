#!/usr/bin/env node
// Fails if any tracked text file contains an em dash or en dash.
// Project rule: use a hyphen "-" instead. Cross-platform (no grep -P needed).
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const SKIP_BINARY = /\.(ico|png|jpe?g|gif|webp|mp4|mov|woff2?|ttf|otf|pdf|zip)$/i;
// em dash U+2014, en dash U+2013 (built from char codes so this file stays clean)
const DASHES = new RegExp("[" + String.fromCharCode(0x2014, 0x2013) + "]");

const files = execSync("git ls-files", { encoding: "utf8" })
  .split("\n")
  .filter((f) => f && !SKIP_BINARY.test(f));

const offenders = [];
for (const file of files) {
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  text.split("\n").forEach((line, i) => {
    if (DASHES.test(line)) offenders.push(`${file}:${i + 1}: ${line.trim()}`);
  });
}

if (offenders.length) {
  console.error('Em/en dashes are not allowed. Use a hyphen "-" instead.\n');
  console.error(offenders.join("\n"));
  process.exit(1);
}

console.log("OK: no em/en dashes in tracked files.");
