# R52 南区连续路线：准备交付，不是候选世界通过报告

## 已完成与未完成

- 准备基线：R51 `fac791cf956d852e32cc9594ce537b22bca82308`。
- 独立工作树：`r52-southern-route-validation`；仅新增测试、脚本与本报告目录。生产源码、既有测试、既有 helper、历史报告均未修改。
- 既有轻量基线：34 项通过，0 fail / skip / cancel。包括飞行退出及输入归属、地图搜索/卡片不隐式传送、公开身份保留、材质默认/覆盖/释放。没有复制这些测试。
- 新增 helper 单元检查：6 项通过。新增门口断言随实际路线穿过的侧门洞定位，不强迫旧中门。包含缺失 API 的先红后绿、失败/重复 placement/救援/未核支持/过大 step/楼板下行走/漏回程/非有限值/缺接触点的拒绝；真实 FirstPersonControls 在小型空地碰撞世界执行往返；真实 CollisionManager 的 1.2 m 支撑负例拒绝地板下 y=0。合计当前轻量 40 项通过，见 `combined-lightweight.tap`。
- 武英 canonical 接口：已对冻结源 `a0548b6` 的实际 `wuyingMoonTerraceAccess` 导出检查，两个侧梯每个踏步中心均完整保留，并生成 6 个路线 fixture。完整源提交见 `canonical-access-binding.json`。这是输入绑定检查，不是执行路线。
- **未运行本轮最终 R52 完整世界、全部 current-state、真实 WebGL/GPU、浏览器或实体手机。** 最终世界由唯一集成者一次构建后注入。已有整套历史失败须单列，不以本次 40 通过声称整套绿色。
- 人物数量不在本 helper 中冻结。71 为本批计划的逻辑注册人数，不等于同时可见；128 为合成压力注册容量，不是交付人数。此路线包不替人物/视锥/日程/加载/预算检查。

## 新增文件与职责

- `tests/helpers/r52-southern-route-validation.mjs`：fixture 生成、真实控制器执行、轨迹断言、真实 Teleport 落点安全断言。
- `tests/r52-southern-route-helper.test.mjs`：轻量 helper / negative / 小型真实物理单元检查，不导入新场景。
- `scripts/r52-validate-southern-routes.mjs`：集成者导入一次已构建的实际世界，注册 24 条连续路线执行检查和 5 个实际传送落点检查。不导入或调用 buildWorld。
- `MATERIAL-EVIDENCE.md`：文华/主敬来源差异、现材质基线与固定曝光昼暮夜机位计划。没有 shader 或材质改动。

## 最终集成调用

在集成者既有 `node:test` 中，构建实际候选世界 W 一次；用同一 W 的 CM 和 ZoneManager 建立真实生产 Teleport，导入当前候选的 `wuyingMoonTerraceAccess`。然后调用：

```js
const report = await validateSouthernWorld(t, W, {
  sourceCommit: exactFortyCharacterCandidateCommit,
  worldState: '实际加载状态的准确说明，例如 B 或 S，并列明哪些内饰已加载',
  loadedInteriorIds: actualLoadedInteriorIds,
  wuyingAccess: wuyingMoonTerraceAccess,
  teleport: actualProductionTeleport,
});
// 将 report 写入本轮独立报告文件；不得用它覆盖本准备报告或旧记录。
```

W 需要 `{ THREE, cm, zones: [{ json }], taiheSouthTiers }`。Teleport 必须引用同一 `W.cm`，否则脚本直接拒绝。sourceCommit 必须与实际 checkout HEAD 完全相同。报告记录实际源码 SHA256 与工作树状态，不能仅借传入的 commit 文本隐瞒后续未提交修改。

如同时检查未加载/已加载内饰，重复使用同一世界，加载实际资产后分别以明确的 worldState 再调用；不建立另一个重世界。当前全量常驻世界不证明 ZoneManager 卸载/重载行为，必须单列动态流式加载检查。

## 路线覆盖与断言边界

4 条整体往返/循环：

1. 午门 → 太和门实体侧阶 → 太和殿实体阶/门内观览点 → 原路午门。
2. 午门 → 协和门 → 文华门 → 文华前殿绕展墙 → 工字廊 → 主敬展示体侧通道 → 原路午门。
3. 午门 → 熙和门 → 武英桥/门的实际 authored portal → 新月台 → 武英前殿 → 敬思 → 原路午门。
4. 午门 → 文华/主敬 → 南侧明确共同节点 → 武英/敬思 → 午门。不中途重生，不跨门边界重置控制器。

另加武英东、西侧梯各自从真实地面 → 每一级真实踏步中心 → 门前 → 原路地面。输入是实际 canonical export，不复制未知尺寸或旧地面提示。

每条运行 10/60 Hz × 步行/冲刺，24 执行项。沿用 production FirstPerson、Collision、旧 physical-crossing driver；只初始 placement 一次，严格要求每个接触点经过。拒绝 rescue/unverified 支撑、超 STEP_UP、无穷值、地板下脚点和漏掉所需回程楼板访问。中心御路不变成步梯，不降人物半径，不删碰撞，不增加虚拟地面。固定楼板机位仍须实际候选运行，fixture 生成状态始终是 pending。

5 个地图落点：太和、文华、主敬、武英、敬思。调用真实 resolveLanding/isSafe，并独立核对实际支撑高与身体净空。武英正确落在 y=1.2 月台是合法结果，不强迫 y=0；y=0 若在新增实体台下必须失败。这是 resolver/支撑检查，地图 UI 生命周期沿用既有测试，不能把它说成真实浏览器点击或从每个落点贯穿整个展厅已验收。

## 集成者需保留的已知差异

武英 worker 报告旧 `tests/r48-audit-real-world-gallery-details.test.mjs` 在 `(219.5, -212.2, feet=0)` 的出生点已进入新台实体。该旧断言应明确迁移至 canonical 侧梯路径或由单独 R52 消费者替代，不能通过允许地板下出生、修改 Collision、或改写旧报告来“变绿”。本提交没有更改该历史测试。

通用 Wuying teleport 由实际候选解析为 y=1.2；旧 SouthCourtProfiles 地面 entry hint 不能继续当新台地面事实。新东侧起点 `(204.35, -214.8, feet=0)`、西侧 `(234.65, -215, feet=0)`，门前 `(219.5, -206.2, feet=1.2)` 来自 a0548b6 的 canonical export。

## 停止边界

本任务以可复用脚本、fixture、明确源提交与真实已执行/待执行清单交付。不并行运行重世界，不改 main，不外部写入或发布，不宣称后续候选通过。任何实际路线失败应先报告具体位置/状态与来源，再决定是生产问题、路径消费者迁移还是历史期待变化；不放宽阈值掩盖失败。
