# R107 bounded inactive-zone reuse implementation plan

Sole writer inline execution, approved R106–115 scope. Spec: ../specs/2026-10-26-r107-bounded-zone-reuse-design.md
Goal: eliminate demonstrated duplicate short-term reentry build, not conceal unchanged startup/Garden costs.

1. Freeze diagnostic source/samples and exact geometry/owned-texture budgets. Add pure cache-policy RED for 2 entries/32MiB, LRU/pending pins,120s TTL, unknown dimensions/owners, source+quality identity, idempotent release.
   Files: new src/scene/zones/InactiveZoneCache.js; tests/r107-inactive-cache.test.mjs.
2. Integrate only ZoneManager constructor/init/load/unload/dispose/quality invalidation. RED actual registered source count/scene ownership/quality lifecycle; preserve existing callback order and metadata. No main/Garden/physics changes.
   Files: src/scene/zones/ZoneManager.js; tests/r107-zone-reuse.test.mjs.
3. Actual current-world geometry/CM/held-clone/quality/renderer-object lifecycle independent gate. Respect cached group runtime material visibility from legitimate S/LOD ownership; no blanket visibility reset that would defeat loaded interiors.
4. Five paired R106/candidate same fresh protocol per group, record startup/prebuilt/loaded/inactive geometry+texture totals, normal update-driven reentry and pressure eviction, fullGarden rebuild controls unchanged. Freeze only if measurable benefit/cost accepted. Final docs/status/negative evidence, no redundant184/1290/threebase beforeR110.

Estimate: 45–60min including independent review/performance; if structural ownership issue exceeds this bounded design, report and defer rather than expanding all-zone lazy metadata architecture.

Ruling: main 显式 opt-in（第三运行路径）而非默认所有 ZoneManager 使用者启用，保留独立既有调用者释放语义；真实应用与新增测试均开启，不能用关闭模式假验cache。根本预算不变。目的区先取回用于避免32MiB下东/西互踢，不提高budget。
Task1完成：纯cache3/3 RED→GREEN。Task2基本生命周期完成：cache+更新驱动返回/切档+既有R106默认为off 7/7；实际全区/资源/heldclone待独检。

15:06增补（root已批准）：完整资源计账发现源图强持遗漏，增加第四运行路径ZoneBase专用cache前释放引用，通用CourtKit/merge不改。RED两项原样失败→GREEN；实际east/west输出、LOD、metadata、零额外dispose独审。旧f735五对归档不冒作最终预算门；bd80新源重跑十fresh进程五对。真实Yangxin S离场/卸载/重返独审另过。
