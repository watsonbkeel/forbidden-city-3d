# R58-A 昭德门南面宽间固定板面

Object: **FC-F838FEF7AB**. State: **PARTIAL / VERIFY_PENDING**, never whole-building acceptance.

## Implemented difference

The actually viewed own south photograph shows ochre/brown broad fields with teal and thin light/red outlines above the gray foot. The baseline uses red wall albedo throughout those fields. The dedicated helper replaces only the two south-facing triangles of each existing south closure with a non-overlapping planar partition. Red margins outside the broad-bay rectangles retain the source UV projection; the other five faces retain exact original triangle positions, normals, UVs and material references. There is no hidden full-face backing skin or additional relief.

Only production files changed:

- `src/scene/palace/special/ZhaodeSouthPanels.js`: dedicated guarded surface helper.
- `src/scene/palace/special/ZhaodeGate.js`: import and one call after existing box pruning.

The opaque, rough, normally lit paint uses one private material and a **4 × 1 RGBA DataTexture, 16 source bytes**, with sRGB semantics, nearest filtering and no mipmaps. Each rectangle's UVs vary within its own texel, so UVs remain nondegenerate while the zone is a constant color. This avoids both four extra material draws and the shared merger's deliberate removal of vertex-color attributes. No photo, sampled shadow, shader override or shared material change is involved. Material and texture use the existing `kit.owned` / `kit.ownedTextures` disposal paths.

## Fit, not survey

Two rectangles occupy local x = −7.5…−3.3 and +3.3…+7.5; y = 4.066…8.766; z = −4.424, the original outward wall plane. Each is **4.2 × 4.7 m**, with **zero added depth**. Outer teal / light / red outline widths are **0.13 / 0.025 / 0.035 m**. These are reversible visual fits to the existing core-bay column edges, existing gray-foot top and existing upper beam datum, not measured paint/joinery dimensions. Palette colors `#907253`, `#346f70`, `#c3c0a6`, `#925042` are base-paint approximations, not photograph colorimetry. Exact grain, aging, ornament, material/light response and final visual fit remain unaccepted.

The inherited documentary 20.128 × 13.248 envelope, 3.216 platform top, fitted 24.4 × 21 platform, 16.16 ridge, two ramps, three support IDs, one portal, gray feet, side closures, gallery contracts and all registrations are unchanged. No profiles, shared materials, generic gates, route/map/room/nameboard data or courtyard furniture changed.

**Narrow lateral studded panels remain unchanged and explicitly unresolved.** Their own exact lattice motif is not adequately resolved. No generic four-panel lattice was borrowed. The disputed nameboard, rear/side source gaps and other previously open features are not closed by this patch.

## Source

- Own photo: https://intl.dpm.org.cn/Uploads/Picture/2023/06/20/s649169917abd5.jpg
- Identity association: https://intl.dpm.org.cn/explore/build_maps.html, the image is inside the “Gate of Manifest Virtue (Zhaode men)” entry. The cached HTML association and actual photo pixels were independently inspected by this worker.
- Photo SHA-256: `32a51f1e8116c78c9ee0efef960010eb07a60f920fa64bb9cd1bbcb859d14dde`.
- Capture date: **unknown**. The path's 2023 date does not establish the photograph date or a current-2026 appearance.
- Reference regions: broad fields roughly x=.30–.41 / .60–.70, y=.50–.65 in the 1920 × 1080 image. The full photograph remains private research input and is not in this branch, runtime assets or release output.

## Evidence and actual checks

All paths below are under `reports/r58-zhaode-south-panels/`:

- `red.tap`: four focused assertions fail before the helper exists. `consumer-red.tap`: two consumer assertions fail before that consumer exists.
- `green.tap`: **8/8** focused checks pass. Includes exact non-target and target-other-face hashes; exact collision/support/map/region/room/plaque registration hash; no surface/bounds expansion; no-target/wrong-instance/altered/shared-target failure; source replacement and final disposal; nondegenerate triangles/UVs; single merged first-hit skin; production palette bytes/UVs; unchanged open portal; all four cardinal transforms; real-controller ground-origin front 60 Hz walk/forward and rear 10 Hz sprint/backward support round trips.
- `baseline.json`: before-edit component snapshot at **1549a70b51ac184695aeebbca725ec4d809a4454**, with no plaque for inert texture unit tests. 165 → 167 source meshes; 2,964 → 3,028 triangles; 11 → 12 merged draws/materials. Collision/support/room counts remain **938 / 3 / 0**. Bounds remain min [−12.668224334716797, 0, −27.100000001490116], max [12.668224334716797, 16.15999984741211, 27.600000001490116].
- `comparison.json`: actual merged production-HD-albedo export with plaque enabled. **2,978 → 3,042 triangles; 13 → 14 draws/materials**. Both before and after have zero nonfinite coordinate values and zero degenerate triangles. Global bounds and all non-target signatures are unchanged. Material and texture increase is one each; no performance/FPS claim.
- `before-south-cpu.png`, `after-south-cpu.png`, `before-oblique-cpu.png`, `after-oblique-cpu.png`: actual same-camera geometry, actual production albedo and the actual DataTexture palette sampled by actual UVs. The worker viewed these images. These are **CPU diagnostics, not browser/game screenshots**. They exclude source-photo pixels, PBR shading, tone mapping and cast shadows. Camera/FOV and source file hashes are in `comparison.json`.
- `baseline-retained.tap` and `after-retained.tap`: the existing `tests/current-state/zhaode-gate.test.mjs` remains **13/15**, with exactly the same two failures already present at the assigned **1549a70** baseline. One old test assumes only two gate-join rows globally, while the current data has four; the other expects the old V6 熙和门 byte hash, superseded by this cycle's separate authorized Xihe work. Neither historical expectation was changed, and neither is attributed to R57. This patch does not claim that suite passes.

No full world, production build, full suite, packaging or browser was run. No denied Chromium/bwrap operation was retried. No remote branch, main, Pages or credentials were changed.

## Integrator commands

Focused local checks:

```sh
node --test tests/r58-zhaode-south-panels.test.mjs tests/r58-zhaode-panel-consumer.test.mjs
node --test tests/current-state/zhaode-gate.test.mjs # two known baseline failures above
```

Pure existing-world consumer, after the integrator's one normal W construction:

```js
import {assertZhaodePanelsInWorld} from './tests/lib/r58-zhaode-panel-world-check.mjs';
const result = assertZhaodePanelsInWorld(W);
```

This consumer constructs no world, scene, actor, floor or registration. It reads actual merged first hits, palette data and UVs, preserved rear/inside/foot/lateral surfaces, portal body clearance and the existing three support identities. It does not make an acceptance claim. The isolated consumer tests use a single real gate, not another whole world.

Recreate a candidate CPU export with `node tests/r58-zhaode-south-panels-cpu.mjs /tmp/zhaode-after after`, then use `tests/r58-zhaode-south-panels-raster.py` with the camera coordinates from `comparison.json`. The exporter uses the already available CPU canvas package, configurable through `R58_CANVAS_MODULE`. Before images bind the unmodified 1549a70 production hashes. After images were captured on test commit 4422a4b plus the exact production hashes now committed in **ded029c64ec9f0dc454adf9bcf2371d8d359cc2c**. They are not presented as images of an unmodified 4422a4b tree.

## Remaining work and integration state

The two field color-zone differences are implemented, but actual browser/game same-camera before/after comparison is still required. Keep the exterior aggregate PARTIAL and this feature VERIFY_PENDING. Do not mark the narrow lattice, unseen north/side faces, ceiling/interior, nameboard or whole gate accepted. Canonical queue/source/difference records were not edited by this worker; the integration owner may attach this bounded result to the existing object and feature entries without creating another entity or shrinking its required scope.

Reversible commits: **4422a4b** (baseline/red tests and exporter), **ded029c** (surface implementation, focused consumer and CPU evidence), followed by the documentation-only handoff commit. Reverting the implementation commit removes the helper hook and restores the original shell rendering; do not use the deliberately red test-only intermediate commit as a release candidate.

The independent integration owner read the complete helper, hook and existing-W consumer and viewed both after images. No blocking issue was found for this bounded partial result. The review requested only a precision edit to the helper comment: rejected input performs no GPU-resource allocation/mutation, but validation does allocate temporary JavaScript arrays/vectors. That comment-only change is in the handoff commit; the captured production geometry/material/UV parameters are unchanged from ded029c. Browser/game acceptance remains pending.
