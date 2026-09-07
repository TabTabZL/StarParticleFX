# 负空间显影 / Negative-space reveal

## Visual contract

Particles evacuate a logo, word, or silhouette so the subject appears as darkness surrounded by light. The boundary must remain legible without outlining every edge.

## Motion model

Use a signed-distance field or alpha mask for the subject. Apply a repulsion force inside the shape and a narrow attraction band outside its boundary. Preserve low-density background particles to avoid a pasted-on cutout.

## Parameters

`revealProgress`, `mask`, `repulsion`, `boundaryWidth`, `edgeDensity`, `backgroundDensity`, `focalOffset`.

Test the negative silhouette at small sizes and brightest animation phase. Reduced motion renders the fully revealed void.
