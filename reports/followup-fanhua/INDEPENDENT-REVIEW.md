# 梵华前楼层额独立有限评审

2026-10-28 06:28 UTC。候选固定 `68492bc78961c43825577cd9af186c0cfef47dc7`，唯一写手之外只读图/代码/测试评审。

## 已实际核验

- 亲看官方 `r49b-ningshou-plaque-audit/images/fanhua-0.jpg` 与 candidate/front.png、candidate/fascia.png：新增绿底金边、连续双卷纹可见，依附旧前木梁；原红柱自然遮挡保留，未借纹样删除柱或全楼挪位。
- 现纹样较原图简化、双卷轮廓偏水平椭圆，适合称『原创表面图案概形部分拟合』。源的浅雕/彩画深度未独立测定，本实现不主张有深浮雕，也不主张原物没有浮雕。
- 原0.13m带拟合放高到0.30m，位于旧梁Y3.41..3.77之内；不是测绘尺度。只改变一个现有南面绿条，其他面不编未知花纹。
- 测试冻结基线 `tests/fixtures/followup-fanhua/RemainingNingshouHalls-r146.js.txt` 已独立逐字节核等 Git R146 `5bfc0fe:src/scene/palace/special/RemainingNingshouHalls.js`；SHA256 `a6a3d478a53d9f0e65e23ed77ad55daa361e798d3b5b8f51a32de53bd5763d67`。
- 独立运行 `node --test --test-reporter=tap tests/followup-fanhua/details.test.mjs`，**6/6 PASS**，1.30秒；日志 `fanhua-68492-independent.tap`。覆盖真实Canvas像素/目标UV、非目标mesh、全部原物理/六孔、附梁范围、三次生命周期、身份拒绝。
- 写手R139旧门12=11/1中的失败是“除前栏之外所有mesh完全相同”旧冻结断言；本项合法改变前层额，且新精确对照证明仅此条视觉改、原物理不变。保留旧失败，不修改旧基线/不称全绿。

## 边界与待补

- 建议实际geometry守卫不只依赖BoxGeometry.parameters；实际顶点改变但parameters保留时应拒绝。该建议若后续采纳需在新固定SHA再验。
- 非正面UV固定绿色采样在RepeatS下仍受纹理重复及远距mipmap影响；CPU图不等GPU远距零串色验收。真实GPU/手机未测试。
- 未跑完整标准/全资源/构建；这些由唯一写手串行完成并独立汇总。该局部审核不提前声称最终可部署。
- 不代表梵华楼完整复刻、全I区/原397对象或7扩展组完成，也不是性能专项。

## 最终限定守卫复核：3827f2d4

固定 `3827f2d4ffcbe71576262132ee672a10663e2653`，产品增量仅目标带本体X/旋转检查及原BoxGeometry有序 position/normal/uv/index 的 `Object.is` 精确比较；临时expected几何在finally释放。正常视觉与68492版本一致，没有新增绘图或物理变化。

写手先用第7测试真实RED后修复，本审独立7门 **7/7 PASS**（1.355秒），日志 `fanhua-3827-independent.tap`。无needsUpdate原地四类数组改动均拒绝。上文实际geometry守卫建议已解决，不再作为未完成项。准许此固定局部候选继续资源/构建/远端冻结门；剩余GPU、全体原文、整体精雕未知边界不变。
