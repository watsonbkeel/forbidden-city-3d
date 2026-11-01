# R158 Arrow production hook — independent review

Decision: no P0–P2 found in this reviewed integration; suitable to commit/integrate as a bounded partial change, not whole-object or GPU acceptance.

Reviewed working tree: `/workspace/scratch/02a8023d1a85/r158-arrow-integrate`, HEAD `5e66bedf80cf0d00ef29759ba937d1a3a882d55c`, plus the then-uncommitted four-line EnclosedPavilions hook and review/test additions. Review is bound to `verified-hashes.json`, not an unobserved future commit.

## Independent results

- Targeted local suite: 58/58, exit 0, executed with test concurrency 1.
- Real production `ZoneBase.buildHall` dispatch calls knees -> lattice -> exact central-nameboard removal before atlas/finish. No manual finalizer injection on the live path.
- Pre-integration EnclosedPavilions source, after deleting exactly two imports and two guarded calls, matches actual Git `3e9d5c92` SHA256 `57872a85c3bd173865c469f13ded4b93bd01539a35a087e19fb887967b6687c1`.
- Original R59 frozen golden remains SHA256 `f6bc8b87fe01b418cfc748d822153c2c560b04ac19b9a58fa2433ea20c0d1740`. Only its historical whole-hall equality assertion uses the SHA-pinned historical host; the remaining 11 R59 tests still use the current live ZoneBase path. Frozen fixtures and legacy inventory were not lowered or overwritten.
- Unrelated Linxi actual geometry/material/physics/plaque/name state equals pre-hook state.
- Additional reviewer instrumentation of real live construction/finish/dispose: 64 retired grids and 2 retired plaque geometries each dispose once; 18 new source geometries (including old knees), 17 merged geometries and 3 private new materials each dispose once; 8 borrowed materials are not disposed; no orphan atlas.
- Live Arrow local snapshot: 262 meshes / 6462 triangles; 87 colliders / 3 walkables / 1 room. Mesh hash `e026c1b4c7dac1c96a73b969bf73bbbbb839215f0169a786c0cbd3b7881f7013`; physical hash `e6c44f916875f40c7e3b64389ed3b744959613b4a03ee5422ebc4c5f5692643d`.
- Independent one-World run: 1/1, exit 0, 11.2 seconds. Ran only after integrator confirmed its World + CPU tasks had terminated; slot released immediately afterward. The actual merged scene passes 9 former-plaque rays, 1728 lattice triangles, 96 infill triangles and 88 retained-knee triangles. Cumulative collision count is 30837. Prior four integrations pass their specified smoke checks. Taihemen remains partial (5/7 frame sightlines), not accepted.
- Actual full-World fixture uses JSON import compatibility only, not Arrow source rewriting or finalizer injection. World stdout and summary retained alongside this report.
- Viewed all three produced CPU images (south-wide, south-secondary-detail, north-retained). They display the bounded south change, removed central generic plaque, retained north cues and knees. They are CPU base-color diagnostics, not registered source-photo comparisons or browser/GPU evidence.
- All 577 frozen source/data hashes match after independent World completion. All production CPU proof source hashes and output hashes match.

## Limits retained

Geometry/photo-fit scope is unchanged; eight leaves are the retained model count, not a source-certified count. Right-column museum sign is not fabricated. Precise lattice, leaf proportions, transverse head joinery, roof details, site furniture and interior remain unaccepted. Keep `VERIFY_PENDING` and `wholeObjectAccepted=false`. This was not a full-repository regression or browser acceptance run.
