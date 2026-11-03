# R163 Taihe front porch and three small stairs

Base: ec50ea010340dc3b04f18ec052f36a05c3862702. Local candidate only; no upload or deployment.

## Diagnosis and bounded correction

The parent placed its three small plinth stairs at X=-10.5/0/10.5. Both side centers met the front post row and the closed screen solids at Z=-18.5. Real controller direct ascent on both sides failed at Z approximately -19.48 to -19.64. The old successful route instead crossed the outside lip at Z=-19.65 and entered centrally; it did not establish a column-behind porch.

The museum front photograph [official view](https://img.dpm.org.cn/Uploads/Picture/2019/12/31/s5e0a95c8c2815.jpg) supports three small stairs in the three neighboring central bays and a recessed screen behind the eave columns. The correction derives small stair centers -7.0061/0/7.01335 from the existing Taihe frontage grid. Only the front screen, door leaves, header and threshold, with their two matching broad solids, move to the next existing depth row Z=-13.0646. A separate front eave beam remains at Z=-18.5.

All 14 southern screen/door pieces retain their geometry, materials, XY, scale and rotation, with a single Z translation +5.4354. The eight originally closed screen bays remain closed. The original central playable openings remain as before. No side opening is cut, no post is removed and no collision policy is weakened. The two changed ramp owner records follow the real new stairs. All three large terrace stair pairs remain at X=±10.5.

## Verification

- The initial new suite failed 10/10 against parent behavior; the implemented correction passed.
- Final command: `node --test tests/r163-taihe-front-porch/*.test.mjs tests/photo-fidelity/batches/b-principal-stair-contact.test.mjs tests/r10-taihe-column-grid.test.mjs`: 35/35 pass.
- Both side small stairs, the column-behind porch at Z=-16, lateral travel to X=±24, central entry and the full return: 10/60 Hz, walking/running, eight complete round trips, maximum foot/ground error 0.
- Ground-level ascent through all three large tiers to each new small stair and central entry, then all the way back down: the same eight combinations pass.
- Real raycasts and solid-body probes show closed screens at the recessed line and original front posts still blocking their own locations. Screen/header movement retains the separate eave beam and moves the original threshold with the opening.
- Exact parent-builder fingerprints preserve the 66 red columns, every other unchanged Taihe component surface/material, floor, roof, rear enclosure and remaining solids; the Baohe component is unchanged. The immutable parent baseline is reproducible with `node tests/r163-taihe-front-porch/capture-parent.mjs`.
- The independent reviewer reran 34/34 before the additional fourteen-piece regression was added, checked 723 porch body samples, tested closed-screen impacts, and compared all 14 pieces against the exact parent. No blocking findings. The requested fourteen-piece comparison is now a permanent test.
- `npm run build` passes. `git diff --check` passes.

## Limits

This is photo-supported topology registered to the retained model envelope. The 5.4354 m column-to-screen separation follows that envelope and is not a surveyed present-day porch depth. Roof, column and floor placement are not newly certified measurements.

These are real current three-hall production geometry/merge/collision/FirstPerson tests, with CPU materials and a controlled clock. A larger `buildR52World` attempt was killed by the system with exit 137, so there is no full-world, GPU, browser or mobile acceptance. Additional legacy r10-column-integration/r13-plaque-frame entry points did not load because sparse checkout omits r27 fixture dependencies; they are not claimed as passing. The focused current grid/contact/new suites above did run and pass.
