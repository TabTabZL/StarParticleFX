# 星球诞生 / Planet birth

## Visual contract

Dust collides, accretes, and resolves into a shaded sphere with an atmosphere or ring. The sequence should progress from chaos through disk formation to a coherent world.

## Motion model

Use staged states: cloud, rotating accretion disk, spherical projection, atmosphere. Assign final points with sphere sampling, interpolate from disk positions, and shade by surface normal, depth, and a fixed light direction.

## Parameters

`formationProgress`, `planetRadius`, `diskTilt`, `diskSpeed`, `surfaceNoise`, `lightDirection`, `atmosphere`, `ringWidth`.

Maintain silhouette contrast and keep the far hemisphere dimmer. Reduced motion shows the formed planet with a static atmosphere.
