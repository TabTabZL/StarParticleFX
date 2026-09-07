# 引力透镜 / Gravity lensing

## Visual contract

A pointer, focus point, or scroll-driven mass bends nearby starlight around an invisible lens. The distortion should feel spatial and recover smoothly after input ends.

## Motion model

For each projected position, compute distance and angle to the lens. Apply bounded tangential bend plus a smaller radial displacement using a softened inverse-distance falloff. Smooth the lens position and strength over time.

## Parameters

`lensPosition`, `mass`, `softening`, `radius`, `tangentialBend`, `radialPull`, `decay`.

Clamp force near the center and never divide by raw distance. Pointer leave decays to a stable field. Reduced motion responds only while the pointer moves or renders a static Einstein-ring composition.
