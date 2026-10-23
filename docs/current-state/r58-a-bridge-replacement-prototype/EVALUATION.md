# Retained-total-height finial replacement: independent prototype, not enabled

This is the integration owner's requested alternative experiment after the additive-cap contact blocker. No production source, owner hook, canonical QUEUE, original colliders, original walkables, character dimensions or jump/controller behavior is changed. The diagnostic operates on a newly created local bridge fixture only. The original additive-cap evidence remains at commit `a2fa231681849e9d540dc532604deaef466c3476`; real jump/rail-walk blocker evidence and rejected proxy examples are preserved in `aedb9ad8ee7a2489317adb452f2e0cd39b132b93`.

## Source and proportion constraint

The original `InnerJinshui.js` explicitly labels its metrics model fits, not surveyed dimensions. The hard-coded 1.17 m shaft height has no source survey attached. Therefore retaining 1.17 m as the **total** post height and replacing its top can be evaluated as a bounded alternative; the source does not require adding 0.22 m on top of that fitted height.

The official Wumen photograph was viewed again, including private crops of readable side-bridge posts. Source: https://img.dpm.org.cn/Uploads/Picture/2019/12/31/s5e0ad0346e8b3.jpg, SHA256 `97c9ab5be71193f94226fc9fdaefc4c52d332c03ed5a10c0c14bf1ad0105fae7`, 800×600. Pixel inspection regions (48,320)–(110,414) and (120,335)–(161,425) are recorded only to make the observation reproducible; no source/crop image is redistributed.

Observation: the rounded pointed head, collars and neck stand above a square shaft, and the upper rail attaches below that head/neck transition. A rough first-post image envelope places the head/neck near y≈334–351 and the visible post base near y≈385. These ambiguous low-resolution boundaries suggest roughly one-third of the visible height, **not a calibrated physical ratio**. Perspective, the collar boundary and base occlusion prevent deriving an exact .22 m head, .95 m shaft or 1.17 m total from this photograph. Neither original additive ratio .22/1.39≈15.8% nor replacement ratio .22/1.17≈18.8% is source-verified. There is no justification here to shrink the head merely to make collision tests pass.

The 2020 overview is useful for bridge/panel order, not precise head dimensions. The 2010 journal distinguishes side torch heads from the imperial bridge and documents incised carving, but does not establish the model's absolute shaft/head heights. Existing official URLs and byte hashes remain in `../r58-a-bridge-fidelity/SOURCES.json`.

## Exact prototype delta

- All 88 targeted side-bridge shafts are actually shortened from 1.17 m to 0.95 m. Eighteen existing top-corner position entries per shaft are lowered by 0.22 m. No proxy shape covers or hides the original full-height shaft.
- Each existing cap's instance transform is lowered 0.22 m. The cap's 128 triangles, 0.22 m height, .125 m maximum radius and all silhouette layers are unchanged.
- Every resulting cap tip remains at the original total shaft top, deck+1.17 m. Bridge IDs, X/Z centers, spacing, middle imperial bridge and shaft bases are preserved.
- No collider or walkable changes occur. This experiment is neither imported nor hooked by production.

## Actual contact outcome: not a fix

The unchanged sampled rail AABBs are slope envelopes, not per-post measured surfaces. At all 88 post centers, the actual replacement-tip ray height was compared with the existing `CollisionManager.supportHeight` at the original r=0.3 footprint:

- Only **8/88** tips are within 5 mm of the old support height (the four side bridges' two middle posts).
- The other **80/88** remain farther from the old support surface.
- Maximum support gap: **0.1125006 m**. Minimum: about 0.00000027 m, normal float precision.
- Post-index gaps per rail row are approximately [0.1125, 0.072858, 0.041786, 0.063036, 0.024108, 0, 0.024108, 0.063036, 0.041786, 0.072858, 0.1125] m.

Real FirstPerson jump replay at the previously reachable south end post, retaining the default water guard and all original settings:

- 10 Hz: feet remain 1.445 m; replacement cap ray surface is about 1.332215 m. Feet float **0.112785 m** above it.
- 60 Hz: feet remain 1.445 m; replacement cap ray surface is about 1.332050 m. Feet float **0.112950 m** above it.

This is the old support-envelope overestimate exposed by the replacement. Changing penetration into hovering does not establish actual triangle contact. The 88-center comparison is a geometric/support query, not proof that every post is reachable; the real-controller jumps demonstrate the mismatch at the stated reachable post. The prototype tests deliberately verify and report this failure condition; their green diagnostic status is not a passed contact acceptance.

## Additional visible incompatibility

The original upper rail occupies deck+0.92…1.04 m. The unchanged-size replacement cap begins at deck+0.95 m, so the upper rail and the cap occupy the same **0.09 m** vertical interval. The original top rail is 0.22 m wide in X and 0.12 m high in Y, and passes through the lower collar/neck region of each head. The source photograph instead shows the rail joining the square shaft below the head/neck. Preserving the current rail literally therefore does not establish fidelity.

The same-camera actual-geometry CPU image `after-cpu.png` was inspected. It shows the compressed visible relationship between the upper rail and the heads. The caption explicitly identifies an unenabled replacement prototype with unresolved gaps/overlap. It is not a game screenshot, not a source-photo composite and not WebGL acceptance.

## Disposition and next boundary

**Do not enable this prototype.** It is useful negative evidence, not a replacement production patch. A credible next change must jointly establish the source-supported shaft/head/upper-rail relation and address the existing per-post slope-envelope contact mismatch. Neither arbitrary head shrinking nor flat invisible support pads are justified. Any broader collision/support design requires the integration owner's separate decision; this worker has not changed it.

Reproduce only the local prototype:

```sh
node --test tests/current-state/inner-jinshui-finial-replacement-prototype.test.mjs
node scripts/r58-bridge/export-replacement-prototype.mjs
python scripts/r58-bridge/raster-replacement-prototype.py reports/r58-a-bridge-replacement-prototype/after.json.gz reports/r58-a-bridge-replacement-prototype/after-cpu.png
```

## Verification scope

The independent read-only reviewer checked source pixels/hash, vertex ownership and the before/after export. It confirmed that the bounded export's 792 changed original triangle-vertex occurrences correspond to 44 visible shaft tops ×18, with only Y lowered; all 88 shafts are covered in the full fixture. It independently found no production import of the prototype. The reviewer did not rerun tests or a world build. A metadata ambiguity between the original 1.17 m shaft-only baseline and the immediate 1.39 m additive fixture was corrected with explicit separate fields.

Fresh worker verification: 51 original focused bridge/helper checks still pass, plus 6 blocker reproductions and 4 replacement diagnostic checks. The combined log reports 61 test passes, but **10 of those deliberately prove unresolved defects or rejected candidates**. This is not 61 passed contact/fidelity acceptances. No project-wide suite, full-world run, browser or WebGL acceptance was performed here.
