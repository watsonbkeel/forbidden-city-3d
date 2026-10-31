# Actual receiver / pavilion / platform reconnaissance — 19:41

Frozen local checkpoint 49b166ff. Read-only component capture, not World, no candidate builder or source edits.

## Current actual geometry
The existing lower builder owns three visible stone top slabs (12 triangles each). Their authored top is12.3, rendered Float32 top12.300000005960465; main X edge60.20000076293945. The engineering contact-rig receiver ends at |X|60.356125827814566: a genuine roughly0.156125m gap, not a precision tolerance. Rays at receiver inner edge do not hit these slab faces; rays at authored60.2 and59.7 do. The two representations are not yet assembled or certified.

The original north pavilion bodies are at X±47.7,Z−6,Y12.3, width11. Their actual enclosing runtime boxes are X[-53.2,-42.2]/[42.2,53.2],Z[-11.5,-.5],Y[12.3,15.3]. A path through these boxes is blocked; opening a pavilion cannot be claimed by moving exterior columns alone. East body has61 meshes and west18 (existing separately fitted north enclosure, not symmetrical source detail).

The nominal upper source reference uses approximately19m pavilion axis envelopes near X±51,Z≈0, NOT these11m bodies. Receiver/axis-envelope overlaps are east0.0662×1.7881m and west0.1987×.5298m. These are two differently registered reference rectangles, not discovered doorway clearances or floor ownership.

## Layer conflict
The OSM lower outline, transformed once into main-body local coordinates, crosses both neck rectangles. `map-layer.json` evaluates the actual contour at each neck midpoint and shows the engineering ramp below12.3 at the crossing. Thus filling the whole mapped footprint to12.3 would bury/obstruct the upper ramp. The mapped lower outline is not evidence of the upper walkable footprint. No platform cut, bridge, enlarged slab or hidden support is authorized by this arithmetic alone.

## Recommended bounded design next
Use one visible joint candidate scene with explicit source-layer overlays and a separately declared engineering platform-top contract; retain the current production scene as rollback/comparison. Do not preserve the wrong11m pavilion by simple translation, and do not fill the0.156m gap as a standalone patch. Reconstruct shared platform/pavilion/wing/ascent surfaces together only after defining which actual source layer supplies each edge. Keep the14rig's two receivers identified as test pieces until a real candidate platform surface replaces them with mesh/physics identity and seam proof.

The north-pavilion outer south interface is unresolved in source. Initial acceptance may prove arrival onto an actual exposed platform outside the closed pavilion, but must not rename that an entrance or grant access through the solid body. A full pavilion entrance requires its own visible enclosure opening and physical doorway evidence. Que gates and global bounds remain fixed. Current source original-anchor refinements must be enumerated, not silently disabled by a new anchor.

## Inspection limitations and first attempts
`selector-first-incomplete.json` selected slabs by `.name`, but production assigns `userData.wumenLowerPart`; its empty slab/ray set is invalid evidence. After fixing the selector, the first rerun threw on non-indexed geometry. Final `audit.mjs` handles indexed/non-indexed buffers and produced `actual.json`. Neither first attempt is a product failure or a passing geometry test.

No World/full-suite/build/GPU was run, no runtime installer exists, and no whole-object completion is claimed.
