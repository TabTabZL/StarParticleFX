# 星辰汇聚成图案 / Pattern convergence

## Visual contract

Begin with an irregular star field, establish direction, then settle into a legible logo, word, icon, or silhouette. Preserve some peripheral drift so the reveal remains spatial rather than becoming a flat dot matrix.

## Motion model

Precompute one source position and one sampled target position per particle. Scrub a deterministic eased interpolation with scroll or a timed phase. Add a low-amplitude curl offset that fades as formation progress approaches one. Reveal connections only after the target is mostly stable.

## Parameters

`formationProgress`, `scatterRadius`, `curlStrength`, `targetScale`, `targetOffset`, `holdDuration`, `dissolveProgress`, `palette`.

Sample the target from a high-contrast alpha mask. Preserve aspect ratio, reject isolated pixels, and distribute samples by area rather than scanning order. Reduced motion renders the formed state.
