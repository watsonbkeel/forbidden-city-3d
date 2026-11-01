# 午门隔离 U 承台 builder 独立阶段审查（冻结 2002）

**结论：这是已有真实几何和物理的初版离线候选，不是纯 profile，也不是已验收承台。可以继续受限修订；当前不批准生产接入、整窗无阻、真实亭入口或完整路线。** 独立 5 项通过，但西接收窗被真实南栏及其安全代理横穿；另有原件认证、表现策略和完整负控尚未闭合。后继修订不得冒用本报告的旧冻结身份。

## 1. 输入与独立执行

树 `r157-wumen-joint-layout-1622`，HEAD `49b166ff4d45ba3cfe694c8ee854d8b8b986292a`。`actual-junction-1940/task2/freeze-2002.json` 的 10 路径逐 SHA 全部匹配；600 个 src/data 文件逐 Git blob 与 HEAD 相同。没有生产 installer、provider 注册、FirstPerson 或 Collision 源码变更。实际新 builder 是 `scripts/photo-fidelity/batches/wumen-joint-layout/visible-platform.mjs`，SHA `d2fb76c2c5b17f4abe1ac2cbb00644698dd0be2c8971eb5a4002f6e29fa56669`；测试 SHA `6ef52e7d35312da3a0c76c1d90a5462880fb0d2ec37e85b912ac1796bf5e8a3c`。

独立运行 `node --test tests/photo-fidelity/batches/wumen-joint-layout/visible-platform.test.mjs`：5/5，exit 0，2537.872505 ms。另仅运行实际组件捕获、静态真实 CollisionManager 查询及射线，没有 FP、World、CPU/GPU 渲染。该 capture 使用真实 PalaceBuilder，但覆盖 finish、使用简化材质库；不是完整 World 材质/合批证明。

作者原 4 RED、首轮测试误用 CM 第三参数导致的 3/4、修测试后的 4/4、北口砖衬同面红及最终 5/5 均分轮保留。北口红是实际新红墙与保留砖衬重叠，不是导入异常。

## 2. 当前实际成立的有限事实

- 候选实际有 **187 个平台 cells、12 个非 receiver 坡体、5 段栏、926 collider、199 walkable、788 Mesh、27020 个绘制三角**。2 个 receiver 没有复制成独立试块或额外支承；它们只是平台上的几何窗描述。
- 新 U 通过有限 XZ 分区生成实际 slab/masonry，12 坡矩形从 cell 集合中扣除；旧 Lower/Ascent 的 broad floor 数组没有直接并入返回物理。旧输入记录摘要前后不变，候选 dispose 不释放原件 geometry。
- 独立按 U 的三矩形计算原面积 7318.26 m²，再逐坡取交并扣除，得到 7297.655862023596 m²；实际 187 cell 面积和 7297.655862023599 m²，差约 3e−12。并非所有 12 坡都与 U 正面积相交：东 return/neck、西 entry/innerTurn/return/neck 有交；其余为 U 外真实坡体。
- 本轮扫描所有实际绘制三角，未见非有限 XYZ 或面积 ≤1e−12 的三角。此检查不是纹理/法线/拓扑全集验收。特别不能写“每个 mesh 都闭合”：133 帽为既有半球，6 片为平面，18 个新北口 masonry 已为砖衬去面，16 个保留 jamb lining 也是面片。需要按组合壳体核封口，而不能把所有单 mesh 的开放边当新漏洞或当已闭合。
- 五个真实门组、左右 69/64 帽、32 外额面片以及南三 canopy 实体均被克隆；北 5 cap、5 curved lining 和 jamb 面片移动 `14.5−18.6`（名义 −4.1m），不是只贴一张新北口图。洞内保留 flat soffit 是原工程口径，不是本轮测绘确认。
- 独立沿五条原中心折线路径每约 0.1m、feet=0、r=.5 静态 CM 采样未见阻挡；另外重建实际闭门组件，五个实际门位均被原叶 triangle body 阻挡。它支持当前开/闭几何的有限正例，**不等于连续全净宽、实际控制器、全速度或建筑真实通行证明**。
- 12 坡中心从高处向下的全候选射线首击均为相应实际坡，不是 cell slab 跨缝盖面。两接收窗中心也命中真实 slab 顶；这些中心点不能代表整个窗或完整 .5 足迹。

## 3. P1：必须保留的阻断与验收缺口

### P1-A：西窗真实栏穿入，中心测试漏报

南栏 `wumen-joint/platform-rail/0` 的 X 范围 `[-63.2,61.68062913907285]`，Z 范围 `[-13.1,-12.9]`，与西接收窗正面积重叠。独立实际 CM 查询：

`x=61.01837748344371, z=−13, feet=12.3, eye=14, radius=.5` → **collision=true**；窗中心 `z=−11.407284768211921` → false。东窗没有正面积栏重叠。

栏的实际 mesh 与安全体均在该处；不是单独多出隐形 collider。配套代理 Y=[12.5,16.5]、可见栏 Y=[12.3,13.5]，高度政策已明示，但不消除横穿问题。原 south 横线机械扩到两翼上方，并不等于新 U 内庭的真实暴露边。后继应按明确边界成对修实际栏与代理，或独立定义经验证可用的授权子窗；不能只删除 collider、降低身体半径，或凭中心射线称整窗畅通。父已授权以真实 U 暴露边修订，尚未纳入本轮冻结。

### P1-B：当前 builder 尚不认证“原始完整 capture”

独立四个输入变异均被接受：隐藏 lower 父组；平移 lower 父组 Y+2；删除一个 north jamb 面片；删除一个左帽子实体。返回仍成功。其根因是 preflight 只核有限根姿态/对象计数，未锁 lower 祖先状态、全部 jamb 身份及完整保留对象。当前官方 fixture 输入正常，所以这不是说当前正例已丢帽；但不能声称已对损坏原件 fail-closed，也不能把输入快照自身相等当独立原件证明。特别去父层直接 clone 子节点会丢失非单位父变换的含义。

进入最终 geometry gate 前至少应独立锁完整保留组与祖先有效矩阵/可见性、jamb 集合和 geometry/render 状态，并对上述真实变异先 RED→GREEN；或者明确把 builder 作为受信输入生成器，另由独立严格 verifier 拦截输出，不能两者都缺。

### P1-C：未完成的真实建筑/物理关口

未做全候选完整面/材质可视检查、柱脚实际承压、真实亭翼组装、五洞全净宽/各高度/北口过渡与封堵负控、接收窗全足迹/薄障碍/删 slab/删坡/错支承及旧 floor 残留负控、平台 witness 认证及真实 FP 停步。现返回的 199 支承也尚未纳入已审 provider 的原 14-owner 身份合同。不得把 receiver 改名为平台就继承旧 rig 验收。亭本体仍未装配，不能称入亭；真实南墙、阙门、单次世界坐标变换均未闭合。

## 4. P2：需明确的表现与合同细节

1. 新栏并非旧栏“只改长度”：旧使用 alphaTest=.5、DoubleSide、gateRailFacade 的 24 个绘制顶点；新是 alphaTest=0、FrontSide、完整 36 顶点 box，含顶底面。若保旧表现应恢复明确策略并验实际 draw index/UV/material；若有意换成实体栏板，应明列视觉形制变化而非称原表现保全。本轮 fixture 没有真实透明贴图，测试绿不能证明 GPU 外观。
2. 新 `sumeru_band` 全走 applyBoxUV，fixture 下竖面 V≈[-.6,.6]，旧 applyBandUV 为[0,1]。这会改变带状贴图使用方式。原 0.1m 外挑带也未见单独 cut-aware 重建，需列明保留/替换/遗漏，不应默认为全部原基座表现保全。
3. 当前 5 项测试的保留 localRecord 仅覆盖声明的字段，不含全部 render 状态；没有统一输出 verifier 或新负控组。源码的 `north-jamb` 数量也未要求精确 16。最终报告应避免“全部字段/全部源物理已认证”这类超范围措辞。
4. 实体/物理的同源 authored bounds 并非 Float32 绘制零误差。现 slab 测试允许 1e−5，与已有坡体量化政策应一致列出，不可写几何与支承逐比特相同。原 primitive 的 ≤.1m 保守内部代理策略仍在，不变成精确三角体。

## 5. 源和坐标边界不因 builder 出现而升级

工程 U 仍为 ±63.5、inner40.6、south−96、north14.5、top12.3；世界 frame 尚只作 metadata，实际 root local identity。OSM lower footprint 是低层边线，不是已证12.3顶面；2021 平面阶带也没有给出本轮全部高程/台边/真实门净口。Task1 43行=42独点+闭合点，11外点最大外离2.1408719m；2.9567723m是全部源点→候选边界的单向采样最大（该点在 U 内），不是 Hausdorff 上界。反向顶点已有3.0622788m。此差异不能被5/5单元测试抵消。

保40.6可继续作为保旧侧门/外额位置的初始工程约束；实际柱脚与门洞/通路若冲突，应按有限新合同返修，而不是硬把低层轮廓、外柱轴、楼顶面合成同一来源。明间1.43、未知8接口区域、旧亭实盒与全部未证上层仍维持各自原边界。

## 6. 回执与证据

本独立目录 `independent-wumen-visible-platform-2003/` 保存 5项原输出/exit、10路径冻结副本、`input-audit.json`、`audit.mjs/json`、`negative-and-closed.mjs/json`、`independent-area.json`。静态结果不是 World。轻测槽已释放；2002 冻结结论以上述 SHA 为准，后继栏/认证修订应另冻、另验，不覆盖本轮实际红证据。
