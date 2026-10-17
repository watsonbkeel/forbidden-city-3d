# 体仁阁 / Tiren Pavilion — V4 measured profile

## Evidence and scope

- [Palace Museum building entry (S12)](https://www.dpm.org.cn/explore/building/236453.html), reviewed 2026-10-14; [its own oblique photograph](https://img.dpm.org.cn/Uploads/Picture/dc/1534%5B1024%5D.jpg). Capture date is unknown; it does not prove current visitor access.
- 杨新成,《故宫弘义阁、体仁阁研究》,《故宫学刊》2006, [official PDF (H01)](https://www.dpm.org.cn/Uploads/File/2019/11/14/u5dcd2fd72ceee.pdf): Tiren Figs.2,4,6,8,10,12, printed pp.171,173,175,177,179,181; PDF pages50,52,54,56,58,60. Metres are transcribed from labelled millimetre column-centerline dimensions.
- V1 established a genuine two-storey structure, enclosure and upper gallery. V4 supersedes its provisional44.1×12 m footprint,3.2 m plinth and arbitrary height split with Tiren's own independent survey record. It is not a 2026 conservation reconstruction. Museum assets remain research-only, outside runtime/deployment.

## Independent geometry

| Object | Tiren constraint | Status |
|---|---|---|
| Lower principal grid | 43.712×16.736 m; width4.320 / 4.768×3 / 6.464 / 4.768×3 / 4.320; depth4.320 / 8.096 / 4.320 | Own Fig.2; subsidiary intervals summed explicitly |
| Upper outer-support lines | Rear42.640; front42.644 m; depth15.600 | Dimensioned, Fig.6 |
| Upper principal shell | Rear39.680; front39.684, after removing each1.480 m gallery offset | Derived, Fig.6 |
| Front end intervals | Page-left2.308; right2.304; central seven run35.072 | Derived from own front chain |
| Upper depth lines | Shell±6.320; outer supports±7.800; inner frame±4.048 | Derived, Fig.6 |
| Gallery | 24 square posts: ten front, ten rear, two intermediate per end | Own evidenced topology |
| Waist outer support span | 41.650×14.610; peripheral offset0.985 | Dimensioned, Fig.4 |

The front shell has nine intervals: seven opening bays with28 lattice leaves and two closed end intervals. It is not a seven-bay-wide box. Enclosure, outer post line, deck edge and roof edge are separate. Four-millimetre front asymmetry is preserved with plan u→localX=−u, not averaged away. The rear is a solid conservative wood enclosure, without invented front-style doors/windows.

The inherited anchor remains x−98.4,z−109.3, facing west(+X). The existing2 m difference from data/anchors.json is not silently reconciled. No other building anchor is moved. `buildTirenPavilion` remains a compatibility entry point selecting the Tiren measured profile; old w/d/ph/storey-height arguments no longer override its survey geometry.

## Datums and evaluated surfaces

The chosen front-court worldY0 maps the lower interior floor to+3.800:

- Lower eave+6.350 → world10.150.
- Upper wood floor+9.795 → world13.595.
- Upper eave+13.910 → world17.710.
- Main ridge-cap crest+20.260 → world24.060; rear ground−3.770 → world0.030.

These are separate survey reference objects. Tests inspect physical floor surfaces, generated lower/upper eave vertices and a vertical ray onto the actual central ridge-cap crest, rather than merely checking roof input parameters. The tile meeting surface is lower by the shared generator cap rise3.324×ridgeRadius; it is not the measured ridge endpoint. Tiren’s Fig.10 section uses a detached +20.260 leader; assigning it to the central cap crest is a source interpretation from that alignment and the paper’s parallel Hongyi presentation. Fig.12 does not independently repeat this leader, and this is not a new survey. The low-detail generator omits chiwen, so ornament-height fidelity is not accepted. Column tops remain independently adopted joints below the roof system. The museum overview25 m has unspecified endpoints;24.060 is ridge-to-forecourt arithmetic, not its replacement or an ornament-height explanation. The mesh is not stretched to25 m.

Tiren's terrace paving spot is UNKNOWN. World3.700 is explicitly adopted from the shared approximate narrative; it is not copied from Hongyi as a measurement. The+0.255 annotation belongs to a small interior wooden stair platform, not the terrace. Global rear terrain is unchanged; the measured0.030 m rear-ground difference stays in metadata.

Actual upper flooring, square-brick gallery paving, stone coping, wooden rails, glazed fascia below the deck and the supported waist layer are modeled independently. Principal columns continue through the structural zone; short columns/brackets and beams carry the gallery. Waist endpoint spans are exact, while individual mapped short-post positions are provisional. The lower eave is an open-centered annular roof over a supported bracket ring, not another occupied storey.

## Terrace and movement

The63.3×27.5 m rectangle is a declared adoption of H01's shared two-pavilion narrative, with provisional exact corners/building offset. It is not a second independent terrace survey.

- Two actual32-tread flights face Taihe square and flank the approximately2.3 m imperial stone strip. Both are playable; neither depends on walking over the strip. Adopted flight width2.6 m and run10.24 m remain provisional.
- Own plan orientation places north ridged incline and south steps on the correct opposite ends from Hongyi's local drawing. Their about4.9 m width and0.9 m vertical difference are shared narrative. Provisional short runs lead to guarded2.8 m landings, with non-rescuing walk surfaces. Onward veranda connectivity is deferred; surrounding ground-level corridors are not raised or claimed to be surveyed-height decks.
- Guards are visibly architectural game-safety approximations, not 2026 barrier evidence. No invented upper public stair/access or rear door. Explicit enter:true opens only the lower central double door and registers exactly one room/region. Reference closed state registers none.
- The narrow east wall replacement is43.212 m, terminating inside the physical rear/side shell. It is not a full63.3 m terrace breach. Only two touching corridor endpoints change toz−141.750/−76.850. Ground and terrace-height attempts cannot cross the closed rear; exact JSON/helper interface values are tested.

## Runtime contract and limitations

`structure:'surveyed-pavilion'`, `pavilionProfile:'tiren'` selects the reusable assembly. `pavilionGeometry(item)` exports the source arrays, source statuses, independent datums, room bounds, terrace outline, front flights, side landing xOuter and both local/world approach point sequences. CourtKit batching preserves the full record in `userData.architecture`.

Resources use existing shared library materials, roof generators and the kit's square-brick floor resource. No museum textures or PDF imagery are copied. Disposal tests protect shared materials/textures and release merged geometry/kit-owned resources.

Roof and deck edge offsets, outer-gallery slope, detailed rail/column sizes, joinery coloration, roof curvature/ornaments, side landings and carved-strip ornament remain provisional. Hongyi's0.800 m rail and0.765 m fascia are not assigned to Tiren as measured detail. Current complete rear photographic acceptance remains UNKNOWN.

Focused verification: `node --test tests/current-state/surveyed-pavilions.test.mjs tests/current-state/tiren.test.mjs`. It covers independent arrays and generated references,9/7-openings-plus-closed-ends,24 supports, actual floor/gallery/waist structure, both front flights, guarded side access, closed rear seams, room/map metadata and disposal. CPU projections inspect actual generated geometry only. Browser visuals, runtime routes and the unchanged original performance limits remain the integrated V4 gate.

The waist load path includes two explicitly provisional bearing tiers: transverse timber ties bear on the actual lower perimeter beams, principal continuations support longitudinal beams, and transverse/cantilever beams carry all24 short posts. Per-post contact rays and beam/column intersection tests guard against floating members. The short-post base is adopted as upperFloor−2.2 m and is deliberately separate from the measured stair-landing annotation. Neither tier's joint height, section or individual member position is claimed as surveyed.
