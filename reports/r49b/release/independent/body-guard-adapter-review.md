# R49B 身体证据守卫适配独立审查

审查时间：2026-10-22 04:48 UTC。

结论：**此补充适配没有弱化任何身体、接触、支撑或路线断言，也没有把执行中的生产世界逆回 R49；只为两个明确冻结的源文件增加了源码溯源逆差分。源码适配审查通过，57 项实际身体测试是否通过仍须等待独立实跑。**

## 本次实际做了什么

只读生产代码、原测试、fixture、现有独立几何报告和 R49 Git 内容；只在本目录新增审查脚本、JSON、报告。没有修改生产文件、原测试或候选补充测试，没有构建世界、运行重场景、GPU、浏览器或 R50 人物测试。

已运行：

- `node reports/r49b/release/independent/body-guard-adapter-review.mjs`，退出 0。
- `node --check tests/r49b-inherited-world-body.test.mjs`，退出 0。

前一命令执行的是从候选测试原文提取的源码守卫片段，置于只提供受限文件读取、SHA-256 和 assert 的独立 VM；并非导入整个测试或生产模块。5 个仅在内存中的篡改样本全部被拒绝。完整数值和哈希见相邻 `body-guard-adapter-review.json`，审查可用同名 `.mjs` 重复。

## 逐字等价和源码链

1. 本地 R49 基线为 `92cf31ec1779d0d6266a2caa6ad1708c379d1500`。原 `tests/r49-inherited-world-body.test.mjs` 与该提交逐字相同，SHA-256 为 `16cae58bcf3e4080cf8319d6d02549b7522f621aa9d07f22e3dc9377c43038ec`。
2. 从新文件仅去掉开头两行注释，并把从 `const deltaBytes` 到 `const inheritedURL` 之前的源码守卫恢复为原文件片段，所得**整个文件与原测试逐字相等**。因此世界构建、阈值几何、每一个身体断言、路线选择、循环组合、接触判定、输出、清理均原样保留，不只是名称或断言数量相同。
3. 新 fixture 固定 SHA-256 为 `2e5c38ae380ed46db5e217c8f29c8b85a5a6a6d9ada801ed1d7bb5861651e403`，确实仅包含 `src/scene/palace/kit.js` 的 6 个 hunk 和 `src/scene/palace/special/SouthCourtGates.js` 的 1 个 hunk。kit 改动为横匾 atlas 接入/分组与三处匾额深度；南院门改动为匾额位置和挂设元数据，不移除台阶、基座、门洞或碰撞结构。
4. 两个文件各自先校验真实候选全文 SHA，再要求每个 after hunk 恰好出现一次；逆差分后校验 R49 全文 SHA。独立审查另外把结果与上述实际 Git 基线逐字比较，均相同，未仅信任 fixture 自述的哈希。
5. 随后仍执行原 R49 fixture 的全部唯一 hunk 检查和原 immutable sourceHashes 检查。原 R49 fixture 哈希、immutable 支撑捕获文件哈希及其全部字节均未变。支撑捕获仍为 54 条记录、648 个三角形；没有重建或放宽白名单。
6. 直接执行候选源码守卫成功。对 kit、SouthCourtGates 各自附加一个换行均被候选 SHA 检查拒绝；对两份 delta fixture 和 immutable 支撑文件各自附加换行均被相应冻结哈希拒绝。均为内存模拟，磁盘证据未变。

## 没有执行“旧世界”的数据流证明

候选测试第 9–13 行在守卫之前已经从实际工作树导入 `CollisionManager`、`buildWorld`、`ZoneBase`，构建候选世界、每个区的真实 finished group，并校验 finished group 返回的 colliders / walkables 与世界注册值相等。

`tests/lib/world.mjs` 通过工作树 `src` 路径导入生产 ZoneBase、PalaceBuilder、Enclosure、GardenBuilder，不从逆差分字符串加载模块。其碰撞采集阶段跳过合并属于原测试已有实现；新测试仍另外执行真实 `ZoneBase.build()`，取得 finished 场景并纳入三角检测，而非仅测试该简化碰撞采集结果。

`originalSupportSource` 仅有两个文本出现位置：函数定义，以及第 25 行 `createHash(...).update(originalSupportSource(p))` 的校验调用。它读取文件为局部字符串、做字符串替换、返回字符串；无写盘、eval、模块导入、模块缓存替换、mesh/geometry 写入或世界替换。VM 独立执行也只读取两份 fixture、三个支撑来源文件与 immutable 捕获文件。

第 32–33 行继续从真实 finished 场景读取可见 Mesh / InstancedMesh 的位置、索引及实际世界矩阵，遍历高度 broadphase 内的全部三角，没有新增数量截断或针对抱厦/匾额的豁免。第 26–30 行仍用冻结的 648 个原支撑三角，加上从真实候选 ZoneBase 新建且逐项核验的凝道殿/焕章殿低门槛三角，匹配实际接触；每一处匹配仍须满足真实 STEP_UP 上限。

`world.mjs`、`auto-routes.mjs`、`terrace-walk.mjs`、`physical-waypoints.mjs`、真实材质 helper、`stepwalk.cjs`、生产 `FirstPerson.js`、`Collision.js` 均与本地 R49 基线逐字相同。运动 instrumentation 仍调用原生产方法，仅记录其返回结果。没有新增虚拟地面、降低人体、升高出生点、宽松救援或路线捷径。

## 57 项和所有关键断言保持原样

- 7 条有界路线：主敬殿、文华殿各自自动路线，协和门→文华门→文华殿内固定路线，以及本仁殿、集义殿、凝道殿、焕章殿路线。
- 每条路线 10/60 FPS × 步行/冲刺 × 正向/倒退，共 56 个身体测试；再加 1 个平移低家具伪装支撑应被拒绝的负例，总计 57。
- 原地面出生、实际到达、零 rescue/unverified、实际地面上升不超过 .600001、每个候选子步 STEP_UP=.6、每个物理帧及候选子步高度 broadphase、所有接触三角精确支撑匹配、接触顶面不超 STEP_UP、两个 2.5 cm 门槛尺寸/来源/平台贴合/全足迹支撑等断言均保留。
- 计数来自原样循环及 `selected.length===7` 的静态证明，**不是本次已经完成 57 项实跑的证据**。实跑须成功结束，核对 57 pass、0 fail/cancel/skip，保留 TAP 与身体 JSON；失败或资源中止不得记为通过。

## 抱厦与 157 记录不能由源码逆差分偷换结论

本次另行校验了 `r49b-global-independent-review.json` 列出的 11 个生产文件哈希，当前候选全部与其冻结值一致。该报告的几何比较明确排除了已另审的两抱厦，因此不能引用它声称两抱厦“没有改变”。157 仍仅是审查账本记录数量，不是 157 个实体匾额，也不是 157 项照片或身体测试通过。

抱厦改变的证据必须来自独立实际几何审查：`canopy-review.md`、`canopy-final-independent-checks.json`、`canopy-review-manifest.json` 及其已冻结导出。已读报告记录 70,389 次修复后表面探测零差异、553 个封口采样无坏样本、非抱厦非匾额主体三角不变；重华宫 4 根原抱厦柱仅最大 y 从 5.142 增至 6.45，脚点/xz 不变，walkables / rooms 不变。这里引用既有独立成果，**没有重新运行它们**。

实际身体三角仍来自候选世界，但 7 条路线并不经过所有建筑，也不构成两抱厦的专门人物/视角验收。源码逆差分仅证明明确接受的来源变更可以还原为冻结来源，不证明几何相等、摄影真实性、所有路线或所有视角均正确。

## 风险与发布约束

1. 仍需等待当前候选 57 项真实身体补跑；本报告不得代替运行结果。原 R49 测试在新源码处拒绝是源码守卫拒绝，不应被隐去或描述为身体断言已失败/通过。
2. 补充测试沿用历史 report.commit 默认值 `b7283c6`。运行者应明确设置 `PROBE_COMMIT` 为当前冻结候选标识，并附本次生产文件哈希清单，避免报告身份被误解为旧提交。这不是身体断言问题。
3. 任一后续生产变动须重新冻结/审核相关证据；新 fixture 不应为使测试变绿而自动泛化、重新采样支撑或跳过差异。尤其两抱厦不能并入“仅匾额/标签逆差分”而免掉真实几何审查。
4. 本次无 GPU、全城路线、R50 人物、远端发布验证。保留既有覆盖边界与未解决建筑/朝向事项。
