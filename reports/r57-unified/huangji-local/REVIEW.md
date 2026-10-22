# R57 Huangji local decoder and lifecycle helper

Status: 7/7 focused tests pass; 6/6 existing CPU Draco / atomic-loader compatibility tests pass. No production, configuration, asset, or shared-helper files were edited. No commit was created.

## Exact asset and interpretation

- Config: `data/interiors/huangji.json`.
- Model: `/models/interiors/huangji-aligned-0a79ec49e8cd.glb`.
- SHA-256: `0a79ec49e8cd442d363fdc6bccf4074d9e214ef3b0f3b56eba618297c1e88cc6`.
- Encoded length: 173,012 bytes.
- Native GLTFLoader with the checked-in `tests/lib/cpu-draco.mjs` and its hash-pinned shipped Draco JavaScript decoder preserves the actual scene hierarchy, local transforms, indices, normals, floor vertex colors, and PBR material settings. No replacement mesh/normal/material synthesis and no flattening are used.
- 15 source mesh nodes, 24,024 renderable triangles, 5 COL proxies and 1 WALK proxy. Production adds exactly 48 column safety slices: total 53 registered colliders and 1 non-rescue WALK support.
- The actual source has no images or texture objects. This does not establish browser texture, lighting, or GPU appearance.
- Huangji uses production's atomic four-part fallback swap. It does not start the generic 300 ms fade; the audit requires no active fade.

## Same-world integration API

Use `actualHuangjiRoot()` only for the exact configured Huangji URL in the final world's existing production `InteriorLoader.gltf.load` adapter. No InteriorLoader code is changed.

Call `auditHuangjiLoadedInWorld(W, {interiors, layer:'B'})` immediately before installing Huangji after its real B zone is resident. This captures non-Huangji collider/support values and record ownership, real fallback mesh/parent/material/geometry identities, their content signatures, and the inherited floor datum. Call with `layer:'S'` after public load/update; call with `layer:'B'` after unload. The audit rejects a different scene/CollisionManager, wrong config, different source hierarchy/geometry/material signature, missing/extra proxies, incorrect world placement, fallback mutation, and B registration mutation.

`resetHuangjiAuditBaseline(W)` permits an explicit separately audited ZoneManager unload/rebind boundary. It refuses to run while Huangji owns any S collider, support, or scene group. Do not reset merely to silence an unexpected B delta.

The helper builds no world or hall. Only the focused test constructs one real merged Huangji hall fragment, using production CourtKit/augmentation and its inherited 116 B colliders/7 supports. The parent's final same-world run is responsible for the full-zone and character assertions.

## Local signatures

- Decoded source hierarchy/geometry/materials: `1fdfc62bfb7e216ebc7db0ed8b58f5db365a5fdb9265a910de752fee21ada9a0`.
- World COL/WALK proxy signature at inherited y=1.5: `63ab31e9691717051e45bf2c256cbad47082967d62331b9e83c3115ced67392d`.
- Full registered S collider signature at inherited y=1.5: `c4aa7ff48e8ae90bb09ae545003ea8a67babe6f96588429da0e72481cbb9088e`.
- Fragment B registration signature before and after every cycle: `e8a1258d1e65c14470e9d5a24b04e0b72b7d856359093d747c5783ec2416c30b`.

Exact proxy bounds and per-cycle evidence are in `evidence.json`; this fragment B signature is not a full-world signature.

## Red/green and failure controls

`red.log` records the test-first missing-decoder/auditor run (6 expected failures). `green.log` records the implemented helper's 7 passing tests:

1. Actual pinned bytes, native hierarchy and PBR semantics, all preserved normals, floor colors, and independent resource ownership for new loads.
2. Public production load/update/unload and duplicate-load behavior, exact B restoration and once-only S disposal.
3. Label-only fake and a different real Kunning GLB rejected by production without B mutation.
4. Same-label, same-count altered geometry and changed material rejected by exact audit, restored asset passes again.
5. Delayed canceled actual-byte root disposed exactly once; newer loaded root stays installed and passes audit.
6. Changed B collider/support values, missing fallback identity and mutated fallback material rejected; restored values pass.
7. Public suspension/unload/resume and recovery with no S remnants.

`compatibility.log`: existing compressed geometry tests for Huangji/Yangxin/Cining and Huangji atomic-loader success, malformed/partial install, cancellation/suspension all pass. These unrelated real asset decodes are compatibility tests, not substitutes for Huangji evidence.

## Commands

- `R57_WRITE_EVIDENCE=1 node --test tests/r57-huangji-streaming.test.mjs`
- `node --test tests/r34-cpu-draco.test.mjs tests/r48-huangji-atomic-loader.test.mjs`
- `git diff --check`

## Explicit limits

No full world was built here. No ZoneManager cold-entry/unload/rebind, character binding, CPU character visual/contact paths, network delivery, browser, WebGL, texture rendering, shadow, GPU performance, or physical-device checks are claimed. Those cannot be inferred from the real asset decode or these fragment tests.
