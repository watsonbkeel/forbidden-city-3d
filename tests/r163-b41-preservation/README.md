# B41 bounded production regressions

These three tests protect existing user-feedback repairs. They do not change
game geometry or movement, require a historical snapshot to run, or construct
the complete World/outer-east zone.

```sh
node --test --test-concurrency=1 tests/r163-b41-preservation/current.test.mjs
```

1. Build the real Wenyuan hall through `ZoneBase.buildHall`, then its four own
   finalizers in normal order. Check the actual registered plaque face/back,
   door, bridge configuration and bank opening share x=-189.875. Test the water
   rule and three real doorway body-clearance samples. A rendered plaque moved
   back onto the obsolete column axis must fail the same alignment check.
2. Build the actual Wenhua gate producer without a proposal loader. Require no
   transverse central panels, six posts, four longitudinal rails, forty south
   treads and six side stones. Check actual central sightlines and solid side
   contacts. Removing the real south surface owner must fail the side-contact
   check, so an empty collision fixture cannot make the test green.
3. Replay current native FirstPerson at 10/60 Hz, walking/running, on the actual
   gate component: four central roundtrips, 1620 recorded frames. A separate
   real wall across the path must stop the same controller. All mutations are
   confined to disposable test fixtures; production file bytes stay unchanged.

The real texture-library APIs use inert offline textures. Canvas drawing and
the clock are controlled. This is CPU component/physics evidence, not browser
rendering, GPU, phone, complete-zone traversal, NPC interaction or user approval.
The Wenyuan test does not walk the whole bridge-to-hall route.

The retained 60Hz sprint run-off reaches 0.44417641998547114m for nine frames
above0.3m (0.15s), while still arriving. Other combinations peak at0.018204m,
0.131775m and0.076538m. The finite0.444177m/nine-frame assertion preserves this
disclosed local baseline; it is not a new product tolerance or proof that every
frame is below0.3m. No additional physics polishing is included.

Current result: three positive tests pass and all three embedded negative
controls are detected. To save a compact report, set `B41_EVIDENCE_OUT` to a
local writable JSON file. No previous capture is required and no assertion is
silently skipped when one is absent. The older historical test files remain
unchanged; their optional snapshot comparisons are not claimed to run here.

Run alongside the163 bounded card/map/Teleport/H43 tests referenced in the
adjacent READMEs. Existing R6/frozen-history failures remain; this is not an
all-suite pass. There is no new build or deployment. The inherited build remains
R163-ff9834c19984, actually sourced from local
`d2f65984528179154fef0022cf9692e03bcf12f0`, not this documentation/test commit.
