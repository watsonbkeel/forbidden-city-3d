# V2: exact Qianqing Gate solid-material batching

## Scope

This follow-up to V1 (`e9d91cd721b510052397eb396b0e19562dd71763`) changes only how six existing solid-color Qianqing Gate materials are submitted. After `PalaceBuilder.finish` has baked all nested transforms and performed ordinary material merging, `batchSolidMaterials` concatenates those six meshes into one `MeshStandardMaterial` draw.

The six sources are the window grid, frame and shadow, green/gold glaze, and screen center. Textured doors, roofs, stone stairs, connector surfaces and every other material are untouched. No baseline, threshold, global merge implementation, collision, movement, structural dimension or vertex position is changed.

## Rendering equivalence

- Every source triangle is retained in its original source order, with unchanged position, normal and UV values in the post-finish identity-transform case. No welding or simplification occurs.
- Source `THREE.Color` components are already linear. They become constant-per-triangle vertex colors with a white diffuse multiplier. Roughness becomes a constant-per-triangle float attribute with a uniform multiplier of one.
- A small `onBeforeCompile` patch multiplies `roughnessFactor` immediately after Three's `roughnessmap_fragment`. The physical lighting chunks, roughness floor, normal-derivative correction, fog, tone mapping and shadow pipeline remain the standard implementation. The custom program cache key is stable and versioned.
- Compatible common standard-material properties are cloned. Texture-bearing, transparent, custom-shader, existing-vertex-color and incompatible inputs throw before changing the source tree or disposing source resources. Mesh render/shadow flags must match; custom render/shadow callbacks, independently frozen world matrices, partial draw ranges, morphs and unsupported attributes are rejected.
- Explicit source triangle ranges retain original material identity for ray queries. The existing physical window-grid test now checks the actual hit triangle's source, rather than accepting any batch hit.

The helper also supports static direct-mesh transforms, including mirrored winding, while retaining the root transform. It is deliberately not a replacement for the general scene merger or an animated-object batching system.

## Ownership

Replaced source geometries are disposed once after a successful replacement, except when an unselected object under the same root still uses one. Intermediate cloned geometries are always released. Source materials remain in the builder's existing ownership/cache and are disposed by `PalaceBuilder.dispose`; they are not prematurely invalidated. The new batch material is added to `builder.ownedMaterials`, and the batch geometry is owned by the existing finished-object lifecycle. Repeated builder disposal does not dispose either generation twice. Library materials stay library-owned.

## Verification

The focused tests were written and observed failing before implementation: the helper export was absent, and the real gate did not contain a batch. After implementation:

- `npm run test:current-state`: 66/66 passing, including all earlier structural/walkability tests and three review-added no-mutation/no-disposal guards for shadow callbacks and frozen world transforms.
- `npm run build`: passing; existing large-bundle warning remains.
- Real gate meshes: 24 → 19; geometry: 14,160 triangles unchanged, including all 4,800 batched triangles.
- Real gate colliders: 162 unchanged; walkables: 6 unchanged. Serialized metadata, collision and walkable data match the immediate pre-batch production output exactly.
- Exact attribute tests cover all selected triangles and untouched meshes; focused tests also cover linear color, roughness, transforms, reflected winding, shadow flags, shader injection order/cache identity, rejection paths and source/new resource disposal.

Browser shader compilation, high/low/high quality switching, fixed-camera captures and the unchanged performance/runtime gate are verified separately. A five-draw reduction in the fully visible gate does not itself establish a browser performance-gate pass; no browser result is inferred from these unit tests.

## Integrated browser evidence

The original six-point, 60-frame performance measurement passes every unchanged P2 calls/triangle budget. Wumen calls fall211→206 and Qianqing178→168; all six measured triangle totals match V1. Runtime regression passes24/24 and fixed walking132/132. Nine matched images retain the silhouette; the largest above-threshold pixel difference is0.00406%, not pixel-identical output. The larger combined culling bound can submit additional existing triangles in other views. Full figures, source provenance, remaining inherited failures and production verification are in [V2-ACCEPTANCE.md](V2-ACCEPTANCE.md).
