# 色彩迁移 / Chromatic migration

## Visual contract

Stars reorganize into cool, warm, or brand-colored regions while spatial motion communicates migration rather than a global color fade.

## Motion model

Assign each particle a target color class and region. Blend position toward a class-specific attractor while interpolating color in a perceptual color space. Add controlled boundary mixing to avoid hard bands.

## Parameters

`migrationProgress`, `regions`, `attractors`, `palette`, `boundaryNoise`, `colorSpace`, `mixWidth`.

Preserve luminance contrast and test brand colors against additive blending. Reduced motion renders the final segmented field.
