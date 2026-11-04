# 本轮保留的三项既有失败

本轮扩大有界934项931过/3旧红，另真实宁寿1项通过，合计935不同用例932过/3旧红；三项历史红测保持原断言，不跳过、不删除、不放宽。完整源码保护证明除新抑斋组件与ZoneBase唯一挂接外，既有src/data/main/release字节与c080相同。以下历史归因按本轮错误逐项复核；本轮真实宁寿已另验证所有旧对象摘要，不等于完整World。

## 原有断言未删、未跳过、未放松

1. tests/r164-ningshou-side-steps/component.test.mjs “actual NingShou gate gets exactly two five-tread approaches and all original gate objects stay intact”：旧快照早于宁寿门敞厅修正；58网格/2246三角仍同，几何摘要已在旧基线不同。
2. 同文件 “one narrow production hook, other generic five-bay gates remain unchanged”：旧快照早于养性门天花，60网格/2260三角对旧58/2246。此前已用完全冻结2e80重演相同两红，见 [既有对照记录](../r164-fanhua-stair-contact/PREEXISTING-TEST-FAILURES.md)。本轮真实宁寿按精确c080冻结构建对照，保留旧28958网格/625732三角、7908接触/363面/28268屋顶摘要，两个旧helper没有源码改动；未为刷绿去改历史断言。
3. tests/r72-bed-registry.test.mjs “30 beds cover twelve palace compounds and all 28 distinct women without assigning men”：原断言普通床应分配28人，现行为27普通＋共享妃子另行分配。上一轮已直接与main b7ef原对象核同并重演，见 [稳定性基线说明](../r165-chuxiu-stability/PREEXISTING-TEST-FAILURES.md)。本轮新覆盖仍验证27＋共享妃子覆盖28女性、两共享身份不变。

这是已知测试维护债，不等于把现行游戏全部验收。无完整World或GPU测试；旧景祺/梵华部分高跳穿头、144Hz旧塔座可能需起跳退出等边界也未借本轮修饰隐藏。

额外旧综合命令不混入上述计数：zone-lint未加--no-geo曾进入旧World夹具并因奉先尺寸守卫中止，未完成/不算通过；--no-geo版本7区0错9警告。anchor-check为114比较中神武门Layout差11m一处超差，另一处kind不兼容，既有数据未改。
