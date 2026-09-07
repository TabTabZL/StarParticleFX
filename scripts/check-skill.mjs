#!/usr/bin/env node

import { access, readFile, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { EFFECTS } from "../assets/demo/catalog.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readme = await readFile(resolve(root, "README.md"), "utf8");
const skill = await readFile(resolve(root, "SKILL.md"), "utf8");
const catalog = await readFile(resolve(root, "references/effect-catalog.md"), "utf8");

if (EFFECTS.length !== 21) throw new Error(`Expected 21 effects, found ${EFFECTS.length}`);
if (new Set(EFFECTS.map((effect) => effect.slug)).size !== EFFECTS.length) throw new Error("Effect slugs must be unique");
if (!skill.includes("references/effect-catalog.md")) throw new Error("SKILL.md must route to the effect catalog");

for (const effect of EFFECTS) {
  const recipe = resolve(root, `references/recipes/${effect.slug}.md`);
  const video = resolve(root, `docs/media/${effect.slug}.mp4`);
  const animation = resolve(root, `docs/media/${effect.slug}.gif`);
  await access(recipe);
  await access(video);
  await access(animation);
  if (!catalog.includes(`recipes/${effect.slug}.md`)) throw new Error(`Catalog missing recipe: ${effect.slug}`);
  if (!readme.includes(`![${effect.nameZh}](docs/media/${effect.slug}.gif)`)) {
    throw new Error(`README missing inline effect: ${effect.slug}`);
  }
  if ((await stat(video)).size < 10_000) throw new Error(`Video is unexpectedly small: ${effect.slug}`);
  if ((await stat(animation)).size < 10_000) throw new Error(`Animation is unexpectedly small: ${effect.slug}`);
}

console.log("StarParticleFX verified: 21 recipes, MP4 sources, and inline README effects.");
