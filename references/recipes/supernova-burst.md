# 超新星爆发 / Supernova burst

## Visual contract

Build tension in a bright but bounded core, flash briefly, then release a layered high-speed shell and slower debris. The explosion must keep color and structure instead of clipping into a white disk.

## Motion model

Use anticipation, flash, expansion, and decay phases. Give each particle a direction, shell group, velocity, drag, and temperature. Expand the leading shell rapidly while a denser inner cloud lags and cools.

## Parameters

`anticipation`, `flashDuration`, `blastRadius`, `shellCount`, `velocity`, `drag`, `cooling`, `exposure`.

Treat bloom and exposure as phase-dependent budgets. Never max both during the flash. Reduced motion shows the expanding shell after peak brightness.
