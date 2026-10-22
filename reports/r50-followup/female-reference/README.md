# Female reference candidate 06-04: frozen review checkpoint, not acceptance

User art direction: the supplied 2026-10-22 image, SHA256 `053c6ed722cb2dc83c47e1f1ab1b742a05dc7ba7eea6368b5624513687430d8e`. This is a user-selected visual target, not historical evidence or a game screenshot. The reference file is not copied here. Existing H4/H6 references do not establish the exact new hair or robe design.

The candidate contains actual merged CharacterKit geometry: consort seated, maid standing with overlapping hands, and a separate maid walking-preview pose. New female-only head, rounded side-part scalp and rear bun, eyes, closed nose/lip volumes, palms/fingers, closed shoulder joins, one continuous robe, cuffs, floral motifs and closures replace the previous shape. Production source is `src/scene/characters/CharacterKit.js`, frozen SHA256 `16bb5ead7c3c1aa74e1b4327c37875c521dd23835f7d4f493725d455fd9b1929`; the identical source is captured under `candidate06-04/`.

## Known unmet requirements

- **Seated hands overlap but do not rest on the lap.** Actual vertical ray measurements from 405 skin hand/forearm vertices to the actual robe find 109.6–180.0 mm clearance. Do not call this a completed lap-resting pose. It requires a subsequent candidate, not a change to these images.
- The crown is genuinely rounded, but the upper-cranium proportion remains high: eyes y=1.565 m, skull top 1.706 m, hair top 1.713 m. Side/back images show a rear low bun rather than a top bun. User visual approval is pending.
- The shoulder band at y=1.29–1.37 m measures 455–456 mm across cloth. Full sleeve spread measures 589 mm consort / 580 mm maid. These are geometry measurements, not appearance acceptance.
- Neckline, hem, ears/bun, short temple strands, hands and cloth retain visible low-poly simplifications. This is not reference-level semi-realism.

## What the images establish

All three PNGs are CPU rasterizations of the frozen indexed geometry, original scale 1.0, with offline presentation lighting. They are not GPU, browser or gameplay screenshots. They do not enable any NPCs. The seated fixture is unchanged original cached Chuxiu kang triangles from candidate05, fixture index 3; only floor planes are omitted. Cache hashes and original seat/foot metadata were checked. **No fresh world rebind or world export** was performed. This preserves provenance but is not fresh whole-world collision acceptance.

`femalePose:'walking'` is an optional Kit preview pose only. Export applies existing CPU deformation at time=.8, phase=.35, amplitude=.7 and walkSpeed=.35. Manager/Pool do not consume or cache this new key. Production standing-to-walking transitions, cache-key integration, routes, foot locks and rig/animation acceptance remain pending. No animation sequence or night view was exported for this checkpoint.

## Verification and limits

- New reference geometry tests: **8/8 passed**. They separately verify all **90 male outputs byte-exact**, the 36 female structural/contact contracts, synchronous/incremental equivalence, bounded work, eye colors, robe continuity, round crown, walking preview metadata, and actual new closure rays.
- Existing kit tests: **14/14 passed**, including actual seat/kang garment geometry checks and CPU support/deformation checks. These are not device/GPU evidence.
- Parent independent lightweight suite: **64/65 passed**, with the original candidate05 lapel-path assertion still red. Its old x=.105/y=1.32 path and dark-border expectation no longer match this intentionally repositioned closure. The old assertion was not deleted, rewritten or hidden; the new path is tested separately.
- Original candidate05 female oracle: **36/36 cases differ** in actual geometry buffers. The original oracle JSON is unchanged. A full old oracle run exited 1; no all-suite-green claim is made. The original male baseline remains byte-exact.
- All 36 standard female pose/seat/LOD combinations plus six walking previews stay within per-template 12,000/1,500/600 triangle checks. Maximum actual L0/L1/L2: **8,084 / 1,470 / 508**. Walking adds no triangles relative to standing: consort 7,964/1,390/466; maid 6,858/1,272/466.
- No claim about 180k/90k full-frame budgets, GPU/real-device acceptance, or new-source cumulative preparation timings. Candidate05 performance figures do not cover this source hash.

Raw tests, byte-change summary, counts and read-only contact/proportion measurements are under `validation/`. Source/PNG hashes and fixture provenance are under `candidate06-04/export-manifest.json` and `visual-review.json`. Earlier failed attempts 01–03 remain local, never overwritten; only 04 is included in this checkpoint.

## Reproduce without overwriting evidence

Select a brand-new output directory. Run `P3C_FEMALE_OUT=<new directory> node scripts/p3c-render-female-reference-export.mjs`, then invoke `scripts/p3c-render-female-reference.py` with the same environment and modes `preview`, `close`, `hands`. Existing evidence paths are rejected. The exporter captures and imports its source snapshot before producing models.

No building, collision, main, Pages, credentials, NPC enablement or uploaded state was changed.
