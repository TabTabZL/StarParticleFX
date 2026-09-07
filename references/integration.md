# Frontend integration

Read this when choosing a renderer or adding the effect to an existing page.

## Rendering choice

| Situation | Default |
|---|---|
| Existing Three.js, React Three Fiber, PixiJS, regl, or WebGPU stack | Extend the existing renderer |
| Fewer than roughly 3,000 particles and simple points/lines | Canvas 2D |
| Tens of thousands of particles, depth, bloom, or per-particle deformation | WebGL/WebGPU shader |
| Decorative dust with fewer than roughly 150 elements | CSS only |

Do not introduce a second rendering framework for one effect when the project already owns a capable renderer.

## Module boundary

The host should own layout and content. The effect module should own only its canvas and lifecycle:

```text
host component
  ├─ semantic content and controls
  └─ particle layer
       ├─ init(container, options)
       ├─ resize(width, height, dpr)
       ├─ setProgress(0..1) or setMode(name)
       ├─ pause()/resume()
       └─ destroy()
```

Use a single `requestAnimationFrame` loop. If the host already has one, register an update callback instead of starting another loop.

## Coordinate and timing model

- Store source state, target state, seed, size, and color as deterministic arrays or GPU attributes.
- Separate simulation time from transition progress. Scroll-driven effects must use normalized scroll progress; ambient motion may use elapsed seconds.
- Interpolate between stable states rather than mutating the previous result into the next input unless the recipe genuinely requires simulation.
- Seed randomness for repeatable screenshots and visual tests.

## Layering

Place the canvas in an isolated stacking context. Keep editorial content above it and reserve pointer events for the canvas only when interaction is requested. Use a vignette or localized scrim behind text before increasing text glow.

## Responsive behavior

- Recompute projection and focal point on resize; do not merely scale the desktop canvas.
- Reduce density by viewport area, cap DPR around 1.5–1.75, and shorten long streaks on phones.
- Keep important formations clear of headlines and controls. Use a layout-provided safe rectangle or effect-specific focal point.
- On reduced motion, render a representative still state and keep navigation functional.

## Starter

`assets/demo` is a dependency-free Canvas 2D implementation of the catalog. Copy it only for a greenfield prototype or use it to inspect the motion equations. Adapt the effect into the host architecture rather than embedding the complete gallery in a production page.
