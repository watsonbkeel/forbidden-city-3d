# Candidate 06-07: seated idle rig repair, not a new appearance revision

Source SHA256: `cc311f8fdaa912538fdfffebd66b7fa2c5de7f2c7063ffbc5bf462bc3f5edc6c`.

## Confirmed defect and narrow repair

The frozen 06 mesh was correct only at amplitude zero. Its original full arm-swing weight makes the actual default amplitude .7 lower hand enter the lap: kang t=0 is -12.602 mm, t=2 is -27.285 mm. Both templates and all four seat variants were checked. The failing regression, unmodified 06 source and before measurements are retained; the 06 images are **not** claimed to demonstrate corrected idle behavior.

Only female seated `characterWeight` and `characterTorsoWeight` change. Local shoulder rotation smoothly fades to zero before the cuff; hand/forearm torso blend follows the same pelvis-height function as supporting cloth. Upper sleeves, torso breathing and head motion remain live. The existing shared Animation and every male case are unchanged.

All 36 female pose/seat/LOD combinations retain exactly the 06 position, normal, color, index and non-weight attributes and metadata. Standing/kneeling and all six walking variants retain all their attributes. Thus no new static appearance is substituted for the 06 visual target, confirmed by the user at 2026-10-22 06:02:13 UTC (see ../VISUAL-APPROVAL-20261022.md). The 07 dynamic images are explicitly separate evidence.

## Full common-period finite sampling

Seated motion frequencies .55/.72/.92/1.7 have common period **200π = 628.3185307 s**. Cached real L0 indexed meshes were sampled at 1,257 inclusive times, step 0.5002536 s, phase 0, amplitude .7, for two templates and four seat variants: **10,056 states**. Meshes are constructed once per case, not once per frame.

Every state tests 2,052 unique hand surface samples (triangle vertices, edge midpoints, centroids), 32 sleeve-root vertices, approximately 398–408 cuff/sleeve ROI vertices and 44 forearm ROI vertices. Surface queries use actual deformed triangle barycentrics with spatial bins. The position kernel agrees with the unchanged canonical CPU deformation within 5.96e-8 m; independent Three raycasts agree within 1e-8 m in 24 cross-check states. The skirt and torso remain one connected indexed surface with the existing continuous torso-weight function.

Across this sampled complete temporal span:

- Palm/finger versus lap: minimum **+0.522253 mm**.
- Upper hand versus lower hand: minimum **+1.445283 mm**.
- Sleeve-root ring enclosure inside actual torso: minimum **28.130761 mm**, so the examined sleeve/body boundary does not pull open.
- Lower-palm nearest contact stays within 6 mm for the originally requested seven test times. The full record retains all times, closest points and seat variants.

**This is finite sampling over the complete common period, not continuous-time collision proof.** The whole frame, distant LOD contacts, runtime world binding and GPU behavior are not covered by this audit.

## Remaining intersections are not hidden

The existing open, layered cuffs intersect the lap garment at amplitude zero: approximately -22.8 to -37.3 mm depending on seat. This is distinct from palm/finger penetration. At sampled idle extrema their aggregate minima are approximately -23.2 to -37.4 mm. Individual cuff vertices can deepen relative to their own static clearance by up to 3.899 mm. Enclosed forearm skin has a worst sampled signed value of **-0.260 mm** (raised footstool), whereas the exposed palms/fingers stay positive. These measurements are retained, not rewritten as a universal “no mesh intersections” pass. The hand and overview contact sheets were visually inspected; the hands remain visible, but visual review does not replace numeric evidence or approval of dynamic/runtime behavior.

## Dynamic evidence and verification

- `female-reference-seated-idle-hand-motion-8s.gif` and `female-reference-life-motion-8s.gif`: 24 actual CPU-deformed frames, exactly 8,000 ms. Timing normalization changes only GIF frame durations, not decoded pixels.
- The 24 exported clip states use phase=.35 and time=i/24*8. Their independent signed audit gives hand minimum +0.527039 mm, stacked-hand minimum +1.445371 mm and sleeve-root enclosure minimum 28.452483 mm.
- New final targeted run: **47/47 passed** (12 reference + 9 static contact + 12 idle/audit + 14 original Kit); includes male90 byte equality and non-disabled head/torso/upper-sleeve motion.
- Independent incremental operation-bounds/cancellation tests: **4/4 passed**.
- Original female coordinate probes remain **3/7, four red** as disclosed in 06. No old assertion, oracle or candidate05 baseline was changed to manufacture an all-green repository.
- Triangle counts remain exactly 06: maximum 8,148/1,490/508 for L0/L1/L2. No new full-frame, preparation-time or GPU performance claim.

`verification/full-period-summary.json` contains all extrema. `full-period-sampled.json.gz` retains all 10,056 records; its decompressed SHA is recorded in the summary. The uncompressed JSON and 18 MB animation frame export remain locally preserved but are not duplicated in the commit. The renderer manifest lists original and final GIF hashes and reproducible commands. For a fresh full-period audit: `node tests/helpers/run-p3c-female-idle-sweep.mjs <fresh-output.json>`.

The user reference remains art direction, not historical evidence: SHA256 `053c6ed722cb2dc83c47e1f1ab1b742a05dc7ba7eea6368b5624513687430d8e`. The fixture is the previously hash-verified actual cached Chuxiu kang, with no fresh world rebind. Walking here is existing root-relative CPU deformation, not proof of runtime route integration. No NPC enabling, expansion, main/Pages change, upload or browser/GPU run occurred.
