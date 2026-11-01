# R157 午门集成非目标保留：私有只读证明

## 结果

- 基线完整 `src/` + `data/`：`36908b2c07c7050e1de0dffd504e68a67c83f205`，566 文件。
- 候选为集成树 571 文件完整快照（并非当前 HEAD 的未提交文件混入旧依赖），逐文件 SHA/bytes 见 `SOURCE-PROVENANCE.json`。冻结 lower SHA `2417a8311d54f9d640eacfbe13fb1ee1ab25e252f6dfdf50e55d723c08ed0c72`。
- 午门外 543 合批输入、94,496 mesh 遍历记录精确等同；有嵌套合批，遍历次数不是唯一对象数。17 最终组的 967 mesh 记录也精确等同。
- 午门外 30,393 个真实注册 collider、1,354 个支承，在10个来源内完整多重集精确等同，计入重复数量。
- 午门18个有限非目标分组精确：正楼屋顶/南匾、马道及栏、三台面、双翼厅、四亭屋顶、四亭非目标墙梁与保留角柱、双横连。三亭只因合法增删中间柱导致 child path 重排，mesh多重集未变。未按“大午门范围框”整体排除。
- 午门通过真实源码产出边界剥离授权下层（旧12盒+3北头=15，新70）及主楼（50→98）。余284个已注册碰撞形状、原13支承，**内容与顺序均精确不变**。
- 明确新行为：3普通台顶实体 + 3真实顶面（`rescue:false`，精确12.3）替代首轮下层三角台顶。原13支承逐条保留，现总16；主台新面同高覆盖旧主台，非“支承零增量”。午门总碰撞349→452。
- 6负控拒绝：删外部重复碰撞、改保留屋顶hash、额外非目标碰撞、改旧支承、额外虚支承，以及真实in-memory隐藏保留屋顶group。见 `RESULT.json` / `comparison.log`。

这不是R157整体验收。材质采用真实 TextureLibrary 缓存/参数/规格，但离线纹理图像占位；不证明GPU、图片采样、实景视觉或真实开放状态。只比较实际mesh属性字节、索引、world矩阵、材质参数/贴图属性、渲染flags与祖先可见性，以及真实注册物理形状。

## 复现（串行；只写新的私有输出目录）

保留如下6个脚本同目录：

1. `run-global-retention.sh`
2. `capture-global.mjs`
3. `capture-hook.mjs`（在合批入口读出原始对象；不改渲染返回值）
4. `capture-wumen-physics.mjs`
5. `wumen-boundary-hook.mjs`（真实下层源码前后边界，不改注册）
6. `compare-global.mjs`

```sh
bash /path/to/scripts/run-global-retention.sh \
  /workspace/scratch/02a8023d1a85/r157-wumen-integrate \
  /tmp/r157-global-proof-NEW-UNUSED-PATH
```

要求 Node24（与项目当前环境相同）、git可读精确36908对象、现有完整node_modules。无网络、无部署、无git写操作；输出目录必须不存在，防止覆盖证据。脚本归档旧完整src/data并复制当前完整src/data，每个独立进程从各自快照加载，数据fs读取也隔离。前后全树哈希不一致会硬失败。公开纹理文件未改变（`git diff 36908 -- public`为空）；本脚本不读取历史图像或新增任何来源推断。

单独复核既有快照（无需重建3D世界）：

```sh
node compare-global.mjs /path/to/private-output
```

落仓无需复制约60MB原始capture JSON。可以只保留脚本、RESULT、SOURCE-PROVENANCE和日志；后续要重跑比较则由上述runner重生成私有capture。不得把已生成的当前capture覆盖baseline或任何旧golden。

## 首轮 veranda 真实回归

`veranda-before.log` 直接复现全世界原测试：FurnitureMotion bodySweep:239 遇 `axis/wumen-lower/main-top` 抛 Unsupported shape。实测Y=[11.999999994039536,12.300000005960465]，不是撞新柱。

私有只把3台顶三角注册换author box，原三路线3/3（`veranda-after.log`）；随后集成负责人补足原三角台顶曾提供的真实面支承，当前3面方案见上述明确增量。未改共享FurnitureMotion或原路线断言。

## 原 ascent oracle 的现行 successor

`ascent-successor-QA.patch` 仅新增3个QA文件，不改原current-state，也不再生golden。

- 精确重用旧 `ascentObjectRows`、`ascentPhysicsRows` 与 `wumen-folded-ascent-retention.json`。
- Golden SHA `a138066f6eabd90e4219488faf269dfcda88001e6ab9741c1ce63693f97ddebe`，对36908逐字相同。
- 按唯一 `wumen-folded-ascent` 找原wrapper；在实际WumenAscent原函数beforeC/beforeW到return捕获268碰撞/13支承，当前实际collider起始70。保留原keyed path和内容比较。
- 几何移位、碰撞移位、旧支承移位3真实负控均拒绝并复原。
- 真父node:test wrapper 1/1；子4/4。清NODE_TEST_CONTEXT及冻结env，要求明确TAP13、tests4/pass4/fail0和4个ok，空执行不能成功。
- apply --check通过。运行：

```sh
node --test --test-reporter=tap \
  tests/photo-fidelity/batches/wumen-ascent-integration-inheritance.test.mjs
```

旧“42child/旧下层数量”整项历史清单仍保留其失败证据；本补证只关闭原ascent几何/物理在child27过时后的现行语义，不冒称旧清单契约已满足。

## 主楼 group-state QA 补强（非生产变更）

审查员发现原 `mainSignature` 仅记录mesh flags，`tower.visible=false` 不会改变其旧签名；私有复现见 `main-group-blindspot-red.log`。当前 MergeUtils 会丢弃该源group旗标，故这不是已证实的当前生产隐身故障，也不能宣称旧签名覆盖了整个源对象状态。

`main-object-state-QA.patch` 仅新增3个QA文件；旧signature及旧geometry/physics黄金均不改。全新补充fixture来自**原独立已审ebd**干净工作树（检验HEAD、tracked clean、4个直接生产source与git对象逐字一致），不是从integration回灌。记录106个塔身节点及1个祖先全部局部变换和object flags。当前2/2通过，拒绝塔身隐藏、祖先隐藏、layers变化、祖先renderOrder及matrixAutoUpdate变化（5负控）。限定为raw源对象状态，不替代GPU/合批后语义实测。

```sh
node --test --test-reporter=tap \
  tests/photo-fidelity/batches/wumen-main-object-state.test.mjs
```

## 范围补充

全局对象输出覆盖静态建筑/庭院/围合/花园以及 `Environment.setupGround()` 地面；不执行玩家/NPC的动态时间状态，也未构造/验收完整天气、天空与GPU效果。全部src/data完整哈希已限定只有10个授权午门/说明文件变化；其他运行时模块源码不变仍不等于该处的动态专项验收。动态actor/控制器专项由集成负责人另行保留。

## 独立复核终态

`/root/review_wumen_integration` 已独立快审/重跑两份QA补丁：3个顶层测试通过，ascent子进程确实4/4；确认state fixture来自clean原ebd、106节点+1祖先及5实变负控合适，原geometry/physics黄金未动。QA盲点标为后继补闭，不列未解决P2。独审报告：`audit-wumen-completion-20261031/INDEPENDENT-FINAL-INTEGRATION-REVIEW-0133.md`。此结论仍非实景视觉或整项R157验收。

一键runner也已真实执行成功：`runner-verification.log` 记录 `/tmp/r157-global-runner-proof-0133/RESULT.json`；其RESULT与本目录RESULT逐字相同。最终再次核对共享集成树571个src/data文件与已验快照逐SHA一致。
