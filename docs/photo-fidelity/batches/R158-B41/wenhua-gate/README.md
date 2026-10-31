# R158 文华门：南北台基入口整组候选

## 结果与边界

对象 `FC-5652FA389B`，基线 `3e9d5c9216ae4fbbc5056b5820bf0acff36cfccc`。不是重建另一座文华门，也不是重复已做的右梢间南窗。

- 已看[本门南正面](https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efefc7fb9a3d.jpg)、[南斜面](https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efefcb74c188.jpg)、竖匾和文华院官方展览全景场景1的反向 `b` 面。北面16张原瓦片拼接成1664×1664完整面后检查；不是把左上角天空瓦片当整立面。
- 现模型把南北都建成三组相同短梯；实景南面有中轴石坡、其两侧窄梯与横向端石栏，左右另有踏步；北面是向院落放宽的连续铺地慢道、中轴石条及两侧梯。新增 `WenhuaGateApproaches.js` 只替换这六个旧梯组与六个代理坡支持。
- 新南面含中轴石坡、两侧窄梯、端石板与素望柱/斜栏、左右梯和六条侧石；北面含外张铺地慢道、中轴石条、双侧梯和素边石。十级踏步是低模离散，不冒称照片精确级数；8m/2.56m坡长、宽度和高度均为保留基线结合照片的可逆工程拟合，非实测。
- 两条横向端石板是有碰撞的实物，不造穿石通道。中央门洞仍可经左右窄梯进入；三个门洞、原门扇、屋面、柱墙、牌匾与旧南窗全部保留。官方照片的关闭门叶状态不改变游戏已有开放关系，也不代表现实参观许可。
- 原矩阵9外观+6室内全部15特征保留，见 `FEATURE-DIFFERENCES.json`。只把台阶/御路/栏杆的可证主体差异做到 `VERIFY_PENDING`。精确雕花、完整门窗、梁架/全室内、屋面细分和当前展陈仍未验；旧右梢南窗细格仍缺。`accepted:false`，未改 canonical QUEUE 或 main。

## 精确实物接触与最小集成

本分支**没有修改任何共享源码**。`PROPOSED-SHARED-HOOKS.patch` 是待集成人/Astra审核后应用的提议，不是已生效声明：

1. `SouthCourtGates.js` 导入专用模块，在已有全部特殊处理之后、`return` 之前调用 `applyWenhuaGateApproaches(kit,f)`。
2. `XiqingRoofSurface.js` 仅给 `WENHUA_GATE_APPROACH_IDS` 两枚ID加入既有显式白名单；不放宽32m域限制或接触规则。
3. `FurnitureMotion.js` 仅加入 `wenhua-gate-approaches` 类型和 `validateWenhuaGateApproachScope` 验证调用。专用scope只能挂在本门真实南侧下端石柱的精确Float32包络，域固定为本门及双向入口；不能移植到武英门或扩到其他坡面。

没有 `Collision.js`、`ZoneBase.js`、data 或共享步高/身体缩小修改。六旧代理坡被移除，两个新面源取实际最终Float32三角；原台基帽石只借中央原上表面的裁剪片接触、不重复渲染，也不增加域上限例外。真实石柱是普通实体scope owner，其他新实体用精确面。原27个碰撞严格原序保留，另加3 owner；原台基walkable保留。

不能只把坡面塞入普通 `.3m` 足接触而忽略 `.5m` 身体：专项负控证实那样脚高从 `.455625` 降为 `.435374`，真实身体穿入上坡边缘。限定的既有精确方足运动通道使用完整 `.5m` 身体，每个抬升/平移/落地段都查询所有实物。

本分支测试fixture用 `shared-hooks.mjs` 在内存中重演这几条精确提议；磁盘共享文件不改。安装正式hook后，fixture会剥离仅本门命名hook来保持“之前”案例独立；已安装的白名单不重复注入。最终集成必须在**已落盘共享hook**上再跑相同测试和完整世界复验，不能拿内存重演冒称生产路径已集成。

### 提交与旧资源清理的异常语义

几何/物理替换提交完成与旧几何释放是两个阶段，不声称提交后的释放也能原子回滚。

- 提交前构造失败：旧门体/物理不改，全部已分配新几何都尝试释放；若释放也失败，聚合异常标记 `committed=false` / `phase=GENERATED_GEOMETRY_CLEANUP`。
- 提交后旧几何释放失败：42个旧几何仍全部各尝试一次；**新入口、碰撞、walkable和metadata保留一致**。抛 `AggregateError`，明确 `committed=true`、`phase=RETIRED_GEOMETRY_CLEANUP`、`cleanupAttempted=42`；metadata 的 `cleanup.status=COMMITTED_CLEANUP_FAILED` 并记失败数。不进入新入口撤销/新几何释放。
- 再次调用已提交finalizer返回 `false`，不重复注册，也不重复旧释放；它不是失败资源的自动重试器。调用方应检查异常的 `committed` / `phase`，由原资源持有方处理原dispose异常，或明确丢弃整个kit并重建。`SouthCourtGates` 当前不会吞掉该异常；外层不得把所有throw一律解释成“未提交”后再覆盖同一kit。

首个/中间旧dispose抛错均有真实负控，检查所有42次尝试、新几何未被回滚释放、完整合并后真实北坡接触、门洞射线、metadata一致及再次调用无副作用。

### 已安装生产hook时的负控

原测试loader在发现正式 `FurnitureMotion` import后直接早退，会错误跳过 `no-scope` 负控。现把正式hook安装的幂等判断与负控注入分开；正式hook已存在也会关闭限定scope。

`preinstalled-hooks.test.mjs` 用独立loader先提供真实正式hook字节，再加载待测helper；不是grep源码。旧helper先红（mutant仍scope=true），修后正常模式脚高 `.455625` / 身体无穿透，负控scope=false、脚高`.435375`、真实全身发生穿透；直接物理面源接触高度不变，证明没有删除几何制造红灯。

## 已运行

```bash
node --test tests/photo-fidelity/batches/r158-wenhua-gate/approaches.test.mjs tests/photo-fidelity/batches/r158-wenhua-gate/isolation.test.mjs tests/photo-fidelity/batches/r158-wenhua-gate/preinstalled-hooks.test.mjs
# 最终22 / 22：门体非目标哈希/原碰撞保留、精确面源、真实门洞、石栏碰撞、资源释放、错身份/资源共用/冻结拒绝；
# 三门10/60Hz真实FirstPerson从地面出发往返，中央绕实物端石板；上/下坡及全身体不穿透。

node --test tests/r59-wenhua-gate-window.test.mjs tests/r59-wenhua-gate-divisions.test.mjs tests/current-state/tapered-ramps.test.mjs tests/photo-fidelity/batches/r158-wenhua/central-doors.test.mjs
# 51 / 51：仍适用的旧门窗、锥形坡与文华殿六叶入口回归。

WENHUA_MUTANT=no-scope node --test --test-name-pattern='full .5m' tests/photo-fidelity/batches/r158-wenhua-gate/approaches.test.mjs
# 预期失败：生产getGroundHeight为.435374，不是完整身体应需的.455625。
WENHUA_MUTANT=no-north-collision node --test --test-name-pattern='full .5m' tests/photo-fidelity/batches/r158-wenhua-gate/approaches.test.mjs
# 预期失败：可见北坡脚高变0，不能靠可见模型或元数据伪造物理通过。
```

独审修正后完整命令包含 `preinstalled-hooks.test.mjs`，完整22项末次结果见 `TEST-RESULTS.json`。

`isolation.test.mjs` 在独立进程比较提议白名单装前/装后：未应用新门体的武英门与普通锥形坡查询、10/60Hz上下行实控轨迹逐字节一致。

日志在同级私有 `../r158-wenhua-gate-evidence/`；小体积可核摘要见 `TEST-RESULTS.json`。集成人释放专项窗口后，接缝/异常释放4项先红，再删除重叠连接条、让侧石实面接梯、统一在生成前建立几何所有权，首轮19/19通过；独审P1/P2修正后完整22/22再次通过（6.58秒）。最后node --check与diff --check通过。未并发完整世界、全套current-state或build：集成人正在独占重内存验证，完整集成/构建由其统筹。

## CPU 对照

```bash
node scripts/photo-fidelity/batches/r158-wenhua-gate/cpu-diagnostic.mjs
```

实际隔离生产门体经过普通合并，南/北整面和南/北入口斜面共四机位前后8图，均已看。历史修前图为2826→3350三角；最终修正后实测3314三角（较父版+488）、18材质批、30碰撞、1 walkable（父版分别17/27/7）；不是GPU draw call或帧率。父版虚假北镜像梯与候选外张慢道可直接对照；南中心石坡/两侧窄梯与端石栏有实体可见差异。只导出实际三角和同机位，使用明确标注的平面材质分类色，不含官网图片像素或假截图。

`CPU-PROOF.json`绑定源字节、相机、实际几何和图像摘要。8图是**接缝/资源修正前**历史候选，不是最终姿态截图；原捕获源摘要和后续变化分开记录。为遵守集成人的独占排程未重导；最终同视角图由累计集成补齐。无浏览器/GPU/手机验收，均留 `VERIFY_PENDING`。

## 接续

集成人审核并应用提议的三共享文件小hook → 再跑专项/隔离负控 → 实际累计outer-east和相邻院落路线/碰撞/窗牌保留检查 → 正式构建 → 真浏览器相同机位观察。本分支不发布、不改或合并main。若视觉或Astra复核提出形制/比例问题，按固定15特征登记修正，不能删范围或把“有照片/有代码”记作整门验收。

## Subsequent cumulative integration
The original report above is historical isolated-author evidence. See [integration-20261031/README.md](integration-20261031/README.md) for installed production hooks, final complete-zone CPU, real cumulative physics and terminal gates. Original pre-seam CPU images are not final production acceptance.
