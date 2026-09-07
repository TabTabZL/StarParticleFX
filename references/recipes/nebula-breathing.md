# 星云呼吸 / Nebula breathing

## Visual contract

The overall cloud keeps its silhouette while density, depth, hue, and local drift breathe slowly. It should support long reading sessions without demanding attention.

## Motion model

Sample a stable base cloud and add low-frequency curl or layered sine displacement. Modulate opacity and hue with a separate slower phase so every property does not peak together.

## Parameters

`breathPeriod`, `driftAmplitude`, `noiseScale`, `densityPulse`, `hueRange`, `depthRange`, `vignette`.

Avoid uniform scale pulsing and rapid twinkle. Keep the loop longer than six seconds. Reduced motion renders the midpoint with no twinkle.
