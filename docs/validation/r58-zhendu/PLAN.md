# Zhendu bounded implementation plan

Goal: implement a reversible, independently evidenced single-portal high-platform shell without modifying shared integration files or Zhaode.

Architecture: pure ZhenduGateProfile owns geometry, documentary/fit layers, transforms, supports and explicit wing contacts. ZhenduGate builds actual meshes/collision from it through CourtKit. New test fixture calls the builder directly, never buildWorld. An existing-world consumer inspects merged architecture/support registration without constructing a world.

1. Write tests for identity/independent evidence, input rejection, actual platform/ramp/aperture geometry and genuine support, watch expected missing API failures.
2. Implement profile and dedicated builder using safe low-level CourtKit/roof/door/pruning primitives, without existing profile calls or copying its fitted values.
3. Add actual FirstPersonControls at 10/60 Hz in both travel directions and both movement directions; support provenance, retained solid body negatives, closed leaves, mutation detection, finite/disposal checks.
4. Run focused tests only. Save source/before/after/patch/unknown records. Parent will perform shared integration and broader regression.

Review focus: invalid/cardinal transforms; low-ground spawn cannot rescue onto deck; ramp removal cannot pass on endpoint-only evidence; merged geometry must match support; rear/wing unknowns cannot turn into acceptance metadata.
