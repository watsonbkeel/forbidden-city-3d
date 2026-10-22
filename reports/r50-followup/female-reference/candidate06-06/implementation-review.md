# Candidate 06-06: actual geometry revision, pending visual approval

## Frozen source and images

Kit SHA256: `5128af161cbce30e7da8106b8350ae30455dd16c32e04f00075cb948e85cf15b`.

- Front: `3a324bc68414875a71b4a14d37aa3ba07c42e86ae5e4d8267653b179b6579d47`
- Face/hair: `912e9043df66354574841f3c511ed2045257941cb8bbe90c65e61b9d09716e58`
- Hands: `b54f6dace4141a8a62eedf8dcbdfafc9eff635bab9bf1ba778313234aa492c76`

All three PNGs are rasterizations of the identical captured indexed mesh, not generated replacement artwork. They were visually inspected at front, side, rear and two hand angles. Subsequent visible changes require a fresh directory; 04 and internal 05 were not overwritten. The 04 checkpoint remains in commit `3dbef6fb62ba0314fa1c4692a5394bd0e9eb3f4b`. The original user reference SHA and its role as **art direction, not historical evidence or gameplay** are in `visual-review.json`; the original image is not copied into the repository.

## Changes from 04/05

- Elbow, sleeve, wrist and hand chain now lowers naturally to the real seated garment. Palm/finger orientation follows the lap rather than lowering only the hands or changing camera framing.
- Upper hand closes the previous 13.5 mm air layer over the lower hand.
- Adult scale and foot/seat anchors are unchanged. Face features translate upward 20 mm without changing eye/nose/mouth distances. Only the upper cranium is shortened, using the same continuous mapping for skull, scalp, bun and ornaments. Hair top stays 1.713 m; eye center is 1.585 m. This reduces eye-to-crown height from 148 to 128 mm without shrinking the entire person.
- Shoulder cloth band is 415.5/416.8 mm (consort/maid) rather than 455.3/456.4 mm; full sleeve span is 537.3/524.6 mm rather than 589.3/580.2 mm.
- The neck now tapers into the actual skull. Its top ring is embedded inside the skull, not exposed as a horizontal cylindrical rim. The 05 face/neck step was rejected internally; 05 is not represented as a delivered or approved result.

## Signed contact evidence

`verification/signed-hand-contact.json` records actual L0 geometry, amplitude zero. Each cloth surface is found independently by raycasting down from y=1.3 at matching X/Z. This avoids the false-clearance error of starting rays inside penetrating hands. Palms and fingers are separated from forearms. Palm vertices, indexed skin-triangle vertices, three edge midpoints and centroids are sampled.

For the rendered consort/kang pose:

- Lower palm nearest cloth: **+1.774 mm**.
- Lower hand skin triangles, 2,324 samples: minimum **+0.552 mm**.
- Upper hand against lower hand, 1,041 overlapping samples: minimum **+1.467 mm**.
- No negative signed clearance occurs in the examined hand/cloth or stacked-hand samples.

Both female templates are tested across four seat variants. Lower-palm minima are approximately 1.79 mm standard, 1.77 mm kang, 1.68 mm raised footstool and 4.05 mm throne perch. These are static near-contact tolerances, not a physics simulation or mathematical proof for every triangle interior. Idle animation, continuous motion and world-space rebinding require separate verification; the seated preview deliberately uses amplitude=0.

## Verification

- **35/35 passed**: 12 candidate reference tests, 9 signed-contact/regression tests and 14 existing Kit tests. This includes all **90 male cases byte-exact**, all 36 female scale/contact/metadata contracts and synchronous/incremental equivalence, all six walking-preview variants, actual neck embedding, scalp coverage at transformed sample coordinates and closed nose profiles.
- **4/4 passed**: independent per-step operation bounds and cancellation/validation tests. No whole-buffer normal/bounds calls were introduced.
- Original female-refinement tests remain **3/7 passed, 4 failed**. The original forehead-height, upper-skull-ray, nose-y and lapel-coordinate assertions are preserved. Their old coordinates were intentionally not rewritten to manufacture an all-green result. Candidate-specific relocated probes are separate tests.
- The old candidate05 female buffer oracle is preserved and differs from this geometry; no replacement/regeneration was done. No complete-repository-green claim is made.
- All 36 female pose/seat/LOD cases plus six walking previews: maximum triangles **8,148 / 1,490 / 508** for L0/L1/L2. Standing/walking consort: 8,028/1,410/466; maid: 6,922/1,292/466. Walking changes positions but adds no triangles. These are single-template limits, not 180k/90k full-frame acceptance.

## Runtime and provenance boundaries

The preview branch does not wire Manager/Pool to `femalePose:'walking'`. The Kit carries only geometry metadata `samplePose`; integration status belongs in the preview manifest, not a global claim hard-coded into a geometry library. Runtime integration is being reviewed separately and is not proven by these images.

The seated support uses hash-verified original cached Chuxiu kang triangles, fixture index 3, with room floor planes omitted only for presentation. It is not a fabricated calibration block. Existing seat/foot metadata matches exactly, but there was **no fresh world rebind** or world rebuild.

No GPU, browser, device, complete-frame performance or new-source cumulative preparation-time acceptance. Candidate05 timing figures do not apply to this source. No NPC enablement, population expansion, building/collision/main/Pages/credential change or upload. Remaining appearance limitations include low-poly collar/hem/ear/bun edges, simplified hair strands, fingers and cloth folds. Visual and historical approval remain pending.
