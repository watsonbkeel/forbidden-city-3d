# Cumulative verification: Yinghua west ear + reviewed Fanzong

Product commit: 295ee91001cfe4311143a41ed538c1d0e73bed98, incorporating the reviewed ear commit on the complete 5e7dcdd4 Fanzong baseline. This verification changes only test helpers and records. No product edit, upload, deployment, main merge or Fanzong-worktree change.

## Actual result
- One complete cumulative normal World route run passed after one specifically authorized test-only correction. Production static palace plus outer-west/west-six/garden were loaded together; this is not all-zone browser/mobile/streaming acceptance.
- Fanzong's unchanged 60 walk/sprint/30/60Hz variants and all 9 negative controls passed: 92,146 recorded movement frames, native contact 0. The single-owner Baohua wall-removal sensitivity remains effective.
- In the SAME World, all 16 Yinghua ear approach/ledge/side/main-hall variants, 8 continuous blocked-exit cases and 9 closed-boundary probes passed. New-ear contact 0; original main-hall stair contact counts 1/2/3/2 exactly match the independent f4 fixture.
- Legacy colliders, walkables, maps, rooms, regions and architecture match original f4 hashes after a test-only comparison view omits new ear owners/tops/record and reconstructs precisely the original west-wall collider. Production world owners are not changed by this comparison view.
- The entire far-roof triangle multiset matches original f4 plus both actual new roofs, replacing exactly the independently reconstructed old west-cap 24 triangles with the five new segments' 120. No coordinate exclusion mask is used. A separate negative test changes a roof vertex outside the wall area and correctly fails.
- Only YinghuaWestEarHall.js and its ZoneBase hook differ in product files from 5e7dcdd4. All other product blob IDs are unchanged. All 64 sealed Fanzong test/report files retain their original SHA256 bytes.

## Critical regressions, including failures
252 focused component/controller regressions: 249 pass, 3 fail. Central stone descents, Taihe recessed front porch/stairs, Qianqing floor handoff, Chuxiu NPC square contact/scheduler diagnostic, Fanzong and ear unit checks passed. This is NOT an all-green historical suite.

The same three unchanged Tiren/Hongyi tests were independently run on a separate detached 5e7dcdd4 predecessor checkout: 18/21 pass, identical 3 failure names. They already fail in the predecessor. This task does not decide whether the expectations or product behavior should be revised, and neither is repaired or suppressed here:
1. Tiren replaces only six lower window groups with twelve separately framed straight-lattice leaves: retained geometry/material hash mismatch.
2. Hongyi, including its six original windows and upper gallery, is byte-identical: old complete snapshot mismatch.
3. lower nine bays are brick, three windows, double plank door, three windows, brick: original bar-count expectation fails.

All original assertions and fixtures remain unchanged. The older separately reported B-principal 65-versus-71 count mismatch was not rerun or declared fixed. Chuxiu full map-teleport freeze remains unconfirmed; the NPC contact checks do not establish its cause.

## Clean build and HTTP artifact
Fresh output directory: /tmp/r163-ywe-cumulative-295ee910-clean-0605. Existing dist and rollback files were not deleted or changed for this fresh-output operation.

Clean product HEAD 295ee910, sourceDirty=false, base=/ (same base as sealed Fanzong artifact): R163-cd35cbf1dc48; source fingerprint 57879ed5e1bc4bf36e00ab04004ce70b9fee3f5979d8f84bd9810ab14dab52d3. 733 modules, 6.92 seconds. verifyBuildSource passed. Local HTTP checked all 137 files / 44,294,970 bytes: exact SHA256/length, correct HTML/JS/CSS MIME, root 200, missing 404. Existing large-chunk warning remains. This is a local artifact check, not remote deployment or GPU execution.

The prior standalone ear build at dirty f4 is retained as prior evidence, not substituted for this clean cumulative artifact. A preliminary default-base /gugong/ build also passed but retained old JS because vite emptyOutDir=false; its 140-file HTTP record is kept separately and is NOT the clean artifact. The first verifier expected the wrong base / and rejected that preliminary build; source bytes were unchanged. Both base records are explicit.

## Failed attempts retained
The first cumulative World stopped before routes because the new test forgot that the authorized wall adjustment also changes yellow wall-cap triangles. Original test source, full assertion failure log, partial preservation JSON and exit 1 are retained. Product source was not changed. After explicit parent approval, independently constructing the old/new caps and adding an out-of-scope negative enabled the one complete route retry, which exited 0. The two small probe-development failures (wrong guessed wall-cap count and a negative-selector coordinate absent in this zone) are also retained. No assertion or historical fixture was silently rewritten.

See CHECKS.json, source-preservation.json, world-exit.json, fanzong-chain-world.json, ear-world.json, wall-roof-delta.json, key-regressions.tap.gz, independent-5e7-tiren-regression.tap.gz, clean-build-source-verify.json and http-verify.json.

Original TAP bytes are preserved losslessly as deterministic .tap.gz archives; RAW-LOG-ARCHIVES.json records raw and gzip SHA256. Compression avoids changing original diagnostic whitespace.
