# R36 independent current-source review

Review scope: south water geometry and its actual consumers, explicit hall and
exhibition profiles, navigation adapters, source/date claims, and resource
ownership. This is not native-browser or GPU acceptance. The candidate remains
mutable until the final owner checkpoint; intermediate results do not certify
later bytes. The final reviewed production checkpoint is
`be5b668b2cddf6ba20fa6027da593d09683f6823`; its 46 existing independent checks
passed with no production-byte changes during execution.

## Findings and dispositions

1. **Water polygon self-intersection and inconsistent shoreline, corrected.**
   The short eastern neck produced a nonadjacent crossing between the retained
   central north bank and a returning miter edge. On source SHA-256
   `c8cf962f5a4b1276220f769391550f8d5e98e018f9671739749ac7f64a401b26`,
   the unified 1,529-point polygon had one proper crossing and one zero-length
   edge. A 0.125 m shoulder grid found 117 locations within the actual rendered
   water-surface union but outside the unified cutout/guard polygon. Actual
   downward rays at `(-74.5, -286.2)` hit exposed water, while the zero-radius
   point guard allowed passage. This was not claimed to prove a full-radius
   player could enter the small wedge.

   The owner changed the explicitly fitted eastern neck and removed consecutive
   duplicate points. Independent reinspection of source SHA-256
   `1df723ef5261d7a37447fb8566c089f16a7335c2e9e254a5d386b1fbb7440a83`
   found 1,528 vertices, zero zero-length edges, zero proper crossings and zero
   water-union/cutout discrepancies at the same shoulder samples. Both banks
   remain fitted, not official measured channel widths.

2. **Wenyuan teleport physical-support verification, corrected in focused
   checks.** A bent approach correctly rejected a real blocker but originally
   accepted the complete removal of pond-bridge support because implicit
   ground zero and the endpoint tolerance hid the missing bridge. The first
   repair still omitted transverse support limits; moving one real strip's
   cross-axis limits left it falsely verified. The current owner patch compares
   all 32 strip geometries, including bounded X/Z and all four taper limits,
   and requires the destination zone to be loaded. The three independent
   negative tests passed after this repair. The actual `main.js` registers
   palace supports without a tag; a test-only `static` tag must not become a
   mandatory production condition. The owner corrected that interface issue.

3. **Accidental generic-helper insertion, corrected.** New southern explicit
   routes were duplicated into `sideCorridor`, where `zone` and `out` did not
   exist. The unintended branches were removed. The intended `zoneRoutes`
   adapter remains, and the old no-profile `gateGeom` fallback is unchanged.

4. **Baoyun open-gallery floor collision, corrected.** The main block
   and both wings are genuinely closed collider volumes, with no registered
   room or fabricated furniture. However, the lower open-gallery floor at
   world `(300.9 ± 14.5, -220.45)` rendered at Y=1.2 while actual ground was
   zero and a standing player was not blocked. This permits the body to pass
   through the raised slab. The owner was asked to provide a real closed
   gallery base or properly justified support, without inventing room access
   or using rescue lifting. The owner added a real 1.2 m closed stone base and
   its collider. Rechecking both exact points gave `bodyBlocked=true`, ground
   zero and still zero Baoyun rooms. No new walkable or rescue support was
   introduced.

## Input-only test migration

The two generic algorithm diagnostics in `tests/auto-routes.test.mjs` now use
`tests/fixtures/r36-r35-generic-detour-input.json`, expressly labelled
`[R35 baseline-input generic]`. Independent comparison with
`git show 0d7bbf23c1d79b36170a36b27a988488554f1b9f:data/zones/outer-west.json`
confirmed that all four selected hall/gate records exactly match the baseline.
The first draft also included the same-named Wuying region through the old
name-only filter; the final input excludes that non-geometric metadata record.
Original assertions and thresholds remain intact. Geometry construction,
collision, controls and route algorithms are current code, not restored
historical production modules.

This is generic-algorithm coverage on old input, not current Wuying acceptance.
Current Yude routes and all 61 current automatic routes still use the actual
current world. The new ground-start hall/pond/bridge tests remain independent.
No older fixture was edited by the independent auditor.

Five fixed routes in `tests/stepwalk.cjs` now follow the real river bridges and
source-specific hall approaches. Their names and the total of 33 remain, while
the other 28 paths retain their existing driver. `DUMP_JSON` preserves explicit
`physical-crossing-v1` metadata for the already-existing ground-start driver;
the browser runner itself is unchanged. This path/diagnostic migration must be
disclosed rather than presenting the old unbridged lines as still applicable.

## Other reviewed boundaries

- Four hall anchors now refer to the dedicated Wenhua/Zhujing/Wuying/Jingsi
  component centers rather than the superseded group or approximate centers.
  Their old coordinates remain in `legacyAnchor`, and the new coordinates
  explicitly retain fitted/not-surveyed status. Zero discrepancy between an
  anchor and a model that uses the same fitted center proves **internal map,
  navigation and model consistency only**. It is not independent survey
  accuracy, a measured confidence level or 1:1 authenticity. Inherited
  `conf: 中/低` labels are not promoted to measurement confidence. Deviations
  for all other, unmigrated anchors must still be reported unchanged.
- Environment cutout and Minimap use the same unified water polygon. Collision
  uses it for footprint contact, then only explicit physical bridge footprints
  permit wet crossings. Flight conservatively marks every sampled reach strip
  as water while preserving the prior flight bounds and three landing targets.
  A flight-envelope success does not prove browser input or helicopter rendering.
- Wenhua and Wuying separate news publication, panorama package date, reference
  month and unknown photography date. The former is first-period September
  equipment topology with later object positions withheld; the latter is the
  2021 opening installation, not a 2026 inventory. Baoyun explicitly separates
  2013 whole-exterior evidence from the 2024 repaired-façade photograph.
- Final Wenhua source review established only one north long-face low cabinet
  at the front island (`a035-b`). A side view of that same cabinet is not
  evidence for matching cabinets on the other three faces. The unsupported
  three were removed before the final independent run; fitted positions are
  still not official metric measurements.
- Xiehe's under-gallery vault is photographed; Xihe's northern interface is
  documented but its vault shape remains fitted. Wenyuan side-wall interfaces
  are also explicitly fitted. No mirrored western photograph is claimed.
- New gallery, vessel and Baoyun private materials are registered with
  `kit.owned`. Shared library materials and texture maps remain borrowed.
  Raw `new Mesh` display geometries are collected by the real merge/disposal
  path; water masonry is merged and private water material is disposed once
  by PalaceBuilder. Actual lifecycle tests are CPU resource/event evidence,
  not a GPU-memory measurement.
