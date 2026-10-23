# Parent-only shared hookup

Apply `HOOKUP-PROPOSAL.patch` to the integration worktree after importing these new files. No shared files were modified in this worker branch. The patch targets frozen 755dd9a; rebase carefully around other R58 changes.

- CourtKit: import `buildZhenduGate` and explicitly dispatch profile `zhendu` with `gateKind: three-bay` before the generic five-bay branch. Return platform wall gap 24.0 m.
- ZoneBase: capture `zhendu` gateGeometry; allow its explicit joins alongside zhaode, preserving current transform/direction/finite endpoint validation.
- axis item 10: `gateProfile: zhendu`, `gateKind: three-bay`, `open: true`, `dimensionStatus: provisional`; preserve name/anchor/style. item 11 wall gap remains name-bound, now resolves 24.0 m. item 40 adds `{gate:'贞度门',side:'left',end:'to'}` and item 41 adds right/from. Original endpoint declarations remain; ZoneBase shortens them to contacts x=52.4 /76.4 at z=-217.3.
- tests/lib/world.mjs: `gateGeom` must explicitly dispatch zhendu before SideGate; front/rear extents 27.6/26.6 m, independent 3.216 m platform. This patch is needed by existing whole-world navigation consumers, not just runtime.

Consumer APIs in `tests/lib/r58-zhendu-world-check.mjs`:

- `assertZhenduInWorld(W)` accepts already built `{scene,cm}` and checks one unaccepted assembly, actual registered own supports, real ramp/deck/underside triangles, portal rays/body clearance. It neither constructs nor mutates the world.
- `replayZhenduRoute(t,W,{from='front',offset=0,fps=60,sprint=false,backward=false})` consumes existing W and Node test clock; runs actual production FirstPersonControls and support provenance. Only temporary instrumentation is restored after use.

Recommended integration check: build the relevant axis fragment once or reuse parent W; call the consumer. Check neighboring corridor/wall join faces and unchanged east Zhaode. Do not run a fullworld per independent controller case. Existing `zhaode-gate.test.mjs` has strict historical all-axis JSON and unrelated-corridor hashes which deliberately predate Zhendu: if updating them, normalize only these explicit new profile/join fields, never recalculate every baseline to green. The worker tests pass against the frozen shared baseline.

No global auto-route registry edit proposed. The new bounded route is available from the profile/consumer; parent can add a new route only without replacing historic descriptors. No blanket acceptance or building-fidelity completion change is authorized by these tests.
