import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { EFFECTS } from "../assets/demo/catalog.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("catalog exposes 21 unique named effects", () => {
  assert.equal(EFFECTS.length, 21);
  assert.equal(new Set(EFFECTS.map((effect) => effect.slug)).size, 21);
  for (const effect of EFFECTS) {
    assert.ok(effect.nameZh);
    assert.ok(effect.nameEn);
    assert.match(effect.accent, /^#[0-9a-f]{6}$/i);
  }
});

test("every effect routes to a focused recipe", async () => {
  const catalog = await readFile(resolve(root, "references/effect-catalog.md"), "utf8");
  for (const effect of EFFECTS) {
    await access(resolve(root, `references/recipes/${effect.slug}.md`));
    assert.ok(catalog.includes(`recipes/${effect.slug}.md`));
  }
});

test("demo provides reduced-motion and teardown safeguards", async () => {
  const source = await readFile(resolve(root, "assets/demo/main.js"), "utf8");
  assert.ok(source.includes("prefers-reduced-motion"));
  assert.ok(source.includes("visibilitychange"));
  assert.ok(source.includes("cancelAnimationFrame"));
  assert.ok(source.includes("Math.min(window.devicePixelRatio"));
});
