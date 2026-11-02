# R158 user-feedback cumulative: labels, two entrances, nameboard

Base: local `458cea434b60fa5e9b3a31fa84c2d90ba1ab4c36`, verified remote `411c7bfd21fe9a836e4a89a02b84ab0fd51d6a70`. Runtime: clean `c20fd576a9bd2469d69df0d0d14fc3086be92c3e`. This cumulative keeps all earlier R158 fixes and the user's exact 24-byte R158 release.json. Read-only main comparison at 02:41 UTC remained identical to 87ca28d0; main/branches/Pages were not changed.

## Included, independently reviewed candidates
- Public names `10bf8783` + docs `460d1deb`: 19 exact aliases cover 17 current records. Maps/teleport receive clean place names; original builder records, research notes and uncertain-identity flags remain internal. No arbitrary parentheses stripping or forced office/warehouse identity. Map-only changes are not separately released.
- Zhujing north stair `215497b2` + docs `5b1ddb41`: authorize only the original platform and north ramp, preserving visible geometry and all original colliders/supports. No south-entrance permission or global controller change. Same four routes: 1.091111m visible foot/ground discrepancy becomes zero.
- Wenhua gate `03f88ff2`: remove the two transverse white panels obscuring the central stone approach. Exactly two meshes / 24 triangles removed from the original southern combined owner; the three-owner count is unchanged. Six posts, four longitudinal rails, side stairs and all other attributes/physical objects remain. Newly open central approach is genuinely traversable.
- Wenyuan nameboard `298fdecd`: shift only the final dedicated nameboard/backing X fit by -3.375m onto the existing actual doorway/bridge axis. Keep original Y/Z, orientation, scale, texture, every non-nameboard mesh and all collision/support geometry. This is an engineering alignment, not surveyed coordinates.

## Actual cumulative verification
36/36 finite component/contact tests; then three normal World tests pass with no injected product finalizer/support or fallback. Zhujing's normal QA copy changes only the exact runtime resolver target/report identity/output path, preserving author script and raw files.

28 accepted routes / 8,470 frames. All accepted route arrays equal the respective reviewed author's complete arrays; Wenhua old 12 frames, two side-rail negative arrays and two jump summaries are also exactly retained.
- Zhujing: 4 / 312, peak 0.
- Wenyuan: 8 / 1,678, inherited short-step sprint peak **0.39127395593100833m, strictFeet03=false**. No new blockage; original column/rail/back-panel probes remain.
- Wenhua: new 4 / 1,620 plus old 12 / 4,860. Old peak 0.042916667m. New central 60Hz sprint retains **0.44417641998547114m / nine frames >0.3 (0.15s)**, continuous motion/no observed penetration; the other three combinations are <=0.132m. Parent explicitly accepted this bounded natural run-off diagnostic rather than expanding physics. `ACCEPT_DOCUMENTED_RUNOFF=1` retains exact prior routes/jump summaries, side-rail rejection, no steering and a .444177m/nine-frame cap; the author's original strict exit1/raw remains intact. Do not describe every frame as <=0.3m or the author's strict World as green.

One clean application build: 659 modules, `/gugong/`, R158, buildId `R158-912414ce363e`, source `4f80f793e18da77228d63a4318850ba2c56130c00127aea1e3f00d643e3824ab`; independent source verification artifact is pinned. Vite's existing >500kB chunk warning remains, not a new build failure. Application build output is `/tmp/r158-user-feedback-build-0242`; this is not a new playable ZIP or deployment.

Raw local evidence: `/tmp/r158-user-feedback-cumulative-0235`; original candidate failures/captures remain in their own documented paths. Raw files are LOCAL_ONLY, temporary/non-persistent, not remotely available merely because SHA is listed. Published evidence is source/QA/brief results/hashes and author-generated CPU images only. No official research pixels or raw logs are included. No GPU/mobile/Mac thermal verification. The separate performance task is not included in this version.
