# Current compact-head / inward-coil candidate

This section supersedes the earlier shape decisions and counts below. Earlier rejected receipts are retained as history; they are not acceptance claims for this candidate.

## Reference bounds and scope

The inspected official 803×1024 photo gives approximate visible horizontal bounds: skull/brow X=365–430, coiled mass X=260–530, and support canopy X=332–457. These correspond to apparent skull/body ≈0.24 and skull/support ≈0.52. Horns and whisker curls extend beyond the skull. The canopy partly hides the lower head, and different relief depths and perspective prevent treating these pixel ratios as dimensional measurements. The seven gray spheres in the modeled runtime view are retained pearls, not eyes.

The approved authoring target is deliberately more conservative: skull/body width 0.30–0.35. The final CPU mesh has skull width 0.70 m, coiled-body width 2.1460434171 m, and ratio 0.3261816580. Its original support width remains exactly 0.64 m, giving skull/support 1.09375. That remaining mismatch with the photographed canopy is explicit; this task does not reinterpret or enlarge the support structure.

## Minimum anatomy and body changes

- Narrow the skull, shorten its broad forehead-to-muzzle span, and introduce a pinched bridge with a short convex muzzle instead of the uninterrupted shield-like face.
- Keep the horn and cheek-scroll spread beyond the skull. Relocate paired darkGold eye recesses onto the new downward-facing brow surface.
- Replace the empty upper arc with an off-centre inward curl. Separate the overlapping projected turns in height, and vary the sweep width smoothly. No added decorative marks or materials are used.
- Preserve the exact previous pearl-support triangles, all seven pearl parameters, the opening/anchor/profile and the complete 38-triangle fallback. Tests pin canonical support and fallback geometry receipts.

The local carving orientation remains a photo-informed design estimate, not surveyed compass registration. Reference photographs remain research-only.

## Frozen source and CPU evidence

Geometry SHA-256: `fd0c44616b0ce328adccce26573f45a0affbddd68640442babd5e43a7db8753b`.

Detail addition: 2,302 triangles, comprising 2,260 gold and 42 darkGold. The 38-triangle fallback is unchanged. Existing material batches and APIs remain unchanged. Against the original 12,128-triangle S asset, the dragon alone would produce 14,430 triangles; integration must account separately for any shell work within the unchanged 18,000-triangle/eight-batch budget.

Eighteen focused CPU tests pass. Coverage now includes every face's outside/inside solid-angle winding in source doubles and float32, at offsets of 1e-7 and 1e-6 m, without excluding adjacent faces. The exhaustive CPU test uses NumPy; the geometry module remains dependency-free. The prior local cheek-tip regression is retained. Compact-skull and upper-curl coverage tests were observed failing on the prior source before implementation.

The retained-tier clearance is 0.0853001658 m; cap clearance is 0.1895022084 m; satellite clearance is 0.3183981666 m. The central support retains intentional tangent contact. Minimum Y=8.98, maximum Y=11.0542477916 and maximum radius=1.2124524178. Additional shell framing must respect these gaps and receive its own compiled-geometry clearance checks.

The actually inspected `compact-head-below-front.png` shows below/south-front and direct underside CPU views with unchanged nominal pearls. The inward curl and compact muzzle are visible. The result still reads as a simplified angular horned carving; it is not a museum-fidelity claim. The broad outer sweep, sparse relief and angular horns remain visibly simplified. Combined shell and dragon runtime pixels, rather than this shaded orthographic illustration, remain the visual acceptance evidence.

No registry, compiled asset, lighting, navigation or shell source is changed in this three-file candidate. The audit directory contains the source receipt, test log and inspected CPU render.

---

# Earlier shape history

# Taihe caisson shape revision

## Evidence and scope

The official [Palace Museum photograph](https://img.dpm.org.cn/Uploads/Picture/dc/1602%5B1024%5D.jpg) shows a broad downward-looking dragon face, curling horns/whiskers, a coiled body and the suspended pearl group. The museum's [article](https://img.dpm.org.cn/Uploads/pdf/1944/T00008_00.pdf) describes the square, octagonal and round layers and the central coiled dragon looking downward.

The first ordinary near-view capture of the prior candidate showed a ring-like body, a tapered pendant-like head and repeating dark triangles that read as teeth. Its small facial details were not usefully visible from below. This revision addresses that specific visible failure.

All proportions and local carving orientation are authored, source-informed estimates. They are not traced contours, surveyed dimensions, a conservation reconstruction, or an assertion of the historical carving's compass registration. The original caisson anchor and opening are unchanged. Reference photographs remain research-only assets.

## Shape decisions

- Replace the long upright head with a broad, shallow downward-facing mask. Put the forehead toward the modeled south approach so a visitor below sees the face above the pearl. This orientation is explicitly provisional.
- Expose paired recessed eye planes under angular brows. Use the existing darkGold material for those recesses, without a texture or new material.
- Retain a short broad muzzle and side cheek scrolls. Extend the horns beyond the face and give each a distinct side branch.
- Replace the nearly uniform C-shaped body with an uneven compact return and a tapered tail. Remove the repeating dark triangular body marks entirely.
- Retain the existing pearl-support contact at Y=8.98. Do not rebuild, move or recount the seven pearls.

## Budget and interfaces

The detail addition is 1,522 triangles: 1,480 gold and 42 darkGold. The 38-triangle fallback is unchanged. Both reuse existing material batches. The public APIs remain `build_candidate`, `material_batches`, and `clearance_report`; new facial labels retain exact triangle ownership.

No runtime, registry, generated GLB, lighting, navigation, dais, screen or retained tier/rib geometry is changed by this module revision. Integration owns those checks separately.

## Verification and limitations

Fourteen focused CPU tests cover budgets, deterministic output, finite unit normals, nondegenerate faces, consistent closed-shell winding, head/body connectivity, per-material export, actual retained tier/cap distances, analytic pearl clearance, nonadjacent face intersections, downward-facing eye recesses, visible horn extent, inner return and absence of dark body teeth, and local inside/outside solid-angle winding on every cheek-scroll face in source doubles and exported float32 coordinates.

The inspected design image `shape-r2-below-front.png` has a below/south-front view at 65 degrees and a direct underside view, both showing the retained nominal pearl positions. It is an orthographic CPU shape illustration with simple shading, not a runtime screenshot or lighting acceptance. In the south-front design view, the eyes, horn forks and cheek scrolls remain exposed above the central pearl. The result is still a deliberately simplified carved-dragon approximation; actual ordinary scene pixels remain the acceptance evidence.


## Rejected local-fold candidate and narrow repair

Source SHA-256 `3524e8278097671d85beb0596551c36dd39635dfa8c5694eeb75e8c9c70ea55f` and compiled asset SHA-256 `49624fba48c24f66656e037ab4f4f5231c37d45a9f665141dbf9a60fbf074786` are rejected. Independent solid-angle checks found six inverted terminal cheek-scroll faces. The fixed-plane triangular sweep's final centreline step had reversed through its previous section. Positive total volume, paired edge winding and the adjacency-skipping intersection test did not detect this local fold.

The repair moves only tip vertices 746 and 762 along each branch's outward root normal by 0.0334595092 m and 0.0394451333 m. This leaves 0.01 m of forward advance beyond the final section. All other vertices, topology, materials, semantic ownership, pearl contact and fallback output are identical. The geometry source now has SHA-256 `c1645e72c63e3e19f06967cb20261e50b63b35020699de9f17458f7903c017c4`.

The new local-winding test was run before fixing and failed on precisely the six terminal faces in both source and float32 form, at offsets of 1e-7 m and 1e-6 m. It then passed after the narrow repair. The earlier `shape-r2-below-front.png` design rendering belongs to the rejected source; the repaired design rendering is `shape-r3-below-front.png`. Both are CPU illustrations, not runtime acceptance evidence. The independent compiled-asset recheck remains an integration requirement.
