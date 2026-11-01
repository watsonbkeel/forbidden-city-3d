# Rear-left own high-platform / broad-approach candidate

Base: `0b24e420c7afd2f5c5aac9b4e7e79b42c1d196b2`. Independent development only; `branches`, main and Pages unchanged. The current downloadable 276449 cumulative package does not include this candidate.

## Own evidence and bounded engineering fit
The official 后左门 southeast / southwest / south covers in group 2013779953911173124 show a high grey masonry terrace, broad south approach and white balustrade. The three 240px images establish the silhouette, not metre measurements or exact railing counts. North-facing-outward cover is not evidence for a north ramp. Raw source metadata and hashes are retained; copyrighted reference pixels are not production textures.

Retain item16 anchor (-76.4,123), 15.2 × 6.4 m original gate footprint, single 3.6 m portal, own south lattice / north ochre panels, roof, two leaves and original vertex buffers. Lift this original object and its original colliders by 1.8 m. Add real masonry beneath its unchanged paving, 8 m wide / 12 m long solid approaches with matching ramp support and sloping white rails. Heights, lengths and plain rail detail are **engineering photo fits, not survey values**. North approach is an explicit safe continuation, not photo-reconstructed historic work. Existing generic ramp construction is reused as implementation technique; Houyou is not used as photo evidence.

No layout, neighbour wall/gallery anchor, physics controller, shared contact policy or Houyou geometry is changed. The entire current Houyou capture is preserved exactly. Actual World pre-scan of both proposed approach zones found zero intersecting non-target colliders. Rails have matching segmented proxies; platform support is not a rescue surface. Both side bodies and closed leaves remain solid. Existing item17 7 m wall collision still blocks elevated players.

## Verification
- Initial component RED: 5 fail / 1 pass for missing high platform, actual support and rail geometry; retained verbatim.
- New 6 components pass: original gate vertex/pose preservation; exact original body lift; actual raycast ramp/support agreement; rails/closed bodies; real TextureLibrary/material merge and high wall rejection; closed door.
- Old related regression on candidate initially 3 failures from ground-floor / old metadata expectations. Updated only those explicitly changed expectations to 1.8 m, three true supports and reconstructed approaches. Other assertions preserved. Final selected 15/15 pass. One historical test requiring unavailable `98cfd572` remains explicitly excluded by name, not repaired or claimed green.
- Actual World 32/32 completed: 24 rear-left cycles (three lanes × 10/60 Hz × walk/run × both initial directions), 4 retained middle-right and 4 retained raised rear-right cycles. All start beyond actual ramp toes on ground; full original frames preserved. This is a selected route result, not complete-city acceptance.
- Four same-camera CPU before/after views include actual retained transverse wall. Flat category palette, not real albedo/GPU/light/phone screenshots. A first render label inherited HOUYOU; final images correct it to HOUZUO without geometry changes, both render logs retained.
- Root application build uses `/gugong/`; exact module count, dirty 0b24 runtime identity and source fingerprint are in build log / build-info. No claim of clean postcommit build.

## Limits and rollback
Whole-object / 37-item user acceptance, GPU, mobile, historic dimensions, exact north approach and detailed carving remain unverified. Existing historical zone-suite and missing-object limitations are not closed. Roll back these two production paths to 0b24 (or use prior cumulative branch/package); no migration or new data is needed. Do not replace user `branches` automatically.
