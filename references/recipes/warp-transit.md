# 星海穿越 / Warp transit

## Visual contract

Particles accelerate from points into perspective streaks toward the viewer, creating forward travel without making interface text unreadable.

## Motion model

Store each particle in camera space with depth `z`. Advance depth, recycle behind the far plane, and project the current and previous positions to form a streak. Scale streak length with velocity and proximity.

## Parameters

`speed`, `acceleration`, `fieldOfView`, `vanishingPoint`, `streakLength`, `nearFade`, `laneSpread`.

Keep a quiet safe area behind content and shorten streaks on phones. Reduced motion shows points with a subtle depth gradient rather than streaks.
