# Jingfu court Wenfeng limited fit implementation plan

Goal: add one recognizable perforated viewing stone on an eight-sided pale pedestal, with a low copper-coloured rail, in the existing clear space west of Jingfu and south of Fori. This is a local part of I29 #11, not acceptance of the palace or historic court.

Authority: parent instructed autonomous sequential R164 development on the latest verified cumulative branch, preserving main and all previous versions. Baseline 82304a1a7f221ac85e4b66a101e1f1a73b380d37. No deployment.

## Design and source boundary
- Official Jingfu page https://www.dpm.org.cn/explore/building/236571.html gives an octagonal white-stone pedestal 2.5 m east-west by 4.2 m north-south, about 1 m high, approximately .3 m copper rail, and stone 4.5 m high. The side-court is west of Jingfu, south of Fori.
- Official-hosted Chen Yuhua, `景福宫前话文峰`, 《紫禁城》1984 issue 3, https://www.dpm.org.cn/building/talk/223680.html, page 35 and following colour plate: visible pedestal/rail and irregular perforated upright mass. Photograph is partial; sketch is not a measured elevation.
- Coordinates (-319.8,479.5), silhouette, real holes, hidden faces, material tones and rail member counts are a reversible model fit. No inscription, furniture, landscape or surrounding gates/walls are invented. No map or teleport changes.
- Existing full field x[-327,-312], z[470,488], y(.01,6) contains zero colliders in an actual 823 NingShou build. 180 sampled ground positions are unblocked at y=0. Evidence is external space-probe.json, not whole-World acceptance.

## Approaches
Chosen by implementer under delegated autonomy: a bounded solid procedural mesh with genuine small perforations and a closed base, not a photo billboard or speculative full court reconstruction. Closed pedestal and every visible solid use triangle contacts; no invisible rescue floors. No changes to common movement or collision.

## Steps
- [x] Write tests for identity, finite geometry, actual apertures, source invariance, mutation rejection, disposal and retry. Observe missing implementation red.
- [x] Implement one exact-zone helper and one ZoneBase hook. Freeze all original objects and physical fields from actual 823 before enabling the hook.
- [x] Run real controllers around all four sides/diagonals, inward blocking negative controls and top/drop checks; compare existing cumulative routes and roofs.
- [x] Request parent's independent reviewer. Close all factual or functional blockers and retain red-test evidence.
- [ ] Update README and append I29 facts without changing the 29 identities or whole-object acceptance count. Run bounded regressions and clean Pages-base build/HTTP asset checks.
- [ ] Upload unique development branch, read back every changed file and exact tree/ref/parent; retain 823 and main untouched.

## Review focus
Read-only arrays/metadata, non-identity transforms, changed nearby anchors and occupied reserve must reject before mutation. Failure after any geometry/material allocation must release private resources once and leave source reusable. Perforations need ray proof from both faces, not a texture. Base/rail contacts must not change the existing routes or trap a normal jump. CPU single zone is not GPU/browser/mobile/full World verification. No Node20 claim.

Ruling: bevelled fitted stone reaches 5.543785 m total, 4.543785 m above the 1 m pedestal. The initial 5.50±.01 assertion was unjustified precision for an approximate official dimension; bounded 5.45–5.60 m preserves the source proportion. No geometry was polished for this harmless 4.4 cm difference. Original red log retained.

Ruling: the first drop fixture began at feet 3 m inside the upright stone body, so the real controller correctly refused further penetration (red production-1). Drops now begin clear above the whole 5.54 m feature at feet 6 m; acceptance includes subsequent outward movement to clear ground. No common physics was changed.
Ruling: first CPU geometry preview exposed overly long planar cap faces. A dedicated red edge-length test drove bounded local subdivision and shared smooth normals, not extra objects or photo textures.

Ruling: the initial outward-exit check kept W held four seconds after leaving the stone and reached the existing Jingqi .8 m platform. The bounded test now releases W once 4.4 m away from the stone, then checks settling. This is a fixture scope correction, not a game collision change.

Verification: 207 bounded + real NingShou + real Yangxin B/S + real Fengxian neighbor Teleport = 210 passed. Independent reviewer ran 22 formal tests plus topology and late-contact cleanup probes. Runtime SHA256 helper7da69ffe389ddb183b4837d90ba4a554b9a29f9ca89ce3625a02fc3239e05b6b, Zone373e69e8112f57206c1f3e008be3da126f24d4b2b892143d899c55c47179d626. First bounded run ENOENT for two sparse-excluded HEAD JSON documents; exact HEAD restoration, not code edits, made the final run green.
