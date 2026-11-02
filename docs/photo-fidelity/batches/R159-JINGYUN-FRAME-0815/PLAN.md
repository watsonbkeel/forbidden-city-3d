# Jingyun coarse plaque-frame implementation plan

Goal: replace only the canonical Jingyun generic gold rectangular backing by a photo-supported coarse red/gold ribbon outline, keeping its Han face and all navigation/physics unchanged.
Architecture: one private module invoked immediately after the existing SideGate plaque creation. Exact canonical placement and source checks; same plaque record, face and frame object. Change frame geometry, add a red inset using existing shared materials. No atlas changes.
Tech stack: Three.js / CourtKit, Node test, CPU geometry raster.
Spec: integrator approval 2026-11-02 08:11–08:14; official own-photo 3907, no measured dimensions/Manchu/carving claim.

## Approaches
Selected: replace only frame geometry, retain face and atlas. Rejected: textured photo/full plaque replacement (changes text/resources); overlay old rectangle (retains wrong silhouette).

## Constraints / review focus
- Same canonical anchor, text, face vertices/UV, record order and atlas output.
- All colliders, walkables, map/room/regions, other gates and non-frame visible geometry unchanged.
- No new materials/textures; geometry release exactly once with existing finish/dispose.
- Noncanonical, no-plaque, duplicate and changed-source cases must not silently mutate.
- Solid coarse border behind the Han plane, no roof/beam penetration or letter occlusion; sizes fitted, not measured.

## Single bounded task
- [x] Capture parent gate/atlas/physics hashes; write missing-outline and resource/guard tests; observe RED.
- [x] Implement one private module plus exact SideGate call; no global kit/physics changes.
- [x] Run component/resource checks, preserve raw RED; compare actual source flows and atlas to parent.
- [x] Export and personally inspect two small actual-geometry CPU views, including unchanged actual atlas; no GPU/full-World claim.
- [x] Freeze source/QA/docs/pins; independent Astra review, unique integrator handles final build.

Ruling (integrator approved 08:18): old .1m backing intersects original beam; new geometry alone uses .03m depth in existing 5cm face-to-beam gap. Neither host/face/beam nor physics moves.
CPU limitation: current offline Canvas does not load CJK glyphs; keep original blank-blue diagnostics and do not claim text readability. No font/GPU work added.
Verification: 6 missing-function/outline RED → 6 first green → 8 final green; last two are preservation coverage additions, not additional product changes.
Review handoff pending; no source changes planned.
