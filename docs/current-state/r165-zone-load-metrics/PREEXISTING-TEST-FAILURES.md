# 本轮保留的三项既有失败

本轮扩大918有界915过/3红；另west-six与east-six两项不同真实区用例通过，邻区回传另跑不重复计，合计920项917过/3旧红。没有跳过、删除或放宽旧失败断言。本轮完整源码保护证明除审定计量五文件外，既有src/data/main/release字节与b5相同。以下历史归因与本轮相同错误逐项对照，不表示本轮重新执行了完整冻结旧版或World。

## 原有断言未删、未跳过、未放松

1. tests/r164-ningshou-side-steps/component.test.mjs “actual NingShou gate gets exactly two five-tread approaches and all original gate objects stay intact”：旧快照早于宁寿门敞厅修正；58网格/2246三角仍同，几何摘要已在旧基线不同。
2. 同文件 “one narrow production hook, other generic five-bay gates remain unchanged”：旧快照早于养性门天花，60网格/2260三角对旧58/2246。此前已用完全冻结2e80重演相同两红，见 [既有对照记录](../r164-fanhua-stair-contact/PREEXISTING-TEST-FAILURES.md)。上轮三友轩冻结对照已证宁寿旧对象保持，本轮通过完整源码保护维持这两个旧helper及宁寿内容，不重跑宁寿全区或冒称本轮全区摘要验收。
3. tests/r72-bed-registry.test.mjs “30 beds cover twelve palace compounds and all 28 distinct women without assigning men”：原断言普通床应分配28人，现行为27普通＋共享妃子另行分配。上一轮已直接与main b7ef原对象核同并重演，见 [稳定性基线说明](../r165-chuxiu-stability/PREEXISTING-TEST-FAILURES.md)。本轮新覆盖仍验证27＋共享妃子覆盖28女性、两共享身份不变。

这是已知测试维护债，不等于把现行游戏全部验收。无完整World或GPU测试；旧景祺/梵华部分高跳穿头、144Hz旧塔座可能需起跳退出等边界也未借本轮修饰隐藏。
