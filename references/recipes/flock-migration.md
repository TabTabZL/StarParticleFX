# 群体迁徙 / Flock migration

## Visual contract

Stars behave like a coordinated living group, splitting and reforming while maintaining a readable direction of travel.

## Motion model

Use separation, alignment, and cohesion forces with spatial hashing, then add a destination or flow-field force. Clamp acceleration and velocity. For decorative use, a deterministic analytic approximation may replace a full boids simulation.

## Parameters

`separation`, `alignment`, `cohesion`, `neighborRadius`, `maxSpeed`, `targetForce`, `groupCount`.

Do not run all-pairs boid updates. Seed starting groups and bound the simulation. Reduced motion shows a composed flock silhouette.
