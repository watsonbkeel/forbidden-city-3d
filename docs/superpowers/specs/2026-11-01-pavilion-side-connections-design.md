# Four pavilion-to-gallery connections — engineering proposal

Base: 70ab7dae, with fresh Youyi preserved. No old rejected candidate is used.

## Evidence and constraint
Fresh official photos 1980[1024].jpg (Hongyi) and 1534[1024].jpg (Tiren) show raised terraces, stone guards, and adjacent galleries, but do not give the current game coordinate offsets. Existing lower side landings end at Y2.8; the unchanged gallery floor is Y0.45. Actual transverse separation to gallery axis is 11.638m east and12.152m west. Thus this is not a tiny seam repair or a surveyed historical reconstruction.

## Alternatives
1. Raise/move all linked galleries: changes buildings, doors and Youyi interfaces; rejected for this task.
2. Remove endpoint rail or add invisible walkables: leaves fall/unsupported crossing; rejected.
3. Add four local stone-bodied, guarded, open-air connector paths to the nearest existing gallery front doors, keeping all buildings and front stairs unchanged: recommended engineering adaptation.

## Recommended bounded design
Keep the existing0.9m side descent and landing. Replace its end-rail only when a real connector is built; narrow the opening to a guarded2.4m path. Extend away from each pavilion along Z by about6m with a visible stone slope from2.8 to1.8m. A turning landing leads across the existing exterior gap toward the gallery front, descending to0.45m. A short low stone apron reaches the existing nearest front doorway, rather than cutting the closed gallery end wall. Outer edges have visible stone rails and matching collision. Ramp solid, support, and rails share the same coordinates; no new global controller rule/provider. Exact endpoints are derived from current profile and actual gallery bays, then tested for body clearance before accepting.

This is explicitly a game engineering fit, not evidence that the historical connection followed this folded path. A direct short slope would be steeper and risk the already observed running-descent airtime, so the two-flight fit is preferred unless collision/visual checks reject it.

## Preservation / tests
No data anchor, gallery geometry/doors, upper pavilion body, main entry, or fresh Youyi change. No main/remote writes. Original rail remains if connector construction cannot satisfy its contract. Real route matrix: four links, walking/running,10/60Hz, each out-and-back; original front entries and Youyi main path retained. Negative checks: rail crossing, below-support, real closed gallery end. Actual visible surface rays and normal TextureLibrary finish; overall before/after CPU views. Existing front-door/side-route distinction remains in the report. GPU/mobile not claimed.

## Stopping condition
If the new path intersects an unchanged facade/roof, requires moving a building, or cannot yield a plausible guarded connection, stop and report the specific unresolved interface rather than altering the protected buildings.

## Prototype as-built resolution
Parent approved the isolated engineering adaptation. Component clearance and running descent led to8m first flights /1.45m middle landings instead of the initial approx6m/1.8m suggestion. The actual four existing side slopes/landings additionally reuse the unchanged B contact logic with eight explicit source records; old57 retained. See the batch README for final test and visual boundaries.
