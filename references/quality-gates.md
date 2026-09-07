# Quality gates

Use these gates before declaring a web effect complete.

## Visual

- The named motion idea is recognizable without explanatory copy.
- Particle density supports, rather than obscures, the focal shape.
- No large region clips to featureless white. Inspect the brightest frame, not only the opening frame.
- Text, focus rings, navigation, and calls to action remain readable at every animation phase.
- The effect has a deliberate start, stable state, or loop seam; it does not visibly jump when repeating.

## Exposure budget

Additive blending, particle alpha, point size, bloom strength, bloom threshold, and tone-mapping exposure multiply each other. Tune them as one system.

```text
particle radiance × overlap → bloom → tone mapping → display
```

Begin with point alpha below 0.7, cap the brightest point size, use a nonzero bloom threshold, and keep exposure below 1 when dense particles overlap. Raise only one stage at a time.

## Performance

- Test a representative desktop and phone viewport.
- Cap DPR and use viewport-area particle budgets.
- Avoid per-frame object allocation and repeated gradient creation inside particle loops.
- Pause on `document.visibilitychange` and when the effect is outside the viewport when appropriate.
- Dispose all listeners, timers, animation frames, geometries, materials, textures, and renderer resources.

## Accessibility and input

- `prefers-reduced-motion` produces a stable composed frame.
- The canvas is decorative (`aria-hidden="true"`) unless it exposes meaningful controls.
- Keyboard navigation and page scrolling work without the pointer interaction.
- Touch input does not capture vertical scrolling for a decorative background.

## Verification

1. Build and run the host project with its standard commands.
2. Visit every new effect state and capture the brightest phase at desktop and mobile sizes.
3. Check the browser console for runtime, shader, and resource errors.
4. Exercise resize, tab hide/show, reduced motion, and teardown/remount.
5. Run the project's lint, type checks, and tests.
