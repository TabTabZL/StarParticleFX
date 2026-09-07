# 星尘降落 / Stardust descent

## Visual contract

An abstract star field settles downward and resolves into a ground plane, mountain contour, skyline, or lights connected to the next content section.

## Motion model

Give each particle a sky source and a sampled destination mask near the lower viewport. Combine gravity-like descent with lateral drag, then reduce velocity as the particle approaches its target. Use staggered start times by depth.

## Parameters

`descentProgress`, `gravity`, `drag`, `wind`, `targetMask`, `settleHeight`, `stagger`, `groundGlow`.

The destination must match the following section's geometry. Keep falling particles sparse over text. Reduced motion shows the settled landscape.
