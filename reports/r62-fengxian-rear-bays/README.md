# R62-E: Fengxian rear-hall nine-bay correction

## Scope and evidence

- Baseline: `6b396800b6a03582aebf513fcef4966e9f5d0db3`. Dedicated component implementation only; the owner supplies the early `ZoneBase` dispatch. This branch does not edit data, shared kit, ZoneBase, main, remote branches or Pages.
- Exact binding: `data/zones/east-six.json#/items/54`, stable `AUX-BF1091B523A8`, inventory `RI-BF1091B523A8`. The runtime map remains unnamed; metadata identifies the rear hall without silently renaming map/room registrations.
- Evidence: [Palace Museum, 奉先殿](https://www.dpm.org.cn/explore/building/236430.html), locally read official body text on 2026-10-23 UTC. It explicitly gives the rear hall nine bays, two bays deep, and a yellow-glazed single-eave wudian roof. Only nine frontage bays are changed here; the existing single-eave wudian remains unchanged.
- No front-hall image is evidence for this rear hall. No official image or HTML is included in this deliverable. Capture/photography date is unspecified, not inferred from URLs.
- Dimensions, equal subdivisions, column thicknesses and the generic door arrangement are retained/computed MODEL FITS, not surveyed or photo-fitted dimensions. The text is not used to invent nine interior shrines, furniture inventories, windows, five passage openings or a connecting corridor.

## Exact implementation boundary

`resolveFengxianRearProfile(zoneId, item, itemIndex)` selects only `east-six` index 54 and rejects any change, missing field or additional field relative to the original declaration. Other indices/zones return null. `buildFengxianRearHall(kit, item, itemIndex)` calls the existing `CourtKit.hall` with the original parameters and only `bays: 9` added.

Unchanged original values: x=-182.5, z=283.4, w=51.6, d=20, pad=1, ph=0.9, colH=7.36, roof=wudian, map=hall; default south-facing, one eave, one room and existing entrance behavior remain. No explicit survey interpretation is added.

For integration, import the builder and call it before the generic/remaining-hall branches. Use `this.zoneJson.items.indexOf(item)` for the actual index. When the result is non-null, return it through the owner's ordinary nameboard wrapper. Independent furniture cleanup is separate and may update the interior residual label to a withheld-but-unverified state.

## Actual dependent changes, not a columns-only claim

| Component | Before | After |
|---|---:|---:|
| Frontage bays | 15 default | 9 explicit |
| Equal bay width | 3.44 | 5.7333333333 |
| Front + rear eave-column meshes | 32 | 20 |
| Column top radius | 0.2408 | 0.34 |
| South closed panel meshes | 14 | 8 |
| South closed panel width | 2.9584 | 5.0533333333 |
| Folded entrance leaf count | 2 | 2 |
| Folded leaf width | 0.8944 | 1.4906666667 |
| Folded leaf absolute X center | 1.3992 | 2.4466666667 |
| Folded leaf local Z center | -9.3528 | -9.0546666667 |
| Center threshold width | 2.9584 | 5.0533333333 |
| Stair tread / ramp width | 3.612 | 4.6 |
| Stair side-stone absolute X center | 2.006 | 2.5 |
| Source assembly meshes | 81 | 63 |
| Actual indexed triangles | 3072 | 2424 |
| Registered colliders | 58 | 40 |
| Registered walkables | 2 | 2 |

Column and closed-panel collision boxes are regenerated using the new bay positions/radii/widths. The old generic column proxy convention remains a short square body collider, not an exact cylindrical collision mesh. Wider rear shafts become more visible in front of the unchanged north wall; this is a radius dependency, not a new rear facade or window treatment.

`delta.json` records exact stable hashes. Roof triangles, platform body/slab envelope, side walls, rear wall, beams, floor, ceiling and generic furniture are unchanged; all room/map/region registrations are exact. The nine-bay setting does not subdivide the room. The existing generic hall furniture remains `EXISTING_GENERIC_INTERIOR_UNVERIFIED` in this component. A separate inventory patch may withhold it, but that is not claimed here.

## Verification

- `baseline.tap`: 59 relevant predecessor checks pass before implementation.
- `red.tap.gz` (losslessly compressed raw failure log): the real baseline has 32 columns and fails the proposed 20-column test; missing dedicated validation fails too. Existing 10/60 Hz entrance routes already pass.
- `red-consumer.tap`: the missing actual-world consumer is a recorded red test.
- `green.tap`: all 9 focused checks pass, including exact-identity rejection, untouched geometry/registration, dependent dimensions, actual changed triangles, merged geometry/collision probes, and 10/60 Hz real FirstPersonControls roundtrips from ground through the normal south entrance and back.
- `related-final.tap`: 68 checks pass across this profile, existing rear halls and existing gallery policy. No project-wide CPU/world acceptance is asserted. Full staging/world tests belong to the owner's combined build, not a second independently constructed world.
- `build.txt`: Vite production build passes with the existing large-chunk warning. This is a pre-hook build sanity check, not proof the new profile is already reached from the normal entrypoint.
- All actual coordinates are finite. Every changed column/panel/leaf/threshold/step triangle is non-degenerate. The unchanged wudian roof contains 20 pre-existing zero-area roof_tile triangles before AND after; their exact bytes/indices are retained. Therefore this report does not claim the whole model is free of degenerates.
- The two existing support registrations remain one platform box and one widened stair ramp. Actual tread top triangles are ray-tested. The ramp is an inherited smooth walking proxy, not exact per-tread support: sampled center-height differences are at most 0.053572. Tread height/spacing and the proxy slope are unchanged. Full-body collision checks pass on the tested route.

Consumer entrypoints in `tests/lib/r62-fengxian-rear-world-check.mjs`:

- `assertFengxianRearInWorld(W)` checks one stable record, 20 actual merged column ray hits, matching collision boxes, eight closed panels, the normal entrance, six actual tread tops and the widened ramp. Relabeling old 15-bay geometry fails the consumer.
- `replayFengxianRearInWorld(t, W, { fps: 10 | 60 })` reuses the supplied world for the ground/entry/interior/return route. Neither consumer constructs, replaces or reloads a world.

## CPU comparison and remaining acceptance

Actual production component meshes are built using the unchanged shared CourtKit, before with the exact original declaration, after with the new profile. They are material-merged before export. Identical cameras are used for both stages. `capture.json` records source hashes, cameras and compressed triangle hashes; no substitute architecture or official-photo pixels are used.

- `south-before-after.png`
- `north-before-after.png`
- `east-oblique-before-after.png`

These are CPU perspective z-buffer diagnostics in a disclosed flat palette, NOT browser screenshots, texture/color/lighting matches, historic reconstructions, or whole-world captures. They show the same retained single roof/envelope and reduced/equalized column spacing. The side and rear views show current model consequences, not evidence that those facades match reality. All three pairs were visually inspected.

Reproduce: `node tests/r62-fengxian-rear-bays/export-diagnostic.mjs`, then run `python tests/r62-fengxian-rear-bays/render-diagnostic.py <input.json.gz> <output.png>` for each capture. Raster sidecars retain exact cameras and source triangle counts.

Exterior remains `VERIFY_PENDING` / partial, interior remains unverified. Missing: rear-hall photographic coverage and actual bay-width ratios; source-backed facade openings and passage; nine-room arrangement; shrine inventory and display date; native browser visuals and normal combined-world route verification. This one feature does not close the hall, Fengxian courtyard, E stage, or the 398-object program.
