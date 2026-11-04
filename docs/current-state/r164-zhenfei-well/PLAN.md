# 珍妃井最小独立增量

Goal: add one identifiable exterior well at a reversible fitted location on current main0b7aef80, without affecting old objects, circulation or normal controls.

Scope approved: one guarded component and one pre-finish NingShou hook; pale barrel-shaped stone annulus and real shallow dark bottom. Centre(-278.1,510.6), outer diameter1.10m,height0.85m,inner diameter0.44m are explicit fits, not a survey. No pavilion, new courtyard/hall, unknown inscription/furniture/interior, map or teleport. Harmless≤0.3m errors are not a refinement target.

Sources: https://www.dpm.org.cn/explore/building/236447.html ; https://www.dpm.org.cn/explore/building/236480.html ; https://img.dpm.org.cn/Uploads/Picture/dc/4654.jpg ; https://young.dpm.org.cn/info/995 . Own photo viewed; panorama metadata inspected but panorama pixels not viewed. Prior source-map fit and baseline local routes are research, not acceptance of the new object.

## Implementation sequence
- [x] Capture immutable actual NingShou production-zone geometry/physics/labels/roof baseline before adding source.
- [x] Red component tests: explicit identity, one annulus and real bottom, measured=false, no other-object binding, no map/room changes, native solid contact and visible aperture, exact guard/duplicate/atomic errors/disposal.
- [x] Implement src/scene/palace/special/ZhenfeiWell.js and one ZoneBase import/call. Keep existing files unchanged otherwise.
- [x] Green component tests; compare production-zone old snapshots and unchanged roofs; baseline routes after addition, both directions/diagonals and blocking negatives. FullWorld and GPU are outside this bounded check.
- [x] Run existing cumulative bounded regressions, Pages-base clean build and resource/build-identity checks.
- [x] Independent read-only review completed.
- [ ] Delivery gate: upload one new development branch only after checks pass and re-read all changed remote files. Preserve main/885 and all old branches. No deployment.

## Review focus
- Player cannot cross the stone wall or fall through the visible shallow bottom.
- Existing gate approach and four sides remain traversable, including sprint and diagonal approaches.
- Material merging/disposal cannot alter retained meshes or shared materials.
- Wrong host, moved anchors, overlap and duplicate installation fail before any partial registration.
- Exact public name is 珍妃井; approximation labels remain metadata/docs, not UI names.
