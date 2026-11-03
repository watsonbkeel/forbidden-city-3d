# R163 / H43 英华殿西耳殿 FC-BA2BB4F70D

Base: f4ec6882e7105201b9a8708de37cf8865705c01e. Local isolated development branch only; no upload, push, main change or deployment.

## Delivered scope
- South-facing three-bay, yellow hard-gable west ear hall, 10.2m × 6m fitted body at (299.6,483.8), front aligned with the retained main hall at z480.8. Four closed middle door leaves, four sill-window leaves per side bay and a coarse diamond-lattice interpretation.
- All sizes, heights, colors, hidden faces, roof profile, closed pose and stonework are reversible model fits. Header/window backing is plain fitted color, with no invented large gold-painted decoration or plaque.
- Local estimated west court wall only: z473..490.5 moves from x302 to x306.5 with two real full-height return walls. Original west wall outside that interval and all south/north/east boundaries stay fixed. The first 6m-cut proposal was rejected after CPU views showed it hiding a bay.
- Actual mesh-owned solid collision, three real stone top surfaces (platform .3m, approach steps .1/.2m), no ramps/rescue surfaces, no new map items/rooms or invented interior access. Front plinth was deepened .6m after real-controller tests showed the earlier ledge stopping short of support at closed-door clearance.

## Source support
- https://www.dpm.org.cn/explore/building/236568.html: three-bay ear halls, yellow hard-gable roofs, four middle doors and four windows in each side bay.
- https://img.dpm.org.cn/Uploads/Picture/dc/8420.jpg: own west-side gallery photograph, partly hidden by trees. The large adjacent roof belongs to the main hall.
- https://img.dpm.org.cn/Uploads/File/pdf/88/89/92/888992eeedc46dea9c3432f8d88052fc.pdf: measured-structure study states that ears and main hall form one east-west line. South-facing identification is a photo/topology inference, not a separately measured orientation record.
- Source image was inspected locally, not redistributed in this commit.

## Fresh verification
- `node --test --test-concurrency=1 tests/r163-yinghua-west-ear.test.mjs tests/r163-yinghua-west-ear/world.test.mjs`: **9/9 pass**. See final-suite.tap and world.json.
- Normal production ZoneManager/CollisionManager + real FirstPersonControls: 16 successful route/stand cases at 30/60fps, walk/sprint. New approach/ledge/front-lateral cases have zero body contacts. The .3m real ledge is reached and settles correctly.
- Eight continuous negative exit attempts at new south/north wall joints, west dogleg and closed doors are blocked with zero body penetrations. Nine separate closed-boundary probes pass.
- Original main-hall route endpoints and transient contact counts (1,2,3,2) are exactly retained against an independent detached f4 baseline. Those pre-existing stair contacts are disclosed, not counted as new-ear success.
- `npm run build`: pass, existing >500kB chunk warning remains.
- `npm test`: unavailable in this base package (no test script). No claim of a repository-wide green test command.
- `node --check` and `git diff --check`: pass.
- Four CPU previews generated from the normal production ZoneBase merged geometry and actual HD albedo, with source SHA256 in cpu/proof.json. These are CPU z-buffer diagnostics, not browser/GPU/mobile acceptance.

## Deliberate limits
- No measured ear-hall dimensions, full front/back photographic coverage, exact lattice/carvings, surveyed stair count, current admission permission or whole-object acceptance.
- The main hall is retained at its existing wider envelope; the ear hall and local courtyard bulge are engineering fits, not a complete surveyed compound reconstruction.
- The shared gable builder emits four zero-area visual triangles; they are ignored while constructing actual solid collision. No shared roof builder was altered for this task.
- Browser/GPU/mobile rendering and helicopter interaction remain unverified. Existing generic older walls outside the changed interval retain their original low collision proxies; only the three new dogleg walls use full real mesh collision.
