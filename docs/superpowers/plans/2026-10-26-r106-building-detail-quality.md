# R106 Building Detail Quality Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Sole writer, RED→GREEN and read-only independent review.

**Goal:** 低档真正少生成局部纹理/格孔/冗余色面，保主要形制和所有通路。
**Architecture:** library级独立质量策略；交泰map可即时替换，建筑生成读策略且仅未加载目标缓存失效；不重建当前loaded碰撞。
**Tech Stack:** Three.js/现有DataTexture、CourtKit、ZoneManager；无新依赖。
**Spec:** docs/superpowers/specs/2026-10-26-r106-building-quality-design.md

## Global Constraints
默认high精确R105；低档256²/4×6/.675/.288/4×3及9色面；无body/roof/通路缩减；热建筑延迟生效必须可见说明。

## Review Focus
初始mobile low/desktop手动low；两library隔离；同档幂等和双dispose；loaded不删/预建清理无ghost；低窗隐私/UV与高档字节保留。

### Task1 明确策略与交泰map
Files: Create `src/render/BuildingDetailQuality.js`; Modify `main.js`, `src/scene/palace/special/JiaotaiTextileSurfaces.js`, `JiaotaiDisplaySetting.js`; Test `tests/r106-detail-quality.test.mjs`, `tests/r106-textile-quality.test.mjs`.
Interfaces: `buildingDetailQuality(library)->'high'|'low'`; `setBuildingDetailQuality(library,value)->boolean changed`; `onBuildingDetailQuality(library,callback)->unsubscribe`; 现有installJiaotaiTextileMaps增加可选library，旧调用默认high。
- [x] 写未知档原子拒绝、两library隔离、low256²且不生成512、high旧像素逐byte、同档不替换、切换dispose一次RED。
- [x] 运行`node --test tests/r106-detail-quality.test.mjs tests/r106-textile-quality.test.mjs`，先FAIL再实现最小策略/可缩放栅格/材质订阅。
- [x] high像素/UV/全部非目标与R105相等，map共用材质实际merge后有效，dispose监听解除；记录GREEN并commit。

### Task2 承乾低档与锡庆等色区域合并
Files: Modify `src/scene/palace/special/ChengqianSouthWindows.js`, `XiqingGate.js`; Test `tests/r106-model-quality.test.mjs`, `tests/r106-low-triangles.test.mjs`.
Interfaces: 构建读取kit.lib的Task1策略；低档只改变规定grille重复及coplanar色面合并，profile/物理不增加quality杂字段。
- [x] 写high完整属性等R105、lowtri/bytes更少、8窗分区opaque/reveal/UV闭合、所有box/walkable/rooms/map/roof source逐值相等RED。
- [x] 实现参数与低档9色面矩形覆盖；高档路径原算法不变。
- [x] 跑专项与R102/103/104相关门；同机位CPU近/中图比较保形制，独审；commit。

### Task3 冷初始与真实切档生命周期
Files: Modify `src/scene/zones/ZoneManager.js`, `main.js`, `src/ui/SettingsMenu.js`; Test `tests/r106-zone-quality.test.mjs`.
Interfaces: ZoneManager局部`invalidateBuildingDetailPrebuilt()`只废弃未loaded east-six/ningshou预建；loaded不触碰。main在初始library前置质量及toggle同步调用；菜单明确建筑重载生效。
- [x] 写初始mobile low、desktop high→low→high、未加载目标释放/后续重建、当前loaded无owner/scene变化、地图/room/flight既有包络覆盖、重复切档无额外废弃RED。
- [x] 实现严格目标缓存失效与说明，不全区重建、不改更新预算。
- [x] 真实build/merge/CM单套生命周期GREEN，未变区域/人物输入精确保留。

### Task4 成本、证据与累计检查点
Files: Create `scripts/r106-quality/cost.mjs`, `docs/current-state/r106/VALIDATION.md`, R106必要报告。
- [x] 串行5交替高低配对：三模块cold资源/triangle/bytes/CPU，hotmap切换与卸载，保全部样本及峰值。
- [x] 独审source/低像素/资源所有权/物理精确门；无可信收益不称优化。
- [x] 冻结checkpoint给后续R107；R110最终累计才跑必要全套/三base，无关大矩阵按hash复用。

执行记录：39fa67ab 运行候选；完整状态/成本见 docs/current-state/r106/VALIDATION.md。最终独审报告待收口绑定，R110 累计检查不在此预称通过。

## 最终取舍（2026-10-26 14:23 UTC）
root根据唯一五对结果拒绝锡庆低饰面实验：仅27KiB节约、CPU无一致收益。4119bb7d恢复XiqingGate精确R105，未加载缓存失效缩至east-six，宁寿无质量分支。上文锡庆/宁寿内容仅为已执行并拒绝的方案历史，不是最终产品；交泰与承乾采纳。旧样本/RED保留，不再新参数优化。
