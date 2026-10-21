# R32 皇极门：三门七楼基本形制样板

## Scope and evidence

This bounded correction replaces the inherited five-bay timber hall identity with a dedicated glazed wall-gate assembly. It does not claim a measured reconstruction or completion of the ceramic ornament.

- Official entry: [皇极门, Palace Museum](https://www.dpm.org.cn/explore/building/236451.html), inspected 2026-10-19.
- Official south-oblique photograph: [皇极门全景](https://img.dpm.org.cn/Uploads/Picture/dc/4656%5B1024%5D.jpg), inspected locally.
- The Museum identifies three south-facing, arched, glazed wall gates on a marble Sumeru base. The middle tower is highest; the two secondary towers are lower. Two smaller gabled interstitial towers and two outer towers complete seven roofs. The outer towers combine an inner gable with an outer hip.
- The photograph supports the shallow masonry assembly, three visible arch openings, yellow roof silhouette, coloured glazed bands, pale base and suspended posts. It does not supply precise dimensions, an orthographic arch profile, a rear-face survey, or permission to use a generic hall/throne.

## Retained and fitted geometry

The existing anchor remains x=-293.2, z=154.1, south-facing, with a 23.7 m masonry replacement span. The width is inherited model fit, not a newly documented survey value.

All dimensions, arch curvature, roof curvature/overhang, ridge sizes, colour matching, marble moulding sections and door-leaf poses are labelled `MODEL_FIT_NOT_SURVEYED`. The nominal body depth is 2.2 m; three portals have local x=-7, 0, +7 and clear widths 3, 3.6, 3 m. The arch rises are respectively 1.45, 1.65, 1.45 m above fitted spring lines. These values make a bounded, testable silhouette and do not imply historical centimetre accuracy.

Seven actual roof shells, left to right:

1. Outer hip / inner gable edge roof
2. Hipped secondary roof
3. Gabled interstitial roof
4. Higher hipped main roof
5. Gabled interstitial roof
6. Hipped secondary roof
7. Inner gable / outer hip edge roof

The three main/secondary roofs and four lower roofs are distinct geometry. The roof test examines actual surface vertices at both ends, so roof-form metadata alone cannot pass it. Curved shell surfaces have closed fascia/underside geometry and finite face-projected UVs. The bounded detail uses substantial glazed colour partitions and simplified hanging posts; it does not reuse timber painted-beam imagery as supposed ceramic relief.

No physical nameboard is added because this reference does not establish its lettering or placement. The existing map name remains 皇极门; dimensional and detail-status labels survive material merging in architecture metadata.

Three visible openings have full-depth faceted arch intrados, physical piers, and playable-open side leaves. Ground passages remain at y=0 without an invisible platform rescue. This is a game-navigation state, not a statement that museum visitors may use all three doors. Door-leaf height/shape is simplified. The broad Sumeru section is present, while its exact moulding profile/carving, exact bracket sets, relief patterns and rear-specific details remain explicit future work.

## Material review correction on da07bdf

The first production view correctly read as three arches and seven roofs, but the shared `stone_slab` material rendered the base as grey paving and the narrow green strips did not express the substantial ceramic header. Reinspection of the same official photograph establishes that large red backing areas also remain between the arches; turning the whole body green or yellow would invent a different surface arrangement.

The correction therefore changes material zones and their coarse geometry, without changing the retained opening/court contracts:

- Each of the seven headers has two green fields and a blue-green field separated by ochre ceramic mouldings, extending approximately 1.07 fitted metres below the former header datum. The upper cornice meets the roof underside. Colour balance and layer dimensions remain fitted, not colourimetrically surveyed.
- Suspended post terminals remain visible beneath the broader headers. Their simple outline does not reproduce the lotus carving.
- Dedicated matte terracotta-red backing replaces the generic rough-plaster texture; red remains where the official photograph supports it. It is explicitly backing, not a claim that all red surfaces are glazed.
- A dedicated warm-white marble material replaces `stone_slab`; it loads no paving, brick, normal or photographic texture. Ten continuous base pieces have eleven section-height controls forming a projecting lower foot, recessed waist and spreading upper mouldings. Projections extend along the wall depth only, preserving every clear portal width and the complete 23.7 m replacement span.
- The rear repeats this bounded surface partition provisionally; an independently surveyed rear elevation is still unavailable.

The 64 existing collision boxes are byte-identical to da07bdf (SHA-256 of ordered min/max arrays: `ce9908949d8d19cd225fafbf8218bd5e6cc34a9d16e59376b877be64ba5ea3ee`). Existing wall seams and all three passages remain physically unchanged. Marble moulding projections are decorative relief over the retained collision envelope, not new walkable steps or a raised gate floor.

Two new material/profile tests were observed failing first against the old narrow-strip and shared-stone materials. A further failing clearance assertion exposed hanging terminals hidden inside the broadened header; the fitted posts were extended accordingly. Focused verification now reports **11 passed, 0 failed**. Tests raycast actual front and rear material partitions, inspect the real pale marble material and projecting/waisted geometry, preserve the collision hash, and rerun all existing aperture/roof/budget checks. No aggregate suite or browser run was performed for this review correction.

## Integration contract for the single integration owner

Owned implementation: `src/scene/palace/special/HuangjiGate.js` exports `huangjiGateGeometry(item)` and `buildHuangjiGate(kit,item)`.

1. Change only 皇极门's gate identity to `gateProfile: 'huangji'`, `gateKind: 'three-wallgate'`, `style: 'wall'`; retain x/z/w. Give its status an explicit topology-corrected / dimensions-fitted description.
2. Dispatch to `buildHuangjiGate` before the existing catch-all `gateProfile` side-gate branch. It returns the FULL 23.7 m assembly replacement width. Store its frame's `userData.gateGeometry` when needed.
3. Keep the named 皇极门横墙 gap at -293.2 referencing 皇极门. The returned width removes the whole old wall segment; the dedicated assembly itself supplies all four continuous groups of piers between and outside the three openings. Do not return 3.6 m, which would leave the flanking passages blocked by the old wall. Do not cut three apertures and also retain overlapping old wall inside the replacement assembly.
4. `gateGeometry.wallReplacement` identifies the full world-space cut. `wallOpenings` separately lists the actual portal centres/widths: (-300.2, 3), (-293.2, 3.6), (-286.2, 3). These are different contracts by design.
5. In the collision-world gate helper, add the Huangji profile before `sideGateGeometry`: front=1.8, rear=2.4, platformY=0, direction=[0,1], local portal centres [-7,0,7]. Existing callers needing `profile.toWorld` may derive it from the retained x/z and zero rotation.
6. Add or run combined production-dispatch tests after integration: all three openings, both directions, with the actual named court wall. The standalone tests already exercise the same real `CourtKit.wall` and `CollisionManager`, but do not substitute for final ZoneBase/data wiring.

The surrounding horizontal wall retains its existing h=6.5 and endpoints. It therefore rises above the fitted low outer roof units. The seam is physically continuous and collidable, but this height relationship remains provisional; no new court-wide survey claim or silent adjoining-wall relocation is introduced.

## Verification and budget

Test-first evidence: the eight new tests initially failed for the missing dedicated builder/geometry contract. After implementation, all eight pass. They cover:

- Unchanged anchor, full replacement width, dedicated identity, absence of room/throne or invented nameboard
- Real rays through three clear apertures at several offsets/heights in both directions
- Upward rays showing curved arch intrados rather than a flat painted lintel
- Seven distinct roof meshes, ordering, stepped heights and real hip/gable end geometry
- Actual-controller crossings through all three wall-connected portals in both directions, including lateral offsets
- Blocking piers/walls and continuous outer contacts, with exactly three open ground intervals
- Merge-surviving source, fitted-dimension and visitor-policy disclosures
- Finite geometry/normal/UV attributes and a conservative budget

Commands run before shared-file integration:

- `node --test tests/huangji-gate.test.mjs`: 8 passed, 0 failed
- Huangji plus Ningshou wall/topology/orientation and east/west gate tests: 24 passed, 0 failed. Existing whole-world tests in this run still used the pre-integration dispatcher.
- `npm run test:current-state`: 1,009 passed, 1 failed. The failing `tests/current-state/taihe-core-geometry.test.mjs` aborts in the historical R29 dependency guard for `data/zones/east-six.json` (actual hash 054455ab… versus retained 0fa50e51…). It reproduces independently; this worker neither edits that data nor relaxes the guard. The integration owner must reconcile the approved finite source delta.

Current measured standalone budget after material review: **4,070 triangles, 127 mesh objects, 64 collision boxes, 0 walkable rescues and 0 new texture loads**. Material merging yields **7 meshes**. The first topology-only candidate was 3,170 triangles / 112 objects / 6 merged meshes; the material correction adds 900 triangles and one merged material. The old five-bay gate measured 2,246 triangles, 58 objects, 26 colliders and 13 merged meshes. Whole-zone material sharing and browser frame-time still require integrated verification.

No browser, external Git write, upload or deployment is performed by this worker. A locally inspected CPU triangle-only preview checks the basic silhouette and contacts but is not evidence of production lighting, texture rendering, accessibility or final browser performance. Final combined south elevation, northeast oblique and near-portal browser views remain with the integration owner.
