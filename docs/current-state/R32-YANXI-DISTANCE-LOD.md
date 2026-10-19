# R32 Yanxi ruin distance detail

## Scope and measured result

The unchanged 11,672-triangle near ruin now has a 1,164-triangle distant
silhouette: 10,508 fewer visible triangles (90.03%) while distant. Each level
uses five merged material buckets. This is a visual-only optimization of the
existing evidence-bounded present-state prototype; it does not increase its
historical or survey confidence.

- Switch to far at a camera-to-anchor distance of 120 m; return to near below
  108 m (Three.js 10% hysteresis, normal camera zoom 1).
- Initial state is near visible and far hidden. Exactly one level is visible
  after every update.
- Ordinary exterior walking views and the 100 m overhead view retain the
  complete original geometry. The six unchanged performance cameras select
  far / far / far / near / far / far in their existing order.
- All original collision boxes, navigation metadata, rooms, walkables, map
  entries, regions and the ground cutout are unchanged. Flight clearance is
  also unchanged: the complete 331,250-cell height and water arrays compare
  byte-for-byte with the original single-detail ruin, including when the
  zone is prebuilt but unloaded and both LOD levels are extracted.

## Distant silhouette

The far assembly is derived from the original tagged members before merging.
It retains all four polygonal corner pavilions (southern six-sided, northern
eight-sided), the two-tier eight-sided central pavilion, every upper frame
post, lower/upper frame rings, southern partial crown ribs and sheet remnants,
the central surviving cap/finial, all main and corner masonry openings, the
dry recessed pool floor and banks, coping, perimeter rail and corner posts,
the exposed beam layout, and the protected front approach.

Masonry becomes two-sided thin geometry with coarse arch segments. Horizontal
frame rings and thin beams become two-sided ribbons. Post caps, small collars,
string courses, lower frame infill, tiny crown trim and repeated rail posts
are omitted; stair treads become one bounded ramp. These approximations are
never used for collision or to authorize access. No finished roof, water,
glass enclosure or new visitor route is introduced.

## Integration and ownership

`ZoneBase` detaches only the identified raw Yanxi frame before `CourtKit.finish`.
After the ordinary zone merge, `YanxiRuinLOD` separately merges the unchanged
near frame and the far assembly and installs an anchored `THREE.LOD`. The
original structure record is preserved exactly in zone architecture metadata.
This avoids `MergeUtils.traverse` flattening both levels even under a parent
`noMerge` tag. The near builder itself is unchanged.

Five owned `MeshStandardMaterial` clones provide the far silhouettes'
`DoubleSide` setting. Original near materials are untouched; no textures are
added. The two levels therefore use distinct material identities and remain
singleton meshes in the current `BatchedBuilder`, so the renderer's automatic
LOD update selects the current frame without a stale cross-level batch. Tests
also force genuine shared-material batches and verify level selection,
per-object frustum culling and actual multi-draw counts after LOD selection.
No global rendering, lighting or performance thresholds change.

Resident geometry overhead is explicit:

- Near: 11,672 triangles, 35,016 nonindexed vertices, 1,120,512 attribute bytes
- Far: 1,164 triangles, 3,492 nonindexed vertices, 111,744 attribute bytes
- Combined: 12,836 triangles, 38,508 vertices, 1,232,256 attribute bytes
- Added residency: 5 geometry buckets and 5 owned materials; zero textures

Attribute bytes count position, normal and UV typed arrays only, excluding JS
objects, driver allocations and any separately generated render-batch copies.
Source geometry is disposed on merge, and both merged levels and all owned
materials are disposed once on zone unload. Rebuilding uses new zone instances,
as in the existing zone manager.

## Verification

`node --test tests/r32-yanxi-distance-lod.test.mjs` passes 10 dedicated contracts:
initial visibility, exact frozen raw near/navigation hashes, near world-space
vertex equality within float32 merge precision, identical normals/UVs, finite
nondegenerate far faces and bounded silhouette, geometric openings, all camera
directions and six existing performance points, 100 m overhead, actual
BatchedMesh visibility/culling, two load/unload cycles, source/merged disposal,
and byte-identical complete flight grids.

The dedicated suite plus existing Yanxi ruin, Yanxi integration/storehouse,
flight envelope/camera and structural-contract tests pass. Browser captures,
full scene performance and final immutable source/scene bindings remain the
integration owner's gates; this CPU result alone is not visual acceptance.
