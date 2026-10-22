# Exact LOD2 shoe-base successor

This is a bounded successor to the immutable R51 world evidence committed at `cc1cf52dcba99135101e6ef0a9702b7f3047e230`. No old world report or original log has been overwritten.

Only the approved CharacterKit shoe bottom-ring expression changes: `y:y+.024` becomes `y:lod===2?y:y+.024` at the one exact shoe loft call. The complete old source SHA-256 is `cc311f8fdaa912538fdfffebd66b7fa2c5de7f2c7063ffbc5bf462bc3f5edc6c`; the exact successor SHA-256 is `7696c28eaa608bcd726a724746a88a4770064d6b3da677445cad3dcc53a863ab`. Any other source difference fails closed.

## Fresh current binding evidence

`world-bindings-after-lod2-38-148.json.gz` was freshly generated from the repaired Kit and unchanged R49E world. All three adapters resolve 38 of 38 required actors. Both routes retain 148 samples; 796 independent actual-geometry support-owner rays pass. The complete actor bindings, full support audits and route values equal the original R51 results. All current Adapter/Queue/Kit hashes are recorded and verified.

The renderer budget test should now use:

```sh
R50_FRESH_BINDINGS=reports/r51-unified/world-bindings-after-lod2-38-148.json.gz
```

## Exact inherited evidence, not reruns

`world-lod2-inheritance.json` records all 38 roster actors at all three LODs, 114 geometry cases. The 76 LOD0/LOD1 cases retain every attribute/index byte, bounds, groups and draw range. All 114 cases retain metadata, support/seat-contact metadata, topology and triangle counts. LOD2 nonspatial attributes are unchanged. The independent shoe fix owner's broader 132-case tests cover additional pose/options combinations and bound the changed LOD2 y coordinates and derived normals.

All 185 architecture sources, the actor/path registry, LOD0 motion/deformation/options inputs and every original cc1cf52 world report/log remain exact. Therefore the original 684 LOD0 sightline results and 57 player-body plus 2 canopy results are inherited through the precise byte-preservation proof, not rerun or relabelled as fresh after the repair. The seven originally blocked sampled cameras remain a disclosed limitation. Original R51 capture scripts now reject the repaired Kit instead of accidentally overwriting the original capture identity.

These are CPU source/geometry/physics results, not GPU or pixel acceptance. Correcting the local shoe base does not by itself prove every rendered foot is exactly flush with every actual carpet/platform surface. Per-foot world-surface residuals and new production CPU images are separate production-QA evidence.

Validation: `tests/p3c-r51-lod2-world-evidence.test.mjs` plus the historical R51 and active-world tests passed 11/11. No architecture source, registry or required flag was changed.
