# A: actual retained upper bearing, 20:21
This is a read-only component capture; no original source or new builder was changed. Original result.json/run.log is retained, followed by gap-details and seam-roundoff diagnostics. No FirstPerson/World/CPU process was run in this audit.

## Actual current shafts
188 actual CylinderGeometry shafts cross12.31m:52main,28perwing,14perpavilion,12pertransverse-link. Bottom convex polygons are taken from actual transformed position buffers, not nominal circles. All188 centres and bottom vertices down-ray hit both old and proposed actual slab surfaces. Maximum vertical foot/surface residual9.894371e-8m.

Old3slab union gives0 missing foot polygon area. New187slab union gives20foot polygons with residual above1e-8m², maximum2.524337e-8m². This is **not** exact zero-area coverage; don't silently round it to zero. Detailed clipped polygons expose narrow strips. Across330 shared authored slab edges, every actual edge is exactly reproduced by Float32 half-size plus the mesh double-precision translation. Authored gaps are zero; largest actual positive gap7.867813e-7m (~0.79micrometre). This explains the discrepancy without changing physics or enlarging an acceptance tolerance. Record the finite representation limit; no claim of exact watertight top union. No architectural-scale unbacked shaft was found in this retained pose.

## Retained pose is not proposed upper reconstruction
Current four pavilion bodies remain11m old model bodies. Source-profile outer-axis reference is approximately19m, with different shape/ownership limits. Current north centres(±47.7,−6) differ from nominal references by X−3.219/+3.385m and Z+6.447/+6.315m. Current south centres(±47.7,−56.4) differ by sameX and Z−27.623/−27.756m. Source-reference bounds are not measured exterior walls or doorway coordinates. Nothing was moved to those references in this audit. Current wing length and13-bay spacing still follow the old retained layout.

Old world anchor−419.6 and proposed main-body anchor−379.5659919422 differ by+40.0340080578m. A uniform rigid move preserves local bearing but does not preserve external walls, routes, named-placement guards or Que interfaces. This audit is explicitly in component-local coordinates and does not approve that move.

## Five openings
The unchanged2010 geometry tests and independent audit cover five north openings along sampled centre lines, two side/L-mouth samples, real brick jamb face rays, and allfive closed leaves physically blocking. The retained doors,64/69near-leaf hats,32side-face meshes and north-head−4.1m change are exact within those stated record fields. This is not a full finite-body controller traversal proof; independent open/closed files are referenced, not relabelled as a fresh A test.

## Consequence
Current model shafts have no architectural-scale bearing loss, but this does not close whole-object bearing after four-pavilion/wing realignment or resizing. Do not move the origin or pavilion centres independently. Before provider installation or complete architecture acceptance, bind an explicit upper assembly fit (main retained vs four pavilion body/roof and wing/link endpoints), then repeat actual foot/roof/link/rail clearance checks. Existing new U and slope engineering fit may remain isolated while that contract is settled. The two authority windows cannot authorize the entire U or repair a missing slope/neck.
