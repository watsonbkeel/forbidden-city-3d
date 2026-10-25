# R90 independent review

Reviewed R90 working source against frozen R89 `de4f61e4`, the approved bounded north-connection plan, and actual official central-gate photograph pixels. Read-only source review; independent tests/results live outside the implementation worktree.

## Finding resolved
The first dedicated gate implementation omitted the inherited central name plaque. The official photograph visibly contains a blue central plaque facing Shenwu. Implementer restored one north-facing central plaque without inventing side plaques; fresh topology run including its actual transformed normal passes, 6/6.

## Fresh independent verification
- `node --test ../r90-independent-review/boundaries.test.mjs`: 1/1, 6.14 s actual-world CPU test.
- `node --test tests/r90-shunzhen-topology.test.mjs`: 6/6, including plaque and physical door proxies.
- Three garden unload/reload cycles retain one map identity and stable garden collider count. Actual `Teleport.resolveLanding` produces collision-free approaches for both Shunzhen and Shenwu.
- Each portal's left/right inner lanes traverse forward and return using real controller backward sprint at 10 and 60 Hz. No new floor rise.
- Four physical pier/interface seams remain blocking at either side and exact boundary within numerical probes.
- constants, Enclosure, GardenBuilder and PalaceBuilder have no delta from R89. Existing north global geometry is not shifted.
- Examined CPU north and oblique after images. Three gate silhouettes join the wall; plaque is present centrally. These are deliberately flat diagnostic renders, not game/GPU acceptance.

## Remaining release obligations
No blocker found in reviewed source after the plaque fix. Implementation owner must finish final aggregate/build/package gates. The early affected-regression batch contains file-level failures for R84 world routes and R89 independent world without an assertion, requiring isolated reruns; they must not be labeled inherited without diagnosis. HTTP/package failures in that early batch are missing build/package inputs, not acceptance. Exact legacy R32/Shenwu fixture assertions are separate and should be preserved/disclosed.

Side widths/spacing are explicit engineering fits. The supplied official photo shows the central door only; this review does not establish side spacing or measured fidelity. The axial/north-street baseline was already traversable; do not claim a repaired pre-existing central blockage. Real GPU, mobile and full-device walkthrough remain untested.
