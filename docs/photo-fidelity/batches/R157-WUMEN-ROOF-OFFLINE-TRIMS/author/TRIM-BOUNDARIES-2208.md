# Task3 exact trim scope
Parent authorized isolated trim TDD on 2026-10-31 22:07 UTC. No production installation, supports, physics, World or CPU.

- 10 section layers; lower4 hip tubes+1 surrounding ridge (5); upper4 hips+1 finial (5); wing4 hips+ridge box+cylinder cap (6): 52 meshes per parameter mode. These are formulas, not measured artifacts.
- Hip CatmullRomCurve3 default interpolation, TubeGeometry tubular8/radial4/open. Lower has6 control intervals, upper/wing8; upper starts t=.02, other layers0; point Y operation retains baseY+hr*.6 then corner lift. Tip uses last-minus-control[-3], XZ extension3hr and Yraise1.6hr. Fixed hr; do not scale finished mesh.
- Lower surrounding ridge is original prism SIDE FACES ONLY, not a solid cap: new innerHalf+hr, Y(0)-hr..Y(0)+1.8hr. Keep original perimeter/y metric UV tile1.
- Pavilion LatheGeometry uses pinned12-point profile/hf/radiusScale=.55,6 sectors, baseY. Structural pole zero triangles may be removed explicitly with index/unused-vertex ledger; unexpected collapse fails.
- Wing ridge length2*rx+2hr; fixed cross-section hr*3.4 × hr*2.2, cylinder radius(hr*2.2)*.42; cap rotationZπ/2 and Y at base+hr*3.4. No chiwen/walking beasts (detail low).
- Tube/lathe/box/cylinder UV retain native Three parameter-space convention, not metre UV or texture photography. Normal/index/position/UV complete attributes and drawRange/groups must be tested, including full triangle coverage; inherited primitives are not proof of final assembly.
- Actual tube surface Y changes with the new horizontal tangent/curvature. Record per-mesh Float32 bounds and same-parameter mode Y differences, independently from the prior surface double-lift ledger. Open tube ends/prism top-bottom boundaries explicitly remain open. No watertight whole-roof claim.
- The two parameter modes use the same uninstalled reference parent frame. Original runtime/old fixture gold unchanged; pure sidecar only.
