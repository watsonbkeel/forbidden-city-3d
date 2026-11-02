# Task 1 independent review — retained garden-street source-front pins

- Reviewed range: `edc2de78ed62e82efd47555ef607c1a1071c8551..d98fd08de2fa33412a332de7fee27545fd25fe50`.
- Worktree HEAD independently confirmed as `d98fd08de2fa33412a332de7fee27545fd25fe50`.
- **Spec compliance: PASS (bounded component only).**
- **Code quality: PASS.**
- **Blocking findings: none.** No production hook / World / GPU / build / deployment / whole-gate acceptance is implied.

## Findings

### Critical
- None.

### Important
- None.

### Minor
- None requiring a change in this bounded commit. Production and test code are unusually compact, but this is a readability consideration, not evidence of an incorrect behavior or reason to block integration.

## Scope and identity evidence

Read the supplied brief, implementer report, full review package, all six changed files, and relevant production `CourtKit`, `TextureLibrary`, `MergeUtils` and fixture code. `git diff --stat` confirms that the range contains only the new module, component fixture/tests, CPU export/render tools, and source README. Existing `ZoneBase`, kit, zone data, release, landscape and physics files are not changed by this range. Current unrelated untracked plan/spec/cumulative QA files were excluded from review and not edited.

`src/scene/palace/special/GardenStreetGatePins.js:7–12,72–87` gates on garden + exact index/kind/formal name/x/z/rotation, retains all four distinct sourceObjectIds and each own photo URL, and returns false before allocation for unrelated identities. It does not add room/map/region/plaque/collider/walkable records. A successful change adds one child to the original frame with four pin groups, each consisting only of a red polygonal body and gold polygonal rim. No new scene gate, roof, plaque or artistic ornament is installed. The default gate temporarily recreated by validation is detached, reference-only, and disposed.

The recorded `wholeObjectAccepted:false`, `FOUR_SOURCE_FRONT_DOOR_PINS_ONLY`, and `ENGINEERING_FIT_NOT_SURVEY` correctly prevent partial exterior work from becoming whole-gate / R162 acceptance.

## Independent image/source inspection

Actually viewed these four original image files using `view_image` during this review:

- `/tmp/research-changkang-2034/left.jpg`
- `/tmp/research-changkang-2034/right.jpg`
- `/tmp/research-qiongyuan-2034/east-own.jpg`
- `/tmp/research-qiongyuan-2034/west-own.jpg`

Each depicts its own named gate with four projecting red-faced pins and gold-colored polygonal edges. Independently checked cached `catalog.html:244–247` against module source URLs and SHA-256 of all four local images against the README; all match. No photo bytes are added by the reviewed diff.

Changkang cardinal face is not established by this review and is not promoted to one in the implementation. Applying its photo-positive pins only to retained local -Z is explicitly labeled `UNKNOWN_ENGINEERING_TRANSFER`. Its six-sided coarse mesh is placed under engineering-fit metadata with an explicit non-assertion of exact historical corner count. Qiongyuan local +Z is labeled `CONTEXTUAL_INFERENCE_NOT_SURVEY`; the own-photo opposite red wall/side-street context and cached research explanation support the stated inference without turning it into a survey. No neighboring gate is substituted as evidence and no opposite-face copy is generated.

Also actually viewed both CPU before/after groups:

- `/tmp/garden-front-pins-2042/cpu/30-{before,after}.png`
- `/tmp/garden-front-pins-2042/cpu/26-{before,after}.png`

The new row is visible on the specified local side in each after image, with the generic original gate retained. Changkang's retained plaque remains in place; its visual presence is not hidden or claimed repaired. These CPU flat-swatches are only geometric visibility diagnostics, not texture/GPU/mobile visual acceptance.

## Geometry, plaque and old-stream protection

`GardenStreetGatePins.js:25–60` compares retained default host geometry attributes/index/groups/draw range, material serialization, descendant transforms/parents and metadata to a freshly generated production default. Matrix validation accepts untouched lazy identity or the expected composed matrix without writing the retained tree. Guards precede pin/resource staging, and duplicate / frozen-host rejection is before attachment.

Pin construction at lines 62–69,85–105 yields closed extrusions on only the admitted local face. Chosen centers `[-1.5,-.57,.57,1.5]`, y=4.70, radial bound .14 and projection .21 meet the brief's fit bounds. The .07m inner-center adjustment is explicitly permitted and documented. Existing plaque frame width is .84m (`CourtKit.plaque`, default width .72 + .12); `.57-.14-.42=.01m` confirms the documented physical X clearance without editing the old plaque. Tests additionally check actual world-space plaque bounds for every identity.

The component does not update old matrices, reparent old meshes, alter old geometry/material bytes, or write native gameplay arrays. Tests retain original object/geometry/material/parent identities plus position/quaternion/scale/matrix/world/attribute/index/material streams and native-array content, including failure paths. Source inspection agrees with those claims.

## Lifecycle and actual finish

Validation copies library maps into an independent material cache but intentionally retains original texture handles; it never calls real-library `material()` or `dispose()`. `materialStream` seeds serialization texture handles, avoiding image serialization and texture warnings. Reference kit-owned and reference-library materials are separately disposed in `finally`; shared texture handles are not disposed.

New materials are private, then transferred to `kit.owned` only after staging. Geometry failure cleanup disposes staged geometries/materials. Under the normal `CourtKit.finish()`/`mergeByMaterial()` path, the structure record is cloned into actual architecture metadata, pin geometry joins normal material buckets, source geometry is disposed, and materials remain owned until kit disposal. The focused lifecycle tests exercise both pre-finish and post-finish paths and shared-resource survival. No `noMerge` exception or change to shared disposal behavior was introduced.

## Verification evidence reviewed (not rerun)

Raw logs were read rather than rerunning the same 29 focused tests:

- `/tmp/garden-front-pins-2042/red-1.log`: initial absent-API RED, 22 failed.
- `/tmp/garden-front-pins-2042/red-2-warnings.log`: warning regression RED, serializer warnings present.
- `/tmp/garden-front-pins-2042/red-3b-hardening.log`: targeted RED, 4 tests / 1 pass / 3 intended missing guards.
- `/tmp/garden-front-pins-2042/green-final.log`: 29 tests / 29 pass / 0 fail / 0 skip, no warnings.
- `/tmp/garden-front-pins-2042/cpu-export.log`: all four before 1,258 triangles; after 1,530 triangles and four pins.
- `/tmp/garden-front-pins-2042/cpu-render.log`: all four before pin counts zero; all four after pin counts individually positive (763–815 pixels).
- `/tmp/garden-front-pins-2042/diff-check.log`: clean.

Additionally ran read-only `git diff --check` on the exact reviewed range: clean. No focused tests or heavy World were rerun, no code/remote modifications were made, and no project-wide pass is claimed. Integration must still establish the normal hook, actual World delta/route/physics equivalence, build and runtime appearance before any release decision.
