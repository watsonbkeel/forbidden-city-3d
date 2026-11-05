# 三项既有红测不掩盖

本轮244唯一文件有界951项948过/3旧红，另真实west-six和真实宁寿各1通过，合计953不同正式用例950过/3旧红。没有skip/cancel，没有改旧失败断言。

1. `tests/r164-ningshou-side-steps/component.test.mjs` 的“actual NingShou gate gets exactly two five-tread approaches and all original gate objects stay intact”：旧快照早于宁寿门前敞厅修正，58mesh/2246tri计数同但几何摘要预存变化。
2. 同文件“one narrow production hook, other generic five-bay gates remain unchanged”：旧养性门快照早于前廊天花，当前60mesh/2260tri对旧58/2246。此前冻结2e80重演两红见[历史证据](../r164-fanhua-stair-contact/PREEXISTING-TEST-FAILURES.md)。本轮精确恢复原5030全部ZoneBase语句，所有几何helper/data完全不改；真实宁寿累计摘要与路线又通过，未为刷绿修改两项旧快照。
3. `tests/r72-bed-registry.test.mjs` 的“30 beds cover twelve palace compounds and all 28 distinct women without assigning men”：既有27普通分配＋1共享妃子，与旧断言普通应28不符。此前已对b7ef直接复现，见[稳定性基线](../r165-chuxiu-stability/PREEXISTING-TEST-FAILURES.md)；本轮人物/床位源码全部原字节，新增覆盖与原皇帝专项保持。仍保留该旧红，不算通过。

旧Yizhai→Sanyou→metrics源码归一链仅增加精确的同步边界剥离；151条边界、唯一包装、计数器及import都必须存在且唯一，之后仍与旧完整源码相等，缺失/重复/无关漂移负控保留。没有因新wrapper而删除老保护。

本轮未运行World、旧几何zone-lint或anchor脚本；本文件不重复计前轮误启动/中止或旧锚点结果。浏览器、GPU、手机、Node20和真实Mac温度未验。三个旧红不是当前崩溃根因的证明，也不代表现有游戏全部已验收。
