# 午门整组上层方案：源码接缝只读意见

对象：`r157-wumen-joint-layout-1622`，HEAD `5610acf44554d3b2a83cd89f33df8782810cd6d4`。仅读现有源码、已冻结数值/报告及两张原图；未执行 Node、World、CPU 或新几何捕获，未修改产品/QA。本意见允许写整组方案，不批准实现、安装或生产通过。

## 决策

可以以**一个完整、可验证的午门上层候选**为下一设计目标：主楼完整保留，四亭/两翼/两横连、逐角色柱梁与闭围护、屋面及其遗漏的底面/带状外皮同批生成和审计。不能仅把当前 172 个离线屋面 mesh 粘到旧 11m 亭体，也不能重新调用放大后的默认 HallKit/RoofBuilder，或单独补 fan 就宣布建筑接缝闭合。

当前没有 P0 源码阻断；以下 P1 是整组方案的必要门，而非已获验证的结论。

## 1. fan / 斗拱 / soffit 的真实生成关系

已核 `src/scene/RoofBuilder.js` SHA `fd87d5a9b766e04f68023b9cba5a78ba2e0f0cef93980e169bfedc947f613623`，`HallKit.js` SHA `f238e69d23efd1c1b95f9f2529b5f0a8b5ba8f1ec7d15fbdd6de04147a9b4edd`，`PalaceBuilder.js` SHA `614b27c4406e6effedb6f06534d7fc2e680dd5272ba02e7e0600d85ce75bb1c1`。

- `prismGeometry`（169–193 行）只有侧面；`addBrackets`（463–466）只是该侧壳，不是实体斗拱构件或带顶底的承重盒。
- `fanGeometry`（195–206）是四边形 footprint 内朝下的水平扇形三角面，不是有厚度地板、walkable 或结构承载证明。
- `skirtRoof`（599–626）中 `fanY = y0 = Y(tw) - th`；下檐 footprint 是原梁外边角色，不是柱心或实体墙皮。
- `singleRoof`（473–514、570–578）在斗拱顶加入 fan；四亭上檐及翼单檐普通分支的 soffit 在 `t=tw` 用 `point(...)-th`。它们不使用主楼专属的 `bearingSoffit` 直环分支（318–330），不能把两者的合同混用。
- 当前受审 evaluator 明确 `ring(tw)=footprint`，瓦面和 soffit 已有实际 `tw` 行；后续 fan 和 bracket 也应消费同一已命名 footprint/边界采样，而非独立猜矩形。

对照作者 `assembly-recon-2240/read-only-junctions-2243.json`，十层数值与上述源码/原 recipe 一致：

| 层 | 坐标系 | bracket 下→上 / fanY | soffit 的对应值 |
|---|---|---|---|
| 四亭下檐 | component Y | 19.8→20.400000000000002 | `Y(.5)-.15` |
| 四亭上檐 | component Y | 22.454110000000004→23.054110000000005 | `Y(.7830802603…)-.15` |
| 两翼单檐 | wing local Y | 6.5→7.17 | `Y(.8064516129…)-.1608` |

翼须先生成 local Float32，再经 parent Y=12.3 / Ry=π/2，名义 component fanY=19.47；不能在 19.47 直接生成后声称字节等价。上檐 double 差约 `3.55e-15`、翼约 `−8.88e-16` 如实保留；未运行实际 fan，因此**尚未证明 Float32 共边**。

需要核实际边界全部顶点/有向边、同一父矩阵、法向和真实 triangle coverage。四三角 fan 与 soffit 的十格边可能形成 T 接点，不能只比四角和 Y 或凭容差焊接；若改成共同边采样，明确新增拓扑/UV delta。几何接边一致仍不等于历史木构承重合格。

## 2. 28 个遗漏角色与默认 builder 的边界

四亭每个六角色：下 bracket、下 fan、upper wood 侧壳、upper caihua 侧壳、上 bracket、上 fan；两翼每个两个角色：bracket、fan。`4×6+2×2=28` 是 **merge 前生成角色**，不是当前运行场景中 28 个独立 mesh。`finalize/mergeByMaterial` 会合并同材质、烘焙局部矩阵并释放原几何。

上身 wood/caihua 的旧 Y 和截面 offset 必须同列：wood 从下 fanY 起至 `bodyTop-cb`，caihua 到 `bodyTop`，其平面外皮比 upper footprint 外扩 .04。不能把上身底误放到下瓦面脊高，亦不能把 .04 彩画突出误当新的柱/墙轴。

新尺寸会改变默认 inset、bracket、gap、caihua、overhang、H、lift 等；只固定 `height` 不保持旧 Y。现锁定 recipe 的尺寸、low detail、截面、无 lift 基础 Y 与派生 lift/tube Y 分账应继续作为明确工程拟合。柱径/柱高/框厚不随平面放大；28 角色不能成为增加未知接口柱的理由。

新组合必须使用真实材质接口及真实合批后记录，不能把本轮五色诊断 palette 或旧白材质 fixture 结果称为 TextureLibrary/GPU 验证。借用贴图库材质不能 dispose；私有 ridge/gold 与新几何须有明确所有者，失败原子清理不得改坏/释放主楼或旧共享几何。默认 RoofBuilder、HallKit 的非目标调用应保持原行为；优先明确午门作用域，不以通用默认变化承载此修复。

## 3. 跨实例亭翼接缝：先诊断，不暗裁面

亲看 `wumen-next-source-1329/north.jpg` 和 `upper-reassembly-2034/private/east-link-2x.png`：照片支持低横连与较高主楼/亭的连接和遮挡层次；平面 crop 支持连接位置/轴列拓扑。透视、遮挡与扫描图不提供隐蔽屋面裁线、入墙深度、接口高程、排水或结构节点。不能从照片轮廓反推所有隐藏相交面应删去。

当前 320 段诊断只覆盖**同层 hip 对自身瓦面**；不能用于跨实例通过。下一统一候选应保完整原面，逐个北/南亭—本侧翼接口建立独立表：

1. 预先冻结接线区域、相邻 owner/角色和已知/工程/未知分类，不能拿实际相交区域反录成允许范围。
2. 按最终真实矩阵列 actual triangle pair、穿交/共面重叠/分离/数值未决、边界距离和可见遮挡；原始三角/参数均保留。有限 segment kernel 对共面或切触不完备，不能把 false 当分离。
3. 同时检查上/下檐、fan、fascia、梁/墙的干涉和暴露缝，不只找瓦面某个交点；再纳入两个横连对不变主楼和北亭的实际邻接。
4. 同机位完整面 CPU/剖视只辅助可见性，不证明密封或承托。当前 hip 装饰末环正间距与 32 未决 pair 继续保留。
5. 若存在不能接受的穿插/暴露空洞，暂停并提出**显式**工程截面或裁切 delta；先核源码/图证与非目标保全，再决定。禁止自动布尔切旧屋面、藏面、改 drawRange、挪主楼、减管半径或扩大容差赶绿。

允许保留的工程穿插必须是被说明并有限接受的方案，不能自动等同无冲突、历史密封或实测形制。

## 4. 整组安装前必须同时成立的门

- 主楼 52 柱、1.43 网格、shell/屋面/南匾及完整记录保留；亭翼旧 112 与新 104 不是同一对象集合。24 个旧接口/端角色移除与16 个内侧新增须逐 path 账，8 个接口区域保持身份/数量未知；24 横连柱亦不是已测历史总数。
- 东北独立三组围护不能以整体缩放替代同源重新注册；2/3/2、未知细格、截面、closed pane 与侧接头保持明确合同。HallKit 的实芯不能被 fan 替代或悄开成可通行亭门。
- 两横连不仅 mesh：`WumenTransverseLinks` 仍硬绑定旧 pose、旧平台、旧 anchor，包含普通盒、`furnitureMotionScope`、floor/region、`xiqingRoofSurface`。必须完整有界迁移，不能删 guard 或让旧授权区域残留。
- 新全部真实柱脚/梁端对真实 U 台面重算，不以旧188柱脚审计代替新方案；不得补隐形面、八未知柱或搬柱凑承托。
- 新旧全构件在场后才验真实平台 FP：双侧双向、10/60Hz、走跑、松键停稳、全帧 raw 身体/足迹/支承/脚高/空中状态；缺台/坡/颈、错 owner、残旧支承和侵入柱必须负控红。旧 engineering rig 成功不能替代此门。
- 本轮仍 component-local。生产 anchor、南墙/阙门/马道、真实 World 接入与完整回归是后续明确门，不能因屋面组装成功直接平移全午门。

建议把这些作为同一个整组候选的内部实施/验收阶段，不再新增孤立 fan 保存点。源支持的轴/拓扑、旧代码继承的工程截面与尚缺的建筑节点必须始终分账；本次只读结论没有增加任何已完成建筑计数。
