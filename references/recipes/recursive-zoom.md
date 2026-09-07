# 微观缩放 / Recursive zoom

## Visual contract

The camera enters one bright star and discovers a new complete particle universe inside it. Scale changes should loop without an obvious reset.

## Motion model

Render several copies of the same seeded field at logarithmically spaced scales and depths. Advance a shared zoom phase, recycle the largest layer as the smallest, and crossfade near layer boundaries.

## Parameters

`zoomSpeed`, `layerCount`, `scaleRatio`, `depthRange`, `crossfadeWidth`, `focusPoint`, `rotationPerLayer`.

Use logarithmic scale and stable seeding to hide the loop seam. Reduced motion shows nested fields at three visible scales.
