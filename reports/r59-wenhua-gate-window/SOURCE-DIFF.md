# FC-5652FA389B 文华门：仅照片右梢间南面

Status: VERIFY_PENDING. Coarse stone/frame geometry implemented; browser acceptance outstanding. Scope is one bounded facade component, not building acceptance.

## Source actually viewed
- Official photograph: https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efefc7fb9a3d.jpg
- Official parent: https://www.dpm.org.cn/explore/building/236531.html
- Image SHA-256: 16c83fbc77280e5e5057df8bb77e48f345820eb6747f7ce822336e4569a6f6fb
- Actual image dimensions: 1000 × 666. Viewed directly in the image tool on 2026-10-22. No crop or photo pixels redistributed.
- Photography date: unknown. The URL contains 2020/07/03, which is not a photography date. Target is the visible state in this image, not a claim about October 2026.
- Parent page fetch in this worker timed out. Identity is cross-referenced to the retained MASTER-PROMPT B entry and the independently reviewed parent assignment; no new parent-page reading success is claimed.

## Source → model → bounded difference
- In image-right lower facade, approximately x=750–888, y=335–431, a light stone lower section supports a red window framework. The lower stone occupies roughly 24–32% of the visible closure's height. Tree canopy obscures the upper boundary. Image-left is not used to infer an automatic symmetrical copy.
- Baseline SouthCourtGates.js builds both end closures as uninterrupted wall_red boxes. The selected box has local center [-13.24, 4.05, 0], dimensions [5.62, 6.5, .6], y range [.8,7.3] and south face z=-.3.
- Replace only its two south-facing triangles. Preserve the other five faces' original position/normal/UV/material bytes and every other original object, including opposite end closure, side walls, four inner partitions, six open door leaves, roof, plaque, stairs and physics.
- Add a light stone body and cap below a finite red perimeter frame with a recessed opaque closure. This is a reversible coarse fit, not a measured reconstruction, full window detail, movable window, room or extra passage.
- The original red front cannot remain visible behind the new frame. No copied lattice texture, photographic texture, carving, handles, hinges, pane/leaf count, guessed diamond repeat or unobserved north/left facade is introduced. The photograph visibly contains fine grille members. Their precise pattern/repeat count and leaf arrangement remain unknown and are NOT implemented; this is an explicit remaining visual difference, not a completed window repair.

## Camera and relative control points
- CourtKit documents +Z north and -X east. Actual Three perspective projection independently confirms it: local camera [0,4,-48], target [0,4,0], FOV 42°, aspect 16:9 gives x=-13.24 → NDC x=+0.4041958502 and x=+13.24 → -0.4041958502. Thus photo-screen right is the negative-X end bay, not a guessed name mapping.
- Retained control points: closure x boundaries -16.05/-10.43; platform y=.8; head y=7.3; original south datum z=-.3. No rescaling of building, camera-fit-derived survey, roof or doors.
- Fitted stone top y=2.66 (1.86 above base; 28.6% of retained closure height); plausible photo-fit interval y=2.36–2.88 (24–32%). Stone body/cap and plain red frame are constrained to this existing wall envelope.
- Fitted side margin .20 (range .12–.30), upper red margin .35 (range .20–.60, top partly obscured), frame width .16 (range .10–.22). These are model-coordinate fits, not historic timber sizes.
- All new south-visible components lie z≥-.3; recessed infill face z=-.12. No new geometry extends beyond original wall or collision envelope. Frame and lower sill meet; the closure remains opaque and nonwalkable.

## Prior work retained
R39 added dated Wenhua exhibition support/screen equipment. R48 refined Wenhua/Zhujing exhibition and ceiling details and access-safe fitted door poses. Neither is the present gate closure. This change does not edit SouthCourtProfiles, RemainingOuterHalls, gallery inventory, Wenhua main/rear display, any existing character or path data.

## Verification boundary
Baseline commit: 2b983ae82e50e23fd55bbe0845942a0a3855f8dd. Real browser blocked as previously verified by parent (Chromium sandbox socket EPERM; denied bwrap escalation is not retried). CPU output is an actual isolated production geometry diagnostic, not a browser screenshot or ACCEPTED evidence. Final status must stay VERIFY_PENDING for browser/material-lighting review and PARTIAL for the whole gate.
