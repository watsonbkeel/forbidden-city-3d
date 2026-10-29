# Independent read-only review
2026-10-29 reviewer `/root/resume_huangji_front/review_huangji`; no implementation edits or competing heavy tests.

- Visual-only boundary is reasonable: full per-window original envelope retained, exact same physics/nav records and values; does not certify every new visual plane against body penetration or inherited high window/column physics.
- Confirmed late failure with an existing nonwritable undefined `f.userData.yongshouSouthVisual`. Red reproduced live child mutation; fixed rejecting any existing descriptor before staging. Retained leaf material/userData writable descriptors are checked too. Frozen structure rejection also retained.
- Drawing `geometry.groups`, index `itemSize/normalized` were missing from original canonical-source guard. Added red mutation checks, then exact guards. `review-green.tap`4/4.
- Reviewer read corrected code and report: no remaining blocker in normal controlled construction. Scope atomicity accurately: **validated source/metadata rejection and detached construction errors** preserve live scene and clean new resources. Not arbitrary exception rollback: custom Object3D event handlers or dispose callbacks that throw during commit are not rolled back.
- Private material/texture release and old-envelope tests acceptable; GPU appearance/performance remains unverified.

Builder subsequently found an additional rendering-path issue during actual UV inspection: retained door leaves use `applyBandUV` with default real tileSize6, so their source U coordinates cover only ±leafWidth/12. A clamp-texture with default transform would show only one part of the new panel. Added a whole-panel UV coverage red test. Fix now verified below: private texture transform only, not source geometry or shared texture mutation. Independent review approved this mapping for final frozen RC.

15:44 UTC: `door-uv-red.tap` reproduces clamped/partial panel sampling; `door-uv-green.tap`2/2 confirms full0..1 face sampling after setting only the private door CanvasTexture repeat/offset. Original geometry/UV/matrices and shared materials/textures remain untouched. Initial complete shared group161/161 is retained as `shared-before-uv.tap`, not presented as the final post-fix group.

15:46 UTC: Complete residential first run183/195 versus actual cb455649184/195. New failure13!=5 counted eight new window outlines as furniture solely because their material name contained `gold`. Reviewer confirmed naming them `yongshou-south-painted-outline-fit` accurately separates a window finish from furniture; ONLY the material name changed, not colour/geometry/role/source/physics. This does not assert whether historical finish was gilt or paint. Original failure and parent replay remain, no legacy assertion changed; exact wholezone non-target retention independently proves furnishings unchanged.

Final review read the production-only two-file scope and honest validation boundaries; no new blocker. At15:55UTC complete frozen shared group finished161/161 (350.99s), after13/13 specialized,32/32 navigation,184/195 residential identical-parent failures and3/3 memory compile. No source changes after these runs.
