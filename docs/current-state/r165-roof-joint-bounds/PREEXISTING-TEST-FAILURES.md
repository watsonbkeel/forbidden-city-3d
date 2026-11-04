# 保留旧失败，不用优化掩盖缺口

1. `tests/r164-ningshou-side-steps/component.test.mjs` 的 `actual NingShou gate gets exactly two five-tread approaches and all original gate objects stay intact`：旧快照早于宁寿门前敞厅修正，几何摘要已有差异。
2. 同文件的 `one narrow production hook, other generic five-bay gates remain unchanged`：旧养性门快照早于前廊天花，当前60mesh/2260tri与旧58/2246不符。
3. `tests/r72-bed-registry.test.mjs` 的 `30 beds cover twelve palace compounds and all 28 distinct women without assigning men`：普通分配27，加共享妃子才是28，与旧断言把28都当普通分配不符。

这些失败已在前序冻结基线定位/复演：[宁寿旧快照](../r164-fanhua-stair-contact/PREEXISTING-TEST-FAILURES.md)、[普通/共享床位](../r165-chuxiu-stability/PREEXISTING-TEST-FAILURES.md)、[上一轮](../r165-synchronous-build-steps/PREEXISTING-TEST-FAILURES.md)。本轮未修改上述断言、相关运行源码或数据，仍按失败列出，不计绿、不skip。它们也不是储秀宫现场崩溃根因的证明。

本轮只改屋顶裁接的内部边界重复计算；只在真实west-six/east-six新旧对照运行。宁寿的完整累计验收属于上一轮adc，本轮是源码精确保留，未重跑宁寿/World。既有首错、皇帝端点、缓存生命周期等仍在本轮有界列表中。

历史源码归一化只接受本轮 helper 的完整固定 SHA，再还原 adc 精确原文件，之后继续每个既有完整文件比较。缺优化、重复或任意漂移仍拒绝，不从检查中豁免通用模块。
