#!/usr/bin/env node

import { cp, mkdir, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(skillRoot, "assets/demo");
const destinationArgument = process.argv[2];

if (!destinationArgument || process.argv.includes("--help")) {
  console.log("Usage: node scripts/scaffold.mjs <new-or-empty-directory>");
  process.exit(destinationArgument ? 0 : 1);
}

const destination = resolve(destinationArgument);
await mkdir(destination, { recursive: true });
const existing = await readdir(destination);

if (existing.length > 0) {
  throw new Error(`Refusing to overwrite non-empty directory: ${destination}`);
}

await cp(source, destination, { recursive: true, errorOnExist: true });
console.log(`Copied StarParticleFX starter to ${destination}`);
