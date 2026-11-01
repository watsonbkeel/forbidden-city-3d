# R158 cumulative — Neige south connecting gate

Sole successor to verified remote `3eaa228b2892d0d64d33fc57c5ef66fb01cdac28` / local `49ae9032`. Runtime frozen `112d8f6b65aa58e1dfa6e2da4f6772a4bea1462e`. Retains the earlier Wenhua contact, Jingxing and three courtyard-gate changes without altering their source or shared contact/controller code.

## Finite change
Exactly one new `NeigeSouthConnectingGate.js` plus a normal `ZoneBase` import/call immediately after the existing storehouse, before merge. Eleven real closed-triangle owners, zero new walkables or rooms. One identity/one map marker is asserted on the actual normal production build. No prototype injection, callback append or fallback installer.

The own2008 official photo supports a gray-roofed small gate, red masonry/short walls and stone feet; this is distinct from the already built white-wall hanging-flower gate. Position(-186,-383), east-west passage, dimensions, two visible open leaves and reverse elevation are reversible engineering/game fits, not surveyed2026 dimensions or admission permission. Clear opening1.93m reflects actual model geometry, not photo measurement. No additional historical office identity, second store, side building, entire compound or eleven-item completion is claimed. The author corrected buried leaves and coplanar jamb flicker before the reviewed freeze; the2cm exposure removes z-fighting, not precision surveying.

## Actual cumulative verification
- 12/12 selected component/native-control/flight tests; no skips/cancelled. Includes complete visible-triangle collision, open leaf/pier separation, UV, retained objects, thin walls/roof, ordinary traversal and bounded local flight/drop negatives.
- Normal outer-east World (`loadAll:false`), new gate8/8 (3456frames) plus existing main/store16/16 (26174frames): **24 accepted routes /29630frames, max absolute foot-ground gap0**.
- The separate8 inherited long-route diagnostics remain4green+4old Wenhua centerline failures; not part of the24 successes. All main/store/inherited arrays exactly equal the2cbf prior baseline despite the newer intervening Wenhua contact. All four row arrays, including new gate8, exactly equal the reviewed author candidate. No inherited failure was dropped or weakened.
- Clean application build626modules, `/gugong/`, exit0. Independently callable `verifyBuildSource` confirms source `0a8b48b796fb4e1d5632d22b3c0d40d14dfa8993ba7f37bb1e3871d16175a72d`, buildId `R146-fix-c46bb8f90cdf`, clean112d8f6b. Existing large-chunk warning remains, not a failed build.

The first integration component attempt failed while loading three files because sparse checkout omitted existing `tests/r158-neige/fixture.mjs`. That failure is preserved locally. Restored exact current-HEAD fixture bytes; no production or assertion edit. Final12/12 is a separate run, not an erased initial failure.

Latest batch's103/24 results are inherited evidence, not re-run here. This build includes them, while this limited test gate is specifically12 components and the24+8 rows described above. No full-city/GPU/mobile/production-texture test or new playable package; four author CPU views are flat-color diagnostics, not screenshots. Local flight evidence is only the actual local envelope, not entire-world flight/UI acceptance.

## Commands
```sh
E=../r158-cumulative-evidence-1855
EVIDENCE_OUT=$E/component-routes.json NEGATIVE_OUT=$E/component-negative.json FLIGHT_OUT=$E/component-flight.json DROP_OUT=$E/component-drop.json node --max-old-space-size=1024 --test --test-concurrency=1 tests/r158-neige-south-gate/component.test.mjs tests/r158-neige-south-gate/routes.test.mjs tests/r158-neige-south-gate/flight.test.mjs
BASELINE_REPORT=../r158-cumulative-evidence-1742/neige-store-world.json EVIDENCE_OUT=$E/world.json node --max-old-space-size=1024 --test --test-concurrency=1 tests/r158-cumulative-1853/neige-south-world.test.mjs
VITE_BASE=/gugong/ node --max-old-space-size=1024 node_modules/vite/bin/vite.js build
node --input-type=module -e "import{verifyBuildSource}from'./scripts/build-identity.mjs';console.log(verifyBuildSource({expectedBase:'/gugong/'}))"
```

Original frames/logs/official research copies stay LOCAL_ONLY; published raw hashes do not make those originals remotely downloadable. Candidate PINS preserve their author-source context; final integrated pins are VERIFICATION.json. Main, user's branches and Pages are not modified. Rollback is3eaa; no old package is replaced.
