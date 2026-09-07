# 星系旋涡 / Galaxy vortex

## Visual contract

Organize particles into one to three readable spiral galaxies with different scales and rotation rates. Keep a dark separation between arms so the structure survives bloom.

## Motion model

Assign each particle a galaxy, radius, arm index, and depth. Compute angle as `baseAngle + radius * twist + time * angularVelocity`, with inner particles rotating faster. Add a small seeded thickness and vertical tilt.

## Parameters

`galaxyCount`, `armCount`, `twist`, `coreRadius`, `angularVelocity`, `thickness`, `tilt`, `bloom`.

Bias samples toward the core without filling it solid. Use depth-dependent size and alpha. Reduced motion freezes at a composition with clearly separated arms.
