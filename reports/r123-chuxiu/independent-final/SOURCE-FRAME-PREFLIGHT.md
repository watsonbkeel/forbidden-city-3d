# R123 source / parent-frame preflight (read-only)

2026-10-27. Product tree `r123-chuxiu-rear-frame`, based on accepted R120 `f0dea01abf8e809ba1f476f9bfd13fa945a1e518`. No product writes, scene/world construction, or new numeric frame approval by this reviewer.

## Source actually inspected

- `r123-r126-source-preflight/REPORT.md`, particularly §1 and §5.
- Official 2024 PDF, page 4 / printed 258, the entire rendered page and Figure 1. It shows the ordered compound and an independently enclosed rear court: Lijing at its north, Chuxiu at its south, Fengguang east and Yilan west. It has **no scale bar**. The unnamed narrow rectangles adjoining Lijing's ends do not prove current ear-room door locations or traversability. Red article outline is not wall thickness.
- Actual independent 600×338 official group covers 63 and 60: central door zone, separate flanking sill-wall windows, three-bay front, hard-gable roof, low stone platform/short central steps, and adjoining red-wall fragments. They are not mirrored copies. Fine plaque reading/current opening states/back elevations/depths remain unverified.
- Raw official metadata `vpGroupDetail-63.json` explicitly identifies Lijing's front east wing facing west, three bays, central opening, flanking sill-wall lifting windows; `-60.json` separately identifies front west wing facing east with the same stated type. The latter metadata itself uses both 猗兰馆 (hotspots) and 猗兰室 (group/node). Keep this official name variation; do not invent a second building or a new plaque inscription.
- The source researcher’s 360° WebGL failure is not an inspected panorama. No full-360 or 2026 post-restoration photo date claim is adopted.

**Preflight conclusion:** enough evidence for a coherent two-rear-wing shell/three-bay facade/steps/court-arrival candidate; not enough to mark all ear-room bodies and through-doors complete. Local UNKNOWNs should remain local rather than blocking the proven two-wing group.

## Existing model-space constraints, not surveyed dimensions

From fresh `data/zones/west-six.json`:

- Main Chuxiu at `(94.8,434.3)`, `27.1 × 13.8`: rear wall Z = 441.2.
- Lijing at `(94.5,450.2)`, `26.2 × 12.9`: south wall Z = 443.75. Only 2.55 m wall-to-wall separation remains. That cannot honestly represent the shown full rear court plus two three-bay side facades simply by inserting old front-wing shells.
- Lijing north wall is 456.65; its nominal pad reaches 457.25, already beyond the legacy region/court north bound 456. The separate Chonghua court begins at Z460 over overlapping X. No silent north-bound expansion or encroachment is justified.
- Existing front wings are Z422.0, not inherited pre-R113 423.1. Their identity/offset-fit contract is explicit.
- Roof overhangs, step runs, true collision/body clearance, and neighboring passage widths have **not** been proved by these arithmetic bounds. A proposed new parent frame must list all of those separately; bare hall rectangles are insufficient.

## Actual relocation dependencies found

| Source | Current binding | Why JSON-only/parent-only translation is unsafe |
|---|---|---|
| `SharedRestSlots.js` | Exact main frame 94.8/434.3/27.1/13.8/.6; finished bed bounds X103.7399978638..107.5400009155 / Z438.0499877930..440.75 / top1.0499999523; slots X106.19/105.09, Z439.4 and approach Z437.3 | Must rebind real final Float32 six-face solid/top coverage and owner identity, not loosen checks or keep stale absolute slots |
| `night-beds.json` | Three Chuxiu beds, privacy screen, room/approach bounds and shared-rest area are world coordinates | Update jointly if main frame moves; do not duplicate translation on anchor-relative paths/seats |
| `emperor-night-route.json`, `night-routes.json` | Emperor 2077 points, including 139 points with Z≥414.8; ending at absolute `[106.19,1.05,439.4]`; other actors have their own nighttime routes | Reconnect real entrance and bed approaches; final arrival alone is not a continuous-body route proof |
| `ChuxiuCourtyard.js` | World-space `CHUXIU_COURTYARD_FIT`, explicit main/Tihe/front-wing envelope checks, posts/slabs/ramps/routes | Not a local child that follows a changed main frame automatically |
| `ChuxiuSideAccess.js` | Exact original wall boxes, main frame, Z429.3..441.2 and local scope tied to Z427.8..430.2 | Preserve the two verified turn interfaces with actual new owner registration |
| `RearHallProfiles.js` | Exact Lijing X/Z/W/D with canonical named identity | A moved rear hall otherwise throws; change approved profile and declaration together, not all-profile tolerance |
| `LijingWestRoom.js` | Explicit item index24/frame; original 8-mesh/8-collider removal; old room bounds; local furnished composition | Recheck exact source removal and final room bounds under new frame; do not leave orphan old generic inventory |
| `LijingRoomSupport.js` | Exact floor `[80.8,108.2,443.15,457.25]`, region and probe `(99,448)` | Derived support must follow the same new real hall floor; no invisible old floor or merely renamed owner |
| Zone/item identities | Lijing index24, front wings25/26 and persisted names/IDs | Append or explicitly preserve identities; inserting two new wings before old indexes is not harmless |

Also reconcile map/teleport anchors and actual windows/doors/roof/pad bounds. This is a bounded dependency list, not a claim that every runtime consumer has been exhaustively tested.

## Required meaning of the next small plan

- One explicit, reversible model-fit frame decision, with source fact / photo fit / engineering-fit numbers kept separate. No exact movement value is approved in this note.
- Main route, actual R118 west-northwest shared bed/two adults, daytime north kang, other two maid beds, privacy screen and both side approaches retain their functions. Main-hall movement is allowed only with coherent rebinding, not by declaring these legacy fixtures expendable.
- New two rear wings are actual source-owned geometry/doors/steps with an independent rear court; no hidden broad collision walls filling doors, no pseudo-history route, no generic unverified ear doors.
- Normal upfront all-ready preparation remains the user contract. No new first-visit waiting/preparation UI or lazy-load exception is introduced by this review.
- After a concrete frame exists: source-bound actual-ready before/after visual review, targeted full-body route/door/support tests, R118 lifecycle/source-mutator protections and aggregate resource cost. Existing success on old absolute coordinates is not a current-hash pass after relocation.

## Writer's preliminary direction reviewed at 06:25 UTC

Writer proposes studying an approximately 5m southward translation of main Chuxiu plus both existing front wings, while Tihe and Lijing stay put and the courtyard gallery's north connection shortens. New rear wings might be about 10m along Z by 5–6m deep near X77 / X112. **No exact values are approved or implemented by this note.**

This is not topologically contradicted by the source diagram and avoids silently pushing Lijing into Chonghua. Two preliminary arithmetic risks were returned to the writer:

1. A 10m side facade is longer than the resulting approximately 7.55m axial wall gap. Its ends therefore need a deliberately shown lateral overlap beside the main/Lijing volumes; this cannot be hidden by a center-distance table. Check Lijing's real pad/south windows and separately label any future ear-room reserved envelope.
2. At approximate X77/112 and depth6, inward faces are about X80/109. Against the actual old main side-wall exterior X80.9/108.7, overlapping-Z gaps can be only about .9/.3m before platform/door-step protrusions. These are not full-body passages. They are warnings about this rough parameter family, not a declaration that the whole direction is impossible; use actual final faces and a coherent pair of placements/depths.

The front wings' southward move also enters the old Z409.5–414.8 linking band, as the writer already noted. The existing corridor contains world-specific slab breaks and landings, not merely one movable north endpoint. Main/body/entrance and Tihe exit continuity need actual updated geometry checks. No new source claim follows from these engineering estimates.

## Actual-ready baseline read at 06:31 UTC

Writer's fresh full West-six export is source-bound to 8938 before/after, with 43 real image requests/0 errors. I personally viewed `top-north-up-before-high.png` and `rear-court-ground-before-high.png` and read its actual mesh/collider inventory (not a new world run). `ready-baseline-readback.json` retains the file hashes and compact frame bounds.

Actual main render Z is 424.55271797..444.04728203; Lijing render Z is 441.48270054..458.91729946. Thus their present **Z projections** overlap by 2.56458149m, which is not alone a triangle-intersection assertion. A hypothetical -5m main translation would leave only 2.43541851m between those roof projections, not the 7.55m wall gap. This is a concrete reason to review actual eave/side-wing joins rather than wall-center distances alone.

The two current front-wing render X bounds already reach 73.07232172..83.56767828 and 106.03232172..116.52767828 beyond nominal courtyard X73.8..115.8. These are inherited eave envelopes, not automatically new body collisions or permission to extend new walls. After southward translation, the actual heights/triangles near the slanted connecting wall need a local check. No global zero-AABB-overlap requirement is introduced.
