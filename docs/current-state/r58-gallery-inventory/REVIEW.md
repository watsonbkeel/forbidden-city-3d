# R58-A explicit gallery unknown-inventory fallback

Base: 1549a70b51ac184695aeebbca725ec4d809a4454. Independent branch: r58-gallery-unknown-inventory.

## Result and limits

This removes unsupported generated contents, not real-world objects. It does not assert the actual galleries are empty, establish a current exhibition date, or validate inherited room partitions. Interior status remains PARTIAL / BLOCKED_SOURCE. Inventory UNKNOWN and inherited layout UNVERIFIED are separate fields on all 52 actual runtime room registrations, with knownEmpty:false, accepted:false and historicalRoomIdentity:null. Existing room/storage kind labels are retained consumer presets, explicitly unverified as historic uses.

Exact opt-in data targets:
- FC-CA9102BFFB: axis-courts/items/28,29,30.
- FC-B31A272965: axis-courts/items/34,35,36.
- FC-0D3F161564: axis-courts/items/31.
- FC-86FF7FC2AB: axis-courts/items/37.

Items38–41 and all other rooms are excluded. Their existing gate-contact-resolved endpoints are unchanged. The only data changes are eight furnishingPolicy fields with mode, target and reviewId. Undefined retains the old default. Explicit invalid modes, mismatched review/target/zone/kind, extra keys, detached item identity, direct hall misuse, and unvalidated furnish/registerRoom calls fail rather than silently changing scope.

## Exact physical delta

Across the eight selected direct components:

| Stream | Before | After | Delta |
|---|---:|---:|---:|
| Meshes | 1,154 | 748 | -406 |
| Triangles | 31,096 | 26,224 | -4,872 |
| Colliders | 894 | 488 | -406 |
| Candidate runtime rooms | 52 | 52 | 0 |
| Cover points | 162 | 0 | -162 |
| Room/door navigation spawn points | 104 | 104 | 0 |

Every removed mesh is an actual furnishRoom BoxGeometry and has its own collider recorded at creation. Every removed cover point has a corresponding prop-face owner. No overlap-based deletion is used: the opt-in branch never creates unsupported props, their colliders or covers. Consequently shared/structural colliders survive even where they overlap a prop.

The 104 retained spawn points depend only on each room center and door offset, not on any prop. Removing them would delete unrelated navigation metadata, so both points per room remain byte-exact. Room IDs, bounds, heights, doors, regions, maps and walkables are unchanged, apart from intentionally empty covers and added evidence metadata. All 44 inherited transverse partitions remain unverified candidate structure, not evidence of a historical census.

Direct-fixture unique geometry count falls by406 and geometry-buffer memory by341,040 bytes. The complete bounded fixture still uses20 unique materials and7 kit-owned materials because retained prerequisites/controls share them; no shared material is disposed or cloned for suppression. Resource counts are CPU allocations, not browser GPU measurements.

## RNG and default preservation

furnishRoom uses a fresh local LCG per room, seeded from frame/room coordinates. Removing earlier furnishings does not advance or disturb another room's content PRNG. Three.js UUID allocation changes the global Math.random cursor; this is not a physical regression, so there is no fragile allocation-count compensation and no construct-and-discard path.

Sequential assembly checks use one seed across the target corridors, four excluded southern components, then a generic corridor and unrelated furnished hall. Actual retained attribute arrays (positions/normals/UV), indices, matrices, draw/shadow/material properties and navigation streams match frozen baseline exactly. A second check uses real production TextureLibrary.material and all22 real CPU-generated fallback textures, preloaded before geometry as main.js does. Every pixel hash and later physical/material stream matches. UUID strings and numeric internal Three.js object IDs are intentionally outside the equality contract.

## Verification and evidence

Command:
node --test tests/r58-gallery-inventory.test.mjs tests/r58-gallery-textures.test.mjs tests/r58-gallery-controller.test.mjs tests/r58-gallery-consumer-negatives.test.mjs

170 targeted tests pass. No full zone/world construction, all-suite, production build, package, browser or publication ran.

- Initial red-first output: reports/r58-gallery-inventory/red.tap. A south-target negative initially stopped at its prerequisite gateJoin; its fixture was corrected to isolate the intended target validation. It now rejects for policy identity.
- Independent review found and corrected validation bypasses and consumer proof holes. Their red evidence is review-red.tap and shape-red.tap; final result is green.tap.
- Actual per-prop provenance, exact room records and source hashes: component-delta.json.
- Full actual before/after mesh attribute/material and physics/navigation streams: actual-streams.json.gz.
- Exact local allocation counts: resources.json.
- 128 actual FirstPersonControls route runs: controller.json. Eight target components ×10/60Hz ×walk/sprint ×W/S, covering entrance round trips and retained exterior frontage. No controller/collision implementation changes or per-frame teleport/height override.
- All52 room entries also have collision, floor-support and positive rendered floor/ceiling checks. This does not invent longitudinal passages through the retained full-depth partitions.
- Matched-camera before/after item28 and item31 PNGs are actual CPU component base-color diagnostics, visibly labeled UNKNOWN-inventory fallback, not reconstruction. They omit textures, GPU lighting and browser output. Camera/source manifest is views.json; triangle exports accompany the PNGs. Long near-plane-crossing floor/ceiling triangles are clipped by the rasterizer, not incorrectly discarded by projected-vertex frustum tests.
- No official source images/PDFs enter the public tree. sources.json links the inherited review sources and preserves unknown capture dates. Exhibition notices remain dated2008/2009 evidence, never current-display claims.

## Existing-W integration contract

Import assertGalleryInventoryInWorld from tests/lib/r58-gallery-world-check.mjs and call it with the already-constructed W containing scene, cm and actual rooms. It never builds or loads a world or re-creates missing registrations. It checks exactly the eight policies and52 room records, all26,224 retained component triangles, all4,872 absent prop triangles independent of material names,488 retained structural colliders,406 absent prop colliders and8 retained walkables. Triangle matching normalizes actual Float32 world positions then uses a1mm key only for merge compatibility, not a survey-precision claim. Before-merge raw-stream equality is a separate exact check.

The consumer respects actual drawRange, object/material visibility, opacity and colorWrite. It understands normal merged meshes and existing solid-material batch source names. It fails closed for scoped non-character InstancedMesh, multi-material architecture or non-triangle-aligned drawRange; those are unsupported consumer representations, not permission to reconstruct or accept missing evidence. Character batches are not gallery architecture and are ignored. A caller without actual room registrations is unsupported and must supply them from its existing W, not rebuild.

Integration owner retains the next cumulative world with108 actors, whole-world checks and browser acceptance. This slice does not claim actor-world or deployed acceptance.

## Resume / rollback

Scoped production files are axis-courts.json, ZoneBase.js, kit.js and GalleryInventoryPolicy.js. Tests, frozen baseline fixtures and this evidence accompany them. Reverting the scoped commit restores the original procedural contents and removes only these explicit policy fields. No main branch, Settings, Collision, FirstPerson, account permission or credential changes.

adoption.json retains all six interior features and the existing required extra scopes for each review row. The integrator may adopt the actual change while preserving source/runtime blockers. Next source work remains: actual room/passage topology, side-specific gallery elevations and arch stations, full room/ceiling/floor views, dated exhibition inventory and original locations. Do not populate guessed museum displays or remove unverified partitions in this slice.
