# Frozen central reference export only

No product changes, no sculpting, no acceptance of the research Buddha's appearance.

## Integration
- Copy worker.mjs, format.mjs, baseline-pins.json beside one another into /tmp/central-reference-export.
- Source must be a clean detached checkout at /tmp/central-baseline-source, commit 1851caeecc334fe2a811d78e29b7dfbec87138ed, tree 196d59adaa01b9777528c5f16142c299fc9ad2a4.
- Parent hosted admission verifies exact tree, lockfile, clean Git and script hashes. Worker verifies detached HEAD, GITHUB_SHA, six module and two asset hashes, before dynamic import.
- Only run worker inside the original 6 GiB / single 720 s / 2 GiB Node heap guard. Environment EVIDENCE_DIR is a fresh absolute artifact directory. No local factory run, subprocess git, browser or rendering.
- Worker calls the central factory once with texture:null. Separate small lotus/hair generators verify concatenated geometry ranges. Original body's 650k samples/250k triangles internal guards are unchanged; export adds an aggregate merged safety ceiling of 300k vertices/250k triangles and 128 MiB outputs, not a mesher allowance.

## Outputs and source identity
Every geometry attribute (including study blend attributes), exact typed-array bytes, original index, groups and metadata are authoritative binary evidence with byte order and hashes. OBJ files are clay visual derivatives, NOT evidence of reconstructed shader/materials. Source vertex range maps preserve per-OBJ vertex source IDs.

Ranges follow source concatenation body -> right ear -> left ear -> nose -> four fingers -> lotus -> hair. Material-batched index reordering never authorizes vertex reordering. Cross-range faces are rejected. Original lotus/hair position/normal/UV/color are checked elementwise. Every triangle's material must belong to its segment's original allowed material set.

Body includes both fused palms: keep the whole body locked. Do not claim a separate semantic palm index set. Lotus, ears, nose, fingers and hair are separately lockable references. The eventual knee/robe sculpt must be a separate working object.

OBJ coordinates/normals are explicitly Three (x,y,z) -> Blender (x,-z,y), inverse (x,z,-y), a proper rotation. UVs unchanged; vertex/UV/normal indices aligned. Blender import must avoid an additional axis conversion, recentering, normalization, welding, modifier application or scale. Check bounding boxes and source anchors on actual import. No .blend has yet been created or visually verified.

All payload files are fully read back after write. receipt.complete is true only after export and disposal succeed; outer guard success is separately required. A failed run keeps partial files and false receipt, no retry into the same output directory. Full geometric self-intersection, artistic suitability, original texture appearance, support measurements and actual Blender importer behavior are not tested here.

## Small tests only
node --test export.test.mjs
Initial missing implementation RED preserved in RED.log. Synthetic binary/OBJ coordinate roundtrip, bad index, cross segment, budget/group coverage, nonfinite/missing attributes and exact segment drift rejection. No real factory execution during preparation.

Every actual OBJ is parsed back into numeric position/normal/UV and exact face-to-source indices. Inverse-coordinate errors must be zero; per-object original/Blender bounding boxes and maximum errors are preserved in obj-roundtrip.json. Original grid dimensions and embedded PNG SHA are asserted, never overwritten.
