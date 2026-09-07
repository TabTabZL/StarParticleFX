# 星幕折叠 / Celestial fold

## Visual contract

The star field behaves like a flexible luminous surface that bends, flips, and folds through depth. Creases should be readable without turning the field into a solid sheet.

## Motion model

Start from a two-dimensional particle lattice with seeded gaps. Apply one or more crease transforms in local coordinates, rotate each side around its crease, then add a low-amplitude wave and perspective projection.

## Parameters

`foldProgress`, `creaseAxis`, `creasePosition`, `foldAngle`, `waveAmplitude`, `waveFrequency`, `perspective`.

Preserve sparse sampling around the crease and use brightness to indicate surface normal. Reduced motion displays a partially folded composition.
