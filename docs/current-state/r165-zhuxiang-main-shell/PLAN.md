# 竹香馆主体一期 Implementation Plan

> Execution: sole assigned implementation worker, followed by independent read-only review. No concurrent writers, main changes or deployment.

**Goal:** Add a recognizable east-facing two-storey main building with three central bays and one ear bay on each end, preserving surrounding circulation.
**Architecture:** One guarded, atomic `buildZhuxiangMainShell(kit, zone)` component and one synchronous ZoneBase hook (new index136; old step indices remain unchanged). Unknown interior stays closed; no new teleport/map target or speculative connections.
**Tech Stack:** Existing Three.js r162, CourtKit, triangle contacts and Node24 CPU tests; no dependencies.
**Spec:** Parent-approved official-form exterior scope. Official236485 and actual1571 photo establish identity, position relationship, two floors,3+1+1 bays and green/yellow rolled-hip roof. Dimensions/location/window details are game fits, not survey.

## Constraints and choices

- Base ae712bcdc160113aca5dbd1e00e221b58ea94dd3, retain frozen branches and all cumulative fixes.
- Actual NingShou preflight reserve x[-244.2,-235.2], z[495,507], y[0,9.7] has no old visible mesh/contact/walkable. Main fitting near(-239.8,501), east means negativeX. Keep enough space to old west boundary, Yucui and Juanqin; do not expand without rechecking.
- Chosen standalone shell rather than whole rock garden/upper access: source does not provide safe detailed stair/hidden interior geometry. Yunguang L-shaped alternative currently intersects old visible/physical objects and is deferred.
- No stone hill, bow wall, plaque lettering, diagonal galleries, invented interior/furniture, or changed old controller/collision semantics. Two ear masses may use simplified roofs/closed windows explicitly as fitting.
- Reserve checks include old ordinary boxes, ramps and rendered bounds; all allocation tracked before filling, atomic append only after source/geometry completion.

## Review focus

1. Two-floor closed shell cannot create embedded-wall/high-fall traps: continuous drops/turning exits at10/30/60/144Hz, exact old wall included in production.
2. East/west sign and3+1+1 mass identity: photo/metadata, visible rays and bounded topology checks.
3. Close old neighbors: physical continuous south/north/front/back routes plus cumulative20 landings and all original objects.
4. Readonly/changed host or occupied ramps: reject before allocation/mutation.
5. Last geometry/contact/material failure: populated fault released once, borrowed resources and old objects retained; retry works.

## Tasks

- [x] Write missing-identity/hook red assertion and record real baseline failure.
- [x] Implement only this component, sampled closed roof surfaces and source bounds; compare contact solids to visible geometry and verify roof closure.
- [x] Test actual controller routes/closed-wall negatives, ordinary jumps, high drops and neighbor connections; retain failed prototypes rather than weaken tests.
- [x] Freeze exact ae712 ZoneBase and baseline actual NingShou raw/physical/maps/roof/20 landing records. Add hook136 while preserving old code after precise removal.
- [x] Independently review component and serial actual zone; source-normalize only exact new hook so historical assertions remain meaningful.
- [ ] Run bounded cumulative suite, disclose old reds, record J21 partial only; clean Pages-base build, full new branch readback, no deployment.

## 实施中更新

独审指出首版连续四坡未表达歇山上部山面，这不是无碍厘米误差。保留首版49b源码与红测，改为显式上部卷棚、实体山面、下部收坡；闭合有向边/正体积与侧向首击验证。初版三角面绕序红已修，主顶包络与高度保持。CPU示意使用深度缓冲后消除画家排序遮绘伪影，不视作GPU画面。
