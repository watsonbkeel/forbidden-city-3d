# R97 剩余性能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. 单一产品实现者，独立只读评审。

**Goal:** 去除可证明的重复投影、矩阵与构建扫描，不改观感、人物状态、通行和准备预算。
**Architecture:** manager帧内缓存；batch实例变更标记；可选build内精确行memo。三项独立checkpoint，失败不放宽比较。
**Tech Stack:** 现有JS、Three.js、Node24测试；无新增依赖。
**Spec:** `docs/superpowers/specs/2026-10-26-r97-remaining-performance.md`

## Global Constraints
- 基底最终R96 f025c09c，旧树/产物不写；R96的22runtime变化累计保留。
- 不改40/45/60/70和120/140/180/220，不降画质/模拟频率、不增准备预算。
- 不改原几何、碰撞、instance动画参数/padding、资源身份与dispose合同。
- 每项RED→最小实现→等价/计数GREEN→独立审→checkpoint；正式成本与其他重测试串行。

## Review Focus
1. resize/FOV/zoom、teleport、两相机交错：帧刷新不使用旧矩阵。
2. 静止矩阵仍动画/渐显变化：time、animation、visibility照常上传。
3. 实例增减/换序/换ID/LOD回退/隐藏保留重现：首提交前矩阵与bounds精确。
4. world dispose/rebuild、平移中心：缓存不能跨build/manager污染。
5. cold首显/未绘近身体：不能用warm call-count赢了掩盖启动回退。

## Task 1 — 帧级投影
**Files:** 修改`src/scene/characters/CharacterLOD.js`、`CharacterManager.js`；新增`tests/r97-performance/projection-frame.test.mjs`和便携R96 reference fixture。
**Interfaces:** 新`createCharacterProjectionFrame(camera, viewportHeight=1080, reusableFrame=null)`；`characterProjection(position,camera,viewportHeight,pose,frame=null)`保留四参行为；manager私有持有frame，每帧首个符合兴趣角色惰性刷新一次。
- [ ] RED：至少2个符合角色，同manager一帧`Frustum.setFromProjectionMatrix`计数=1（旧版>1）；空帧=0。
- [ ] RED/等价：透视/正交、sleep/stand、背面、.4m与1.6/2.4px边界、随机坐标/resize/FOV/zoom、两manager交错，projection数值/LOD/budget ID逐值等冻结R96。
- [ ] 实现：保原算式顺序，仅复用相机公共矩阵/planes和同步scratch vectors/Sphere；不跨帧猜camera未变。
- [ ] `node --test tests/r97-performance/projection-frame.test.mjs tests/r96-characters/*.test.mjs tests/r95-character-priority.test.mjs`，独审后commit。

## Task 2 — 实例矩阵dirty
**Files:** 只修改`CharacterRenderer.js`，新增`tests/r97-performance/instance-transform-dirty.test.mjs`。
**Interfaces:** render签名不变；每batch per-slot原始ID/XYZ/rotation/count快照，dispose同步消失。
- [ ] RED：静态第二帧matrix写/上传/bounds计算=0，time前进、动画和visibility仍更新，actualSubmitted不变。
- [ ] 实现仅矩阵/count/order变化标记；新slot与重现先写；不跳整render，不改animation/visibility上传。
- [ ] 对照R96真实矩阵/bounds与所有角色场景：平移、纯转向、增减/换序/同数换人、LOD/pose、coarsefallback、hidden→visible、disable/re-enable/dispose。
- [ ] 新测试+R96驻留/key/占位门绿，独审后commit。

## Task 3 — 可选外脚行memo
**Files:** 只修改`src/scene/garden/DuixiuOuterRock.js`，新增`tests/r97-performance/duixiu-row-cache.test.mjs`。
**Interfaces:** publicbuild接口不变，私有Map限定每sign/build，exact数值z键。
- [ ] RED实际build重复row/source.filter计数；若无重复则不实现。
- [ ] 保原迭代顺序和min/max算式、惰性缓存完整结果；无跨build共享geometry/collider。
- [ ] 全attributes/index/triangle所有权/walkable/profile逐值等R96，平移/Float32不同中心、sourceOnly开关、dispose重建。
- [ ] 只在独占CPU配对实际有收益时纳入；不能称总Garden回退已修。

## Final Gate
- [ ] R96三模块及此前累计保留，完整测试前按HEAD展开必要历史fixture，原红分诊不改expected。
- [ ] 独立等价review；fresh进程人物cold5交替对+warm static/moving成本，全部样本与尾峰保留。
- [ ] 三base全新outDir串行构建/HTTP/包；显式`git add --sparse -f`3份build.log并`git ls-files`确认后才声明final。
- [ ] 版本/README/llms/验证边界一致，仅开发分支由唯一上传器处理，main/Pages不动。

## 执行记录
- Task1 0896d6be：原2角色frustum2→1 RED→GREEN，独立16000投影与108×200 manager输出精确R96；相机帧内snapshot成立。
- Task2 a303616f初稿被独立600状态序列拒绝：缩少count期间basis改变后尾slot返回时误用旧矩阵；bb9a/bda75修复仅截断闲置slot元数据，scale与DEFAULT_UP RED→GREEN。独立600序列及两真实world800帧实例/身体逐值等价通过。正式CPU尚待。
- Task3拒绝：扫描300→100已证，几何等价6项过；五配对Garden build中位仅−1.13ms且±75ms/冷暖噪声明显。运行源已恢复R96，证据保留，不发布未证收益、不称历史182ms回退已修。
- Ruling：继续发布候选范围仅Task1+Task2，Task3用明确拒绝结论完成计划评估，而不是为了三个checkbox强保runtime缓存。
