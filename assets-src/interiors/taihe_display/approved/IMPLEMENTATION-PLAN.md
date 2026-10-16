# Taihe display-pair isolated prototype

Approved input: reviewed display design and owner handoff, 2026-10-16. Source reference is frozen V16 57db2276404220f2072d182f759f1422871ac371. Obsolete design-card base and arithmetic are not adopted.

Goal: reusable self-authored mesh source for eight objects and eight supports, with inspectable S and fallback geometry. CPU only; no product wiring, browser, renderer, publication, architectural/collision/navigation changes, atlas edits or material mutation.

Architecture: `mesh_kernel.py` contains deterministic triangle builders. `taihe_display_pairs.py` owns the bounded local meshes, fixed approximate placements and source anchors. `verify_candidate.py` exports geometry and CPU checks. Existing material keys only; no new vertex-color/UV/shader behavior.

1. Write contract tests first and confirm the missing prototype fails.
2. Implement bounded lofted silhouettes, open stands/limbs/trunks/beaks, and a sparse pierced double-eave cylinder. Use simpler purpose-built fallback meshes within 480 total triangles.
3. Check counts, positive triangle areas, finite normals, index validity, pair translation identity, support count, envelopes, pair and frozen-object clearance, published crane anchors, material-key subsets, and source isolation. Save raw mesh JSON plus deterministic reports.
4. Write integration notes, including approximate placement, weak incense-specific evidence, inherited pearl limits, and unperformed visual/runtime acceptance. Hand back the prototype without wiring it into any product source.

Review focus: narrow features crossing envelopes; mirrored winding; coarse fallback preserving identity; cylinder gaps that are real geometry; crane 1.68 m excludes only 0.10 m wood support and includes rock/wave base.

## R2 authorized repair continuation

The predecessor above is frozen. This isolated successor corrects actual fallback material sidedness and geometric contacts, retaining the exposed lower roof disk and using the approved 164/78/110/128 fallback ledger. The first 164/86/110/120 proposal is superseded because its conditional cap-removal premise failed. `REPAIR-DELTA.md` is the current implementation record. Tests precede/record the failed joint repair and include actual-vertex negative mutations. Twenty-four current tests pass. Non-indexed per-face normal expansion is mandatory; no product integration is authorized by this prototype.
