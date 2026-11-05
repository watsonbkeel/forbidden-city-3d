# Independent review: Xuhui shell and connected galleries

Review status: COMPLETE for latest source/tests freeze `a8de58573d5c1178ec9fe41484e58410628ab0fe`, tree `b37a53e0221794d3943c55ce32fdf30fe8849689`. Runtime remains byte-identical to accepted `97e5e63f865c94b6a35baa3031daf92b3b6fb4bb`; the later test-only follow-up is reviewed in the appendix. All four first-pass P2 findings are addressed. No remaining P0/P1/P2 finding was identified in the reviewed scope or correction diff. Final bounded/actual-zone/schema/build/publication gates remain separate and were still pending at this review. This is not a release, aggregate-test, GPU, or whole-building photo acceptance.

## Reviewed identity and method

- Requirements: IMPLEMENTATION-BRIEF.md and PLAN.md in this directory; official research RECOMMENDATION.md and the actual reference image/plan pixels.
- Public comparison base: `14d81f71b3acd0eedfe1f2e12bd01190765f77ea`, tree `7838e551f1c48dd4325b3963e3b273a57bef855b`.
- Initial immutable source/test freeze: `7986d95a0e28710dfc7aa81eb9fd64ce63eeeeec`.
- First correction freeze reviewed: `f0dcbf85dd54209b301c1cd87a6f8c9ccfabd105`, tree `baac45820560daa9f59eafec5d97da8bc4f840f9`.
- Independently compared all 31 immutable file SHA-256 values with source-tests-freeze-final.json: zero mismatches. Verified the frozen historical ZoneBase file is byte-for-byte the public base's ZoneBase.
- Read the immutable new runtime source, full runtime delta, both changed historical guards, new component/source/geometry/ownership/negative/route/high/neighbor/render/production proofs and their relevant fixture/controller paths. Inspected both known fixes through the immutable commit-to-commit diff.
- No repository files, index, refs, dependencies, builds, World, or heavy tests were changed/run by this reviewer. Existing same-code suites were not duplicated. Source inspection, immutable hash verification, and reference/CPU image viewing were performed. Regression execution results below are attributed to the implementer's preserved logs, not presented as independent execution.

## First-pass material findings (all resolved in 97e5e63)

### P2-1: A fall through the roof can satisfy the supposed roof-impact witness

Location: `tests/r165-xuhui-gallery/high-runner.mjs:2` at freeze f0dcbf85.

`roofContact` is set whenever `feetY > 3 && feetY < 7.5`. An unobstructed downward fall passes through this interval, so the assertion does not establish any actual roof contact. The separately computed `roof.height` proves an indexed surface exists, not that the actor's vertical sweep or support transition hit it. The eventual allowed final height includes ground zero. This permits a broken roof collision to pass the claimed roof-drop/slide acceptance.

Required correction: observe actual controller vertical-impact/support evidence tied to the intended visible roof, retaining legitimate body-impact/sliding behavior. Add a roof-removal negative demonstrating the witness fails for an unobstructed fall or a different support. Do not modify shared collision/controller code to make the feature test pass.

### P2-2: The exact retained junction guard accepts duplicate-base/missing-paving substitution

Location: `src/scene/palace/special/XuhuiGallery.js:15–20` at freeze f0dcbf85.

Each intersecting mesh is accepted if it matches either the base or paving signature, after which the code only checks `platforms === 2`. Removing the paving and replacing it with a second exact base clone leaves two accepted matches. The required one-base-plus-one-paving membership is therefore not enforced. The existing missing/duplicate tests exercise cardinalities one and three, not this two-item substitution.

Required correction: enforce one unique occurrence of each exact named/role signature, retaining every existing matrix/attribute/index/parent/identity guard. Add the replacement negative, and preferably the symmetric duplicate-paving/missing-base case. No broader tag exemptions.

### P2-3: The alleged round trip resets controller history between ascent and descent

Location: `tests/r165-xuhui-gallery/route-runner.mjs:2` at freeze f0dcbf85.

The `reverse` loop starts a new `replayKunning` for the forward path and another for its reversed path, with an explicit new `startFeet`. Each one-way route is continuous, but the ascent, high-porch turn and return descent are not one uninterrupted controller history. This does not prove the brief's explicit out-and-back requirement without resetting at the high destination, and can miss state carried over from ascent/turning.

Required correction: exercise the full low-platform → steps → actual porch → turn → return sequence in a single replay. Preserve the existing frame-rate, mode and junction-offset coverage, or document a justified supplemental bounded matrix. Check no teleport/reset occurs at the turn.

### P2-4: The east-gallery bearing members stop visibly below the curved roof

Location: `src/scene/palace/special/XuhuiGallery.js:68,81–83` at freeze f0dcbf85.

The east posts and their transverse beams top out at y=5.75. For the three posts within the main rolled-roof section (z=385.2,389,393), the source roof underside at x=-240.92 is approximately y=6.079, leaving a 0.329 m gap. Even the beam's outer edge x=-241.11 is approximately 0.227 m below the underside. Thus these supposed porch bearing members do not actually meet the roof. This is not the already-fixed low-roof purlin issue, and a projecting eave can conceal it in the CPU viewpoints.

Required correction: add a bounded visible connection from the existing porch bearing members to the actual roof surface, with a geometry-based support/intersection test. Preserve the agreed roof silhouette, clear circulation/headroom, ownership/contact generation, old source and shared physics. Reinspect the affected CPU view.

## Previously identified fixes reviewed

### Low roof support chain

The f0dcbf85 change adds exactly two ordinary-box purlins and four post caps, all in the new module. It does not adjust retained architecture or contact policy. The caps cover the former post-to-purlin break; purlins reach the real flat roof underside and cross the low rafters. The dedicated geometric test inspects actual boxes and intersections instead of testing role names alone. The updated CPU low-joint view visibly shows the support chain. `support-rock-contact-green.tap` records its passing case. The repair is appropriate to the identified low-roof gap.

### Irregular rock contacts

The rock helper now explicitly marks its output as triangle contact, using the existing closed visible geometry and the existing owned template conversion. No mesh is moved, expanded, or excluded from physics. The three small asymmetric rocks remain beyond the protected low ordinary-box domain. The new rock test compares 27 downward mesh-ray samples with triangle-foot contacts, checks empty AABB corners remain empty, and the geometry test now includes the rocks in its closed/outward finite-triangle checks. The corresponding log records passing evidence. This fixes the initial invisible-box-contact mismatch without touching shared physics.

## Requirements and code-quality assessment

- **Scope:** Public-base-to-f0dcbf85 runtime comparison contains only the new XuhuiGallery.js and the exact three ZoneBase lines: import, consecutive hook 142, and call immediately after Xiefang. No other runtime/data/release/dependency change is in that immutable delta.
- **Historical preservation:** Xiefang normalization strips only the declared unique Xuhui delta before its original exact delta; the original guards and full old-source equality remain. The synchronous inert-hook accounting is the precise six-to-seven adjustment. Chongjing's exact normalization hashes remain `ca61169540e723653747215ff4fb9c8f5291ddc8e83902b8ef5dbf10ace48914` / `7c91888b9478eb562a0ef434e25ac6c5b7f8adb1363967ecd52c665ba9fad494` with unchanged normalizer files.
- **Evidence claims:** Metadata states surveyed=false, wholeObjectAccepted=false, currentAdmissionVerified=false, partial south-gallery-only photo coverage, and simplified unseen elevations. No room, map item, teleport destination, invented interior furnishing, shrine, cave or inscription is introduced.
- **Visible destination and route:** A real closed three-bay shell, real east/south porch slabs, low landing, and ten visible risers are present. Walkables are tied to visible slab/tread tops with rescue=false. The retained north-platform overlap is explicitly fitted rather than achieved by moving old geometry. The originally missing single-history round-trip proof is corrected as recorded in the final disposition below.
- **Contact generation:** Ordinary boxes use their actual visible box bounds; rotated rising members/roof shells use visible triangle conversion. Temporary conversion geometry is disposed in finally, and every staged geometry/material is tracked before its population/copy operations.
- **Atomic ownership:** Geometry/material construction occurs before publication. Publication rollback restores host array lengths and detaches the staged group. Borrowed slab material is not owned; copied roof materials are private, so color/side edits do not mutate the library material. Disposal is covered by real ZoneBase finish/release/dispose evidence. The originally missing exact retained-role uniqueness is corrected as recorded below.
- **Regression breadth:** The suite includes low/high joins, offsets, walk/sprint/backward movement, four rates, neighboring Xishang/Guhua/bypass paths, malformed host/occupied reserve, faults/retry/disposal, source guards and actual NingShou preservation/cumulative destinations. Final aggregate and actual-zone results must be regenerated on the correction freeze; neither interrupted aggregate nor earlier production-first evidence is final acceptance.

## Actual visual review

Viewed `xuhui.jpg` (SHA-256 `71578ebc0740aeed43175d9f1b51a679b0c715832b0ab38bb58a8882e40a5b9e`) and `first-court-plan.png` (`520d289ef0cf829f257af60b5b00f37919f2b538da77e0e67cf7e97de9fa825a`), not merely their descriptions. Also viewed `xuhui-cpu-supported.png` and `xuhui-south-rock-supported.png`.

The photograph supports local green posts/handrail, red rail framing/geometric infill, exposed timber, ochre-red backing and irregular pale stone, not the full main facade or roof. The plan supports the narrow three-bay building north of Xishang and the connecting-gallery topology; its red paving boundary is not a new wall. The implementation's yellow/green rounded hip-gable roof, closed three-bay facade and east/south gallery are explicitly text/plan-led. The small rock cluster is an admitted simplified cue, not a claimed rock-hill reconstruction. CPU panels show a real stair destination and a visible low connection; the low diagnostic panel honestly labels hidden old roofs while retaining the platforms. These images are not a GPU/material/lighting/device acceptance.

## Minor, nonblocking notes

- Runtime and several test files pack many independent operations into very long lines. The ownership/guard logic is reviewable but costly to maintain. Future edits should favor readable helper boundaries without widening this release's runtime scope.
- `git diff --check` reports trailing whitespace only in seven lines of the deliberately byte-exact frozen public ZoneBase fixture. Preserve the historical bytes rather than 'fixing' this fixture and breaking its provenance.
- No visual claim beyond the declared bounded text/plan fit is justified. GPU/browser acceptance remains unperformed and must stay explicit.

## Final correction review and dispositions

Completed 2026-11-05 00:18 UTC. Reviewed only the scoped correction wave from `f0dcbf85dd54209b301c1cd87a6f8c9ccfabd105` to `97e5e63f865c94b6a35baa3031daf92b3b6fb4bb`, without repeating the broad review or completed suites.

- Confirmed tree `c22d0cacda714f5edcf7fe9b5cfccb64ddc1efca` and all **33** SHA-256 entries in source-tests-freeze-reviewfix.json against immutable Git objects: zero mismatches.
- Confirmed REVIEW-P2-FIX.diff is byte-for-byte the immutable commit-to-commit diff. Its ten-file scope contains the new module, its own tests, README and CPU diagnostic only. The sole runtime change is in XuhuiGallery.js. ZoneBase and every prior runtime/data file are unchanged from the already-reviewed freeze.
- The scoped `git diff --check` exits successfully. The historical base-fixture whitespace note above is unchanged and outside this correction diff.
- Read the preserved individual RED logs for impact, junction, round-trip and bearing. Read the complete focused GREEN logs: review-fixes-final-focused-green.tap **34/34**, review-fixes-affected-green.tap **23/23**, review-fixes-chongjing-source-green.tap **3/3**, all with zero failures/cancellations/skips. These are implementer-run regression evidence, not reviewer reruns or formal aggregate counts.

### P2-1 — ADDRESSED

`high-runner.mjs:18–36` now observes the unchanged real vertical solver and compares a descending triangle impact against the first actual visible-triangle sweep, its named roof owner/instance, impact fraction and resolved feet. A foot landing additionally requires the support witness. The low ordinary-box roof requires its actual named-owner landed/onSupport transition. Acceptance also requires the same controller to consume the resolved feet and coordinates. A height-band crossing or separately queried surface is insufficient.

The broken-free-fall-solver and removed-main-roof negatives now require the specific “actual roof impact missing” failure. The retained RED logs honestly show that the old observer instead set its height-band flag and failed later on unrelated collision/query assertions. The correction does not suppress contacts, alter controller motion, or change shared runtime. Observer overrides restore in finally. `focused-high.json` contains all 12 named, controller-consumed impacts and successful outward ground exits. Rounded/tilted roof cases are correctly described as body impacts with sliding or blocking, not falsely as flat foot landings.

### P2-2 — ADDRESSED

`XuhuiGallery.js:15–20` tracks an exact unique set of platform names and requires both base and paving. Every original signature check remains in force before the name is accepted. Duplicate-base/missing-paving and its symmetric duplicate-paving/missing-base cases are present and green, with host-state preservation asserted. No generic tag exemption or expanded overlap was added.

### P2-3 — ADDRESSED

`route-runner.mjs:8–30` retains the 72 one-way cases and adds 36 complete out-and-back paths using one replay each. The test transparently observes actual setPosition/update calls, asserts one controller and one initialization, checks continuous time, reaches the high porch, crosses every tread in both directions and settles back at the real low platform. The unchanged replay helper's existing two-second release phase is now included in the same recorded controller history, rather than treating an airborne waypoint crossing as a completed landing or spawning a new grounded actor. No runtime/controller/physics adjustment was made.

`focused-routes.json` contains 108 rows, including all 36 rate/mode/offset round trips with one controller, one initialization, turnReached, descentTraversed and continuousClock true. Movement and settling frame counts remain separately visible. This meets the requested uninterrupted-return proof without weakening the existing one-way coverage.

### P2-4 — ADDRESSED

`XuhuiGallery.js:81–87` adds only four short visible timber capitals above the existing east posts/beams. Their lower faces overlap the original bearing members. The first three extend to y=6.14 and the north hip connection to y=6.02; the roof vertices, crown, eaves and silhouette remain unchanged. They are ordinary closed boxes using the existing owned-geometry/contact pipeline, stay well above player headroom, and add no new walkable or hidden support.

`east-bearing.test.mjs:2` verifies the post/beam overlap and 36 actual upward/downward roof-ray sample pairs: each cap reaches the real underside without passing through the top. Existing geometry/contact/headroom/neighbor/ownership regression logs remain green. Actually viewed `xuhui-cpu-reviewed.png` and `xuhui-east-bearing-final.png`; the close orthographic panels visibly show the rolled-roof and lower-hip bearing connections. No runtime hiding or unsupported new historical joinery claim is introduced.

## Review outcome and remaining gates

The four material findings are closed, and no new material regression was found in the exact correction diff. The earlier low-support and rock-contact fixes remain intact. The parent may proceed with the held final aggregate and serial actual-zone verification on this immutable source/tests freeze.

This reviewer did not run a build, World, heavy suite, browser/GPU test, remote publication or any repository mutation. Formal bounded/actual-zone/schema/build/publication outcomes remain the parent/implementer's responsibility and must not be inferred from this code review. Both interrupted aggregate runs and the preliminary actual-zone run remain non-final evidence. GPU/browser/device, complete photographic reconstruction, surveyed dimensions and current visitor access remain unaccepted.


## Appendix: actual Guhua neighbor-context correction

Scoped re-review completed 2026-11-05 00:36 UTC. Accepted test-only freeze: `a8de58573d5c1178ec9fe41484e58410628ab0fe`, tree `b37a53e0221794d3943c55ce32fdf30fe8849689`. **No new P0/P1/P2 finding.** Prior runtime/four-P2 acceptance is unchanged.

### Root cause and evidence

The subsequent actual NingShou run exposed a false positive in the earlier bounded neighbor fixture: it contained Xishang but not Guhua, so an attempted off-centre route through a real retained front bench appeared passable. This is a fixture/context defect, not an Xuhui runtime regression.

Read `neighbor-context-diagnostic.test.mjs`, `neighbor-context-public14.json`, `neighbor-context-current97.json`, `neighbor-context-comparison.json` and the two successful per-stage TAP summaries. The public builder is the previously verified byte-exact public14 ZoneBase, using the unchanged runtime dependencies. Independently compared the JSON results: the invalid route outcome, visible blocker description and all 24 replacement-route results are exactly equal between public14 and current97.

- Invalid route: `[[-245.3,378.6],[-245.3,381],[-249.2,381],[-249.2,389]]`, 10 Hz walk. Both stop at `[-249.20884305653425,382.24303880236357,0]`.
- Matching retained visible/contact object: `guhua-seat-top`, x `[-251.17666666666668,-247.09]`, y `[0.8599999999999999,0.98]`, z `[382.84,383.26]`.
- Genuine forecourt/central-opening connection: `[[-245.3,378.6],[-245.3,380],[-253.9,380],[-253.9,387.4]]`. Both actual versions pass all 24 combinations of four rates, three movement modes and two directions, with identical recorded outcomes.

### Correction review

`REVIEW-NEIGHBOR-TEST-FIX.diff` exactly matches immutable 97e5e63→a8de58573. Only `neighbor-runner.mjs`, `neighbor.test.mjs` and `production-zone.test.mjs` change, 40 additions/7 removals. Verified all 33 manifest SHA-256 entries and the tree; no mismatch. Immutable runtime/data/main/release comparison is empty, and the scoped whitespace check passes.

- The bounded test now invokes the real unchanged `buildGuhuaPavilion` using the actual zone item, alongside retained Xishang. The preserved RED log reproduces the same real bench stop when that previously omitted context is added.
- The original path and original 10 Hz walk parameters are preserved as an explicit rejection test. It requires exactly the old bench contact, matches that contact to the visible seat, checks the blocked destination/stop region, and compares the entire result before/after Xuhui.
- The positive Guhua route follows the tested real central opening. The other three neighbor paths and their original rate/mode/direction matrix remain intact, totaling 96 positive neighbor cases. No collider, walkable, architecture or controller is removed/modified to obtain a pass.
- Actual-zone verification now compares the original rejected route with/without only Xuhui's owned contacts. The retained contact set is already checked against the public baseline's exact hashes before this comparison. All existing raw geometry/data/roof equality, cumulative routes and destinations remain present. The additional comparison controller is cleared without mutating source contacts.
- `neighbor-context-fix-green.tap` records five passing Node cases: the two corrected neighbor tests and three unchanged full-source guards. This evidence is attributed to the implementer; no suite was repeated by the reviewer.

The narrowed correction is accepted. The final cumulative bounded run and serial actual-zone window may resume on a8de58573. Earlier green bounded results do not by themselves establish final actual-zone/build/publication completion; those gates remain separate. No heavy tests, builds, World, repository/index/ref edits or external writes were performed by this reviewer.
