# R58-A N4: side-gallery source/range preflight

## Decision

**BLOCKED_SOURCE. No runtime opt-in, helper, or shared hookup patch is justified yet.**
The veranda/recessed enclosure feature is visible in both actual official photos, but a
photograph-to-retained-span interval is not established for any of the four rows.
The official supplementary source pass found useful junction images and the precise
competing thirteen-bay statement, not a resolution of the range/count discrepancy.
This is a completed bounded source review, not an implemented correction or A37 completion.

Baseline: `755dd9ac5c6f8a8766c1db3e8e4f8fe17fa142da`.
Scope: N4 in the R58-A inventory review; master requirements execution rules 1–295 and
A37 were read. The companion JSON records independent facets, hashes, URLs, and null
world/bay registrations. It does not modify canonical inventory acceptance.

## What the actual photographs establish

- [Xiehe courtyard image](https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d4981afba5.jpg):
  outer column line, a front passage, and recessed enclosure in cropped adjacent galleries.
  The image-left portion is longer; the image-right portion is short. Neither runs through
  a fully identifiable opposite terminal of its row.
- [Xihe courtyard image](https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d4bf591346.jpg):
  independently shows the same type of front-passage/recessed-enclosure relationship.
  The image-right portion is longer. It is not evidence for an unseen opposite facade.
- North/south association is an orientation inference: Xiehe image-left and Xihe image-right
  are the north-side portions when viewing their courtyard faces. This uses the official
  east/west gate orientation and retained coordinate convention, not surveyed photo metadata.
- Neither photo establishes enclosure setback in metres, complete room partitions, or
  current room contents. Upload-path dates are not asserted as photography dates.

### Candidate bindings, not accepted entity ranges

All intervals below come from existing `data/zones/axis-courts.json`. Their dimensions and
19/31-bay counts are procedural model outputs, not measurements of the source buildings.

| Independent row | Candidate item | Retained interval `(x,z)` | Length | Generated bays | Photo portion |
|---|---:|---|---:|---:|---|
| FC-2D6DB6F0EC 协和门北庑房 | 27 | (-103.37,-286.1) to (-103.37,-222.2) | 63.9 m | 19 | Xiehe image-left |
| FC-3489F3B25A 协和门南庑房 | 26 | (-103.37,-415.5) to (-103.37,-314.5) | 101.0 m | 31 | Xiehe image-right |
| FC-E9A79B1E5E 熙和门北庑房 | 33 | (107.6,-287.1) to (107.6,-222.2) | 64.9 m | 19 | Xihe image-right |
| FC-069E407017 熙和门南庑房 | 32 | (107.6,-415.5) to (107.6,-315.1) | 100.4 m | 31 | Xihe image-left |

The gate-side relationship is identifiable qualitatively. A second registered boundary
is not. Counting visible pillars in a perspective crop does not establish the world
coordinates or generic-model bay index of that boundary. No complete 19/31-bay candidate
may be renamed or treated as the independently named 11/13-bay source row on this evidence.
No shorter numeric interval has been selected merely to fit the current template.

## One bounded official supplementary pass

1. Read the [Xiehe official page](https://www.dpm.org.cn/explore/building/236540.html) and
   [Xihe official page](https://www.dpm.org.cn/explore/building/236567.html). Both describe
   eleven bays on each north/south side, front verandas, and rear fire eaves. This establishes
   a named architectural arrangement, not a measured plan or present inventory.
2. Actually viewed each page's second photo:
   [Xiehe outer face](https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d49bdcb60f.jpg)
   and [Xihe outer face](https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d4c2ac3336.jpg).
   They are closer/tree-obscured gate approaches and do not supply missing gallery endpoints.
3. Located and rendered [《清代的紫禁城》, PDF page 6 / printed 55](https://www.dpm.org.cn/Uploads/File/2020/10/23/u5f9255173a228.pdf#page=6).
   It distinguishes Ming ten-bay sides from thirteen-bay sides at publication. This is the
   exact competing count, not a count inferred from another palace feature. Its nearby plan
   concerns the three-hall terrace, not a counted elevation of these four gallery rows.
   The eleven-versus-thirteen boundary/convention remains unresolved.
4. Rendered [《从乾隆朝养心殿的改造看明清紫禁城硬山建筑的变化》, PDF page 6 / printed 138](https://www.dpm.org.cn/Uploads/File/2020/11/12/u5facb56c07c8f.pdf#page=6).
   Figure 16 shows the Xiehe gate/gallery roof junction. Figure 17 identifies the gallery
   junction with the northeast Chonglou. These are valuable independent terminal clues,
   but close crops do not supply a continuous counted run, scale, or model registration.
   Figure 18 concerns Wumen and is not transferred to these targets.
5. Followed each exact panorama link in the official gate HTML using the existing cloud
   browser, rather than treating a text-fetch JavaScript shell as a final browser result.

### Actual official panorama attempt: BLOCKED_RUNTIME

- Browser: existing cloud Chrome, CDP browser 1. No local browser process was started.
- [Exact Xiehe panorama](https://pano.dpm.org.cn/#/panorama?regionId=20&secondAreaId=2054728919620096000&vpId=2054732998094196736&sphPicId=2054726937400414217):
  opened a new isolated tab 20, then used documented `getAXStateAndScreenshot`.
- [Exact Xihe panorama](https://pano.dpm.org.cn/#/panorama?regionId=20&secondAreaId=2054728919620096001&vpId=2054748808233717760&sphPicId=2054726937383636998):
  opened a new isolated tab 21, then used the same documented observation method.
- Both navigations succeeded. Both page accessibility trees explicitly reported:
  `FATAL ERROR: A Browser with WebGL support is required!`
- Both screenshots showed the loading overlay without architectural imagery. Therefore
  neither panorama was actually viewed, let alone inspected through 360 degrees.
- Outcome is known render failure, not an access denial, pending approval, or proof that
  the official source itself lacks the desired evidence. No hidden API, canvas extraction,
  browser flag change, dependency installation, or public relay was attempted.

`BLOCKED_SOURCE` is the object-range decision. `BLOCKED_RUNTIME` describes the failed
supplementary viewer route. They must not be conflated with game/browser acceptance.

## Shared-hook constraints found during read-only inspection

`CourtKit.corridor` currently invokes a full `hall`, with `roomBays: 3` and
`interior: 'room'`. It creates six rooms on each north candidate and ten on each south
candidate; the default room/storage presets introduce unverified furniture.

A later source-approved bounded correction must not simply forward the existing
`frontEnclosureInset` option and call the result done:

- Hall front walls, front collider/door coordinates, and floor/ceiling extents use inset.
  Room partition meshes/colliders still cross almost the original full depth. With these
  multiroom corridors, they can cut across the intended veranda.
- Furniture placement still uses original-depth bounds. Suppression needs its own explicit
  opt-in and must mean “inventory unverified,” not “the historical/current room is empty.”
- `interior: 'empty'` also changes registered room kinds. It is not a semantically neutral
  furniture-suppression switch.
- Existing inset applies to the full hall frontage, not a bounded subset of the long row.
- Preserve walkable platforms/floors, room registry and door semantics, and all existing
  昭德门/贞度门 joins. The parent remains the sole owner of shared callers and declarations.

These are future implementation constraints, not an authorization to change unidentified
parts. No helper scaffolding or speculative shared patch is included in this delivery.

## Retry condition

Obtain a usable official current-view panorama, measured elevation/plan, or continuous
identified image showing a chosen row from its gate junction to a second known landmark.
The evidence must register an explicit local world/bay interval. Reconcile the eleven/
thirteen counting boundary for whole-row work; a genuinely registered shorter segment can
be considered separately without claiming to resolve the whole row. Each of the four
rows, rear faces, end joins, and interiors remains independently evidenced.

For the existing panorama route, retry only in an authorized browser with functioning
WebGL or after a material viewer capability change. Repeating the unchanged loading page
is not new evidence. An alternative official static source can also unblock registration.

Once the interval gate passes, the bounded proposal is an explicit front-enclosure setback
and suppression of unverified template furniture for that interval only, with unknown
contents left unclaimed. Keep existing roof/bay counts and unobserved portions untouched.

## Verification and exclusions

- Companion JSON has four independent candidate rows, no accepted entities, null selected
  world/bay intervals, and `runtimeChanged: false`.
- Baseline source/data hashes and generated lengths/bay/room counts were checked locally.
- Only this report and its JSON companion are added. No source photograph/PDF is included.
- No full-world build, game browser startup, CPU render, deployment, or visual acceptance
  was attempted. Documentation/static checks are not browser acceptance.
