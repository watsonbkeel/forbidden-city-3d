# R6 combined palace preview

This release combines the gate/courtyard-wall correction, all 159 place cards,
and Taihe screen/dais surface work. It is a source-informed interactive model,
not a surveyed reconstruction or a statement of current visitor access.

## Visible changes

- Gate/wall registration and courtyard connections are corrected where the
  documented evidence supports them. East/West Glorious Gates use three
  passages and a hip-roof profile. Provisional dimensions remain labelled.
- All 159 mapped places have a card, including 145 additions, aliases, purposes,
  history and direct source links. Reading a card does not automatically travel.
  Removed Chuxiu/Changchun gates remain discoverable as labelled historical sites.
- Taihe screen and dais vertical faces gain distinct red/gold treatment using
  self-authored atlas artwork. Geometry remains 17,940 triangles, eight material
  batches and 8 MiB of textures. Lighting, exposure and collision stay unchanged.
  The result remains stylized; the screen and throne details are simplified.

## Checks and limitations

- The frozen product candidate passed 2,032 Node tests. Following the runtime
  diagnosis, the test-only preload change passed 26 focused positive/negative
  checks; the side-passage route passed three focused geometry/retention tests.
- The corrected preload verifies Taihe's actual floor support at model y=9.9375,
  nine permanent collision boxes and seven non-rescue steps, including object
  identity and bounds before/after loading. Its visual-only GLB must have zero
  owned COL/WALK proxies. Other interiors still require their own collision.
- The original runtime continuation completed 132/132 fixed and 232/236
  automatic combinations. The four failures belonged to one old B-only route
  through Huangji: its line crossed a loaded S gold column. The safe replacement
  uses the existing east side portal; the failed route and original results are
  retained. The corrected four combinations passed in a separate cold-browser check
  (8.25 seconds active, 0.50 seconds cleanup). The other 58 generated automatic
  descriptors are byte-identical; all fixed and automatic cases are covered
  across the retained continuation and this targeted check.
- The unchanged production bytes previously passed the original six-view,
  60-frame structural performance check and two compact layout checks. This was
  Linux Chromium/SwiftShader, not a real-phone smoothness benchmark. Detailed
  original frame arrays were lost when the execution workspace reset; retained
  terminal observations are explicitly distinguished from raw result files.
- Ordinary desktop checks covered directory/card/back behaviour, map-open
  movement and selected western-court/Ningshou travel. Positive Chinese text
  entry and physical-phone/touch acceptance remain unverified. Controlled
  viewport checks are not equivalent to testing a physical mobile device.

The recovered production distribution is byte-identical across all 117 files:
manifest SHA-256 `8767aa3604d40d11f055cc8a9968ef23cb177304bd35513d66e3ee72944b0cf0`.
Subsequent preload and route changes are confined to test code.

## Remaining factual boundaries

See `../places/r6-source-review.json` for the per-place mapping. Seven entries
retain explicit uncertainty: Nanxun Gate identity; Taiji Gate inferred identity;
Changkang Left/Right Gates' partial histories; and three Nansansuo rear halls'
partial identities. Historical Chuxiu/Changchun gate coordinates and the
Huangji side portals are model-fit estimates. Inherited Shenwu positioning has
not been moved merely to satisfy tests.

The Huangji S dais and rear eave leave approximately 0.95 m in the present model,
less than the controller's 1 m diameter. This is a model finding, not a measured
palace clearance. Exterior circulation is used while that interior registration
awaits evidence-led review; no columns or collision boxes were removed.

Sources and design limits: `r6-gates-and-courtyard-walls.md`,
`../places/R6-CATALOG.md`, and
`../current-state/taihe-furnishing-surfaces/SOURCE-AND-PROPERTY-COMPARISON.md`.

Main is owner-controlled. Public rollback commits are retained:
`c9c9eaab992e894b5146519e6680ca713dd64ec1` and V13
`452662d7ff4c0652cda6fcd6bf81eda89713552a`.
