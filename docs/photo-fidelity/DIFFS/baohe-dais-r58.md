# FC-58A3300503 · Baohe three-flight dais, R58-A local partial

## Source and scope

The existing R21 display target is retained: [Palace Museum-contributed Baohe interior](https://artsandculture.google.com/asset/hall-of-preserving-harmony-baohe-dian-interior-the-palace-museum/pgFXua5sp2QCug?hl=zh-cn). Its selected image was actually viewed in this work; SHA256 is `04e2bd5c1794f7fc6c65c6bbf70932d3c7313e239816deb8ad867373cd1338ae`. Photography date and current display date are unstated. The original remains in the pre-existing private reference cache, not in this branch, public assets, or evidence attachments. `SOURCE-VIEWS.json` and `THREE-HALL-GAP-MATRIX.md/json` in the three-halls review informed this change. The global execution rules and complete Baohe entry of `MASTER-PROMPT.md` were read, as were the existing Baohe components.

Visible source feature → previous model → bounded replacement:

- A broad raised stage with a wide middle stair and narrower left/right front stairs → two generic raised boxes with one narrow three-box decorative stair → one broad stage, three physically independent six-tread flights.
- Balustraded flight divisions and outer edges → no dais rails → plain, self-authored posts, lower rails and capped rails along flight edges and stage sides.
- Raised chair/screen contact → existing base datum y+1.25 → unchanged chair/screen geometry, x/z anchors and that datum, with a real continuous supporting stage.

This is PARTIAL geometry, not an accepted interior or a complete A-section result. The wider footprint and all stair/rail dimensions are PHOTO_FIT. Six treads, 3.06m run, 1.2× the former dais width, 0.72m rail height and simplified stepped rail caps are not surveyed measurements. Continuous inclined rail profiles, carving, exact rail post layout and the rear return remain unverified. Do not replace the source target with the older bright-yellow-tread photograph. No new vessels, furnishings, rear rail, room, column, door, roof or character were introduced.

## Local topology and physical contract

- Retained stage/chair/screen top: y+1.25. Retained rear edge: ztb1. Retained chair center: `(x0, y+1.25, (ztb0+ztb1)/2 + 0.1*(ztb1-ztb0))`.
- Width: `1.2*thW`; current width 10.6026666667. Central flight width 4.0; side flight widths 1.6, centered at x0±4.3. All dimensions are reversible photo fits.
- Stair toe: ztb0−1.9; stage front: toe+3.06. The first trial used toe=ztb0−1.5. Eight complete-single-hall 10Hz side routes then failed to turn near the retained columns. Their red evidence is preserved. Moving only the new approach and front stage edge south 0.4m produced a genuine landing/turning space while leaving the columns, vessels and furniture unchanged.
- Every tread is a closed rectangular solid down to the hall floor, and its exact horizontal top is a box support with `rescue:false`. No invisible smoothing ramp, enlarged collider, or controller tolerance change exists.
- The six stair rail lines and two outer stage rails are composed of visible rectangular pieces with identical collider boxes. The stepped handrail silhouette is intentionally unfinished, rather than an unsupported claim of exact inclined carved joinery.
- The former enclosing `x0±thW/2, y..y+3, ztb0−1.3..ztb1` collider is omitted only for Baohe. Existing furniture gets ten bounded solid proxies: six true BoxGeometry parts, three inscribed lower screen cores and one rectangular lower chair-back core. Curved decorative crowns are not inflated into air boxes.
- The stage's north face is a real vertical solid ending at ztb1; support ends at that same edge. There is no invented rear balustrade or invisible fall barrier. The rear room passage remains floor-height and unobstructed. Descending off an unrailed rear edge remains a real drop, not a floating support.
- The normal R21 bronze vessels, rear columns and remaining hall obstruct routes exactly as before; no route is made green by deleting them. Access here means a virtual model contract, not permission to enter museum display areas.

## Preserved scope and exact delta

`reports/r58-baohe-dais/exact-delta.json` is authoritative. It stores the six removed mesh streams, old collider, all new collider/support bounds, retained furniture streams, owner source hashes and retained full-hall hashes.

- Six old generic meshes / 72 triangles → 241 visible rectangular pieces / 2,892 triangles. Net +2,820 triangles, three private material batches after production merging, zero new textures.
- 241 dais solids + 10 existing-furniture proxies − 1 obsolete air box = net +250 colliders.
- Exactly 19 added supports: 18 stair treads and one stage surface. All are no-rescue.
- The same-camera isolated full-hall comparison retains byte-exact geometry/material descriptors for all 178 other meshes: 137 before the targeted location and 41 after it, including chair/screen, plaques/couplets, columns, doors, warm rooms, ceiling and roof.
- Generic throne and Jiaotai calls retain their original geometry, materials, colliders and walkables. `PalaceBuilder.js`, `RoofBuilder.js`, all pre-existing Baohe modules and the remaining source tree are not edited in this worker branch.

## Verification and remaining gates

Command: `node --test tests/r58-baohe-dais*.test.mjs`.

Final local result: 108 pass, 0 fail. This includes 48 real FirstPerson routes in the isolated throne fixture and another 48 in the actual isolated complete Baohe hall, covering three flights × 10/60Hz × walk/sprint × forward/backward input × straight/diagonal travel. Every route ascends to the actual 1.25m top and returns to its starting hall floor. Sprint remains real input, with the existing test driver braking near turns; maximum observed speed is approximately 11.89m/s. Both primitive and merged-model checks cast actual rendered-side rays through all 251 new/retained-furniture collider faces and verify exact tread/landing contact. Normal production descent can retain a stair edge under its 0.3m support footprint; tests prove that rendered footprint contact rather than falsely requiring only a vertical center ray.

Other checks: original chair-leg/screen base contact; no ground-to-stage rescue; finite support rear edge; rear passage; all new collider bounds against visible geometry; duplicate/invalid input rejection; finite buffers; ≤3,000-triangle bounded budget; resource ownership, production three-batch merge and exactly-once disposal before/after merging. Source private material textures added: zero.

Original red tests are retained. Baseline R21/R22 focused tests: 18 pass. Baseline R23/R24 files cannot start because the old R29/R30 source-retention chain rejects pre-existing `data/anchors.json` hash drift. They were not changed. After owner hookup, the old R21 assertion that Baohe and generic dais navigation are identical is intentionally superseded by this source-backed localized navigation delta; that old test is not rewritten to hide the difference.

No whole-world construction, full suite, build, browser, Chromium/bwrap retry, remote upload, main change, Pages deployment or official-photo redistribution was performed. The integrator owns the one-world gate. Independent integration review remains pending.

CPU images: `reports/r58-baohe-dais/{before,after}-{front,oblique}.png`. These are actual model geometry, same respective cameras, stub-library base colors. Textures, production lighting, browser/GPU rendering and photographic similarity are not reproduced. They were actually inspected. `evidence-manifest.json` binds base, candidate owner/helper hashes and camera data. They are geometry diagnostics only; real-browser same-view before/after evidence remains VERIFY_PENDING. The full Baohe interior and A37 remain incomplete.

## Owner handoff and rollback

Apply the small `reports/r58-baohe-dais/HOOKUP.patch` to the owner-controlled `src/scene/PalaceBuilder.js`. It only imports the helper, dispatches Baohe to the new dais, encloses the untouched generic branch and registers retained Baohe furniture solids. Reverse that patch to restore the original path; the helper can remain unused or be removed separately.

The test fixture freezes the exact bf7b399 owner bytes under `tests/fixtures/r58-baohe-dais-baseline-owner.txt` with an enforced SHA256, then creates the candidate owner in memory. This remains deliberately an isolated local delta test after integration, not proof that a later integrated owner was hooked correctly. The shared parent world must use `assertBaoheDaisInWorld(W)` and `replayBaoheDaisRoute(t,W,options)` from `tests/lib/r58-baohe-dais-world-check.mjs`. These functions only consume the supplied scene/collision manager and do not construct worlds, create substitute floors or load assets. The optional replay temporarily creates normal controls and restores its mocked clock/DOM environment.
