# Numerical intersection reporting, not contact acceptance

The original 5 tests accepted an implementation that always returned false for triangle intersections. Preserve that false green. The current component implementation was not demonstrated geometrically wrong; the regression oracle was incomplete.

The first independent segment-plane / barycentric oracle compared complete counts strictly. It produced a real 5/6 RED: one strip had 5 versus 6 triangle pairs. Two floating-point algorithms differ at an edge; the original raw Three-Ray kernel is unchanged. Do not erase that RED or claim all independent pair counts equal.

The final test independently classifies each actual AABB-candidate pair:
- stable interior crossing or clear separation: hard equality with the kernel;
- unresolved numerical boundary: recorded, never accepted as contact/sealing/support.

The 1e-10 band is exclusively in dimensionless segment t and triangle barycentric parameters. It is NOT a world-meter gap tolerance, bridge or geometry acceptance rule. Denominator conditioning is explicitly detected at 64*Number.EPSILON times normal/direction scale (or aa*bb for the barycentric determinant), and nonfinite results are unresolved. Per-pair JSON retains mode, instance/layer/face, tube/tile ordinal, both original bool results and segment/plane parameters (later parameters need not be evaluated after an earlier out-of-range or unresolved branch).

Each mode has 32 unresolved pairs. Stable pairs are predecessor 2548 crossing / 25612 separated; proposal 2228 crossing / 25576 separated. The reported aggregate is also checked by a second iteration over actual triangles using the same raw kernel: this is independent bookkeeping, NOT a second independent geometric intersection algorithm.

All raw boundary reports remain false for supportVerified/accepted. Counts cover each layer's own hips versus own tile surfaces only. They do not analyze pavilion–wing intersections, fascia–soffit sealing, complete trim union or architectural bearing. A strip having one intersection does not imply that strip, its ring or the extended tip is continuously in contact. Whole-roof watertightness, structural assembly, real support, runtime/GPU and production installation remain unapproved.
