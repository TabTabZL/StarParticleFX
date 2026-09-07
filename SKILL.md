---
name: star-particle-fx
description: Create, integrate, or refine stellar particle visuals for web interfaces, including hero backgrounds, narrative transitions, interactive fields, and branded motion. Use when a frontend needs star, cosmos, constellation, orbital, nebula, warp, or particle-based effects; do not use for offline video-only compositing.
---

# StarParticleFX

Build a working web effect that supports the page's content and interaction instead of behaving like an unrelated screensaver.

## Workflow

1. Inspect the target project's framework, rendering stack, page composition, and existing motion conventions.
2. Select an effect from [references/effect-catalog.md](references/effect-catalog.md). If the user names one, read only that recipe. If the request is emotional rather than technical, use the catalog's selection cues before reading a recipe.
3. Read [references/integration.md](references/integration.md) when adding the effect to an existing application or choosing Canvas 2D, WebGL, or CSS.
4. Implement the effect as an isolated lifecycle-owned module with explicit mount, resize, pause/resume, and destroy behavior. Prefer the project's existing rendering dependency. Use [assets/demo](assets/demo) only as a reference or greenfield starter.
5. Apply [references/quality-gates.md](references/quality-gates.md) before completion. Verify the real page at desktop and mobile sizes.

## Required behavior

- Preserve the user's selected framework, layout, content hierarchy, and brand direction.
- Parameterize density, color, speed, amplitude, focal point, and exposure instead of scattering unexplained constants.
- Cap device pixel ratio and particle count by viewport class. Pause rendering when hidden and dispose listeners, animation frames, buffers, and contexts on teardown.
- Honor `prefers-reduced-motion`; provide a stable composed frame rather than removing the visual entirely.
- Keep text readable. Avoid additive-white clipping by controlling point size, alpha, bloom threshold, and tone-mapping exposure together.
- Use pointer or scroll input only when it reinforces the requested effect. Touch interaction must not block page scrolling unless the canvas is the primary experience.
- Deliver editable source integrated into the page. A screenshot or video alone is not an implementation.

## Effect recipes

The catalog routes to 21 focused recipes. Do not load every recipe by default. Multiple recipes may be combined when their responsibilities are distinct, such as `pattern-convergence` for the reveal plus `gravity-lensing` for ambient pointer response.

For a reusable public API, expose a small configuration object and lifecycle methods; do not expose shader or simulation internals unless the host project already follows that pattern.
