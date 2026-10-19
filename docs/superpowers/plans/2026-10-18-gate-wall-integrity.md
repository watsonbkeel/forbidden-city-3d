# Gate and courtyard-wall integrity implementation plan

**Goal:** Repair source-supported gate/wall discontinuities while preserving the existing building anchors and prior accepted work.

**Architecture:** Use the current ZoneBase/CourtKit path, with small schema validation and explicit corrected zone data. Dedicated east/west city-gate topology will be isolated from generic gates. No broad renderer or controller rewrite.

**Baseline:** Local c060426c has exact tree 5edbfe05, matching remotely verified main 0b28e5ee. Main is not edited. Branch fix/r6-gate-wall-integrity-20261018.

**Scope and evidence:** Parent-approved stage A: audit all 74 named gates, prioritize Bao Tai, Lian Xi, Donghua/Xihua, and Huangji/Ningshou courtyards. Existing audit CSV is a diagnosis input, not acceptance. Official texts/plans determine topology; approximate model registration is disclosed. Do not silently enable malformed court rectangles or invent measured dimensions.

## Steps
- [x] Verify execution, active workers, current remote refs and exact source baseline.
- [x] Run existing baseline zone lint: 70 zone gates, 0 errors and 23 inherited warnings. Four main-axis gates require their dedicated checks. This test misses the known disconnected walls.
- [ ] Add focused failing tests for malformed/empty court construction and missing gate-wall contact. Record the 74-gate baseline once.
- [ ] Fix proven schema/circulation and gate-orientation defects using verified source evidence; retain primary links and uncertainty.
- [ ] Implement isolated source-supported east/west city-gate geometry and enclosure contact; preserve anchors and test all portal paths.
- [ ] Review all affected doors, walls, courtyard circulation, map anchors, material ownership and geometry budgets.
- [ ] One complete necessary regression after integration, then bounded native visual/passage evidence. Preserve failures; no blind retries.
- [ ] Freeze one combined source/build package and remote branch only after checks. Do not package or upload each micro-fix.

## Review focus
1. Invalid bounds must fail explicitly instead of constructing an empty courtyard.
2. A gate can be locally passable yet detached from its named wall; test actual contact as well as passage.
3. New court walls must not block the rear path from Huangji to Ningshou or the cross street behind Ningshou.
4. East/west mirroring must preserve portal normals, collision dimensions and roof topology.
5. Existing approximate anchors are not survey coordinates; do not shift them merely to make an assertion green.

## Activity record
Stage starts 2026-10-17T23:58:42Z. Keep concise command/test/upload counts and wall time in the external candidate receipt. Actual model-token usage is unavailable and will be reported unknown. One implementation owner; one independent source researcher; no per-fix publisher/validator workers.
