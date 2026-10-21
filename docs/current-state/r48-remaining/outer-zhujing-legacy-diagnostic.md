# R48 主敬薄代理追加独立审查

状态：LOCAL_GEOMETRY_PASS_LEGACY_ROUTE_FAIL。94/118 项通过；40 条新测试路径模式及 24 条旧消费者路径诊断模式已执行。
被审模块 SHA-256：a150b7de4351b9543ed03e91c1027c88f625f9b1adcf7ecff0640c2c04452ad0

## 两薄代理自由输入复核
- 自由逼近后退、左右绕圆展体共 24 模式；到达 24，未豁免实际身体相交 0。
- 两组件真实顶点包络、保守空角与两侧完整通路均单独检查；未把包围盒声称成可见实心几何。
- 首轮测试额外假设停住后距表面小于6cm，已证实是测试假设错误：原控制器按完整子步接受/拒绝，可能留7.8–10.7cm余量。当前直接记录真实被拒子步，并验证包络边界前1mm可站、后1mm受阻；没有改代理或放宽身体安全门槛。原失败保留在 priorRuns。

## 范围与边界
- 仅主敬殿、本仁殿、集义殿、恒寿斋的本次局部变化，不代表整殿全部完成。
- 本仁、集义、恒寿现代内饰仍 blocked；恒寿保持闭合模型，没有伪造开放目的地或当前库房用途。
- 主敬仅用自身 20260911 a075 第一期暗图增补天花结构、现代轨道及一类空白吊签，旧专用展柜和器物保留。

## 实际检查
- 真实 TextureLibrary 和 stub 几何、碰撞、房间、元数据一致性；不依赖裸 material.name。
- 原节点几何与材质保留；B/J 仅移除 7 个指定旧正面网格，恒寿仅替换屋顶；主敬仅两前折叶按显式model-access-fit外开，原矩阵和几何均有核对。
- 实际窗格承托、立面遮挡、吊挂接合、FrontSide 闭壳和真实柱梁屋面接合。
- 三处入口采用真实控制器 10/60 Hz × 步行/冲刺 × 正向/倒走；主敬另含±.08m横偏，共40往返模式。全身渲染接触全部保留，并按精确旧平台/石帽身份与实际成功子步归因。
- 旧21逐身份几何与功能摘要核对。

## 旧消费者路线独立红证据
- 新测试 waypoint 可通不代表 owner 的生产接线已完成。已直接调用 tests/lib/auto-routes.mjs 的共享合同路线，并额外原样回放两个 R36 验收路线；没有修改这些消费者或声称 owner 生产接线已完成。
- legacy-r36-courts：到达 8/8，真实身体净空通过 0/8，完整接受 0/8；未豁免真实相交 84。
- legacy-r36-integration：到达 8/8，真实身体净空通过 0/8，完整接受 0/8；未豁免真实相交 202。
- legacy-auto-contract：到达 8/8，真实身体净空通过 0/8，完整接受 0/8；未豁免真实相交 200。
- 文华横转两点：(-186.4,-205.3)、(-175.4,-205.3) → (-186.4,-205.0)、(-175.4,-205.0)。这是旧叶尖端相交的既有问题。
- 主敬横转两点：(-186.4,-172.0)、(-184.1,-172.0) → (-186.4,-172.6)、(-184.1,-171.8)。新薄代理暴露原向内折叶净空不足，已由显式外开 pose 修复；斜绕另避开真实柱与圆展体木框，不能仅以到达判成功。

## 失败项
- legacy-consumer 主敬殿: legacy-r36-courts real entry, terrain-step attribution and non-terrain body clearance 10/false/false/0: {"name":"主敬殿","variant":"legacy-r36-courts","source":null,"waypoints":[[-186.4,-211.5],[-186.4,-205.3],[-175.4,-205.3],[-175.4,-193.3],[-186.4,-193.3],[-186.4,-172],[-184.1,-172],[-184.1,-167.5],[-186.4,-167.5]],"fps":10（完整帧/三角见 JSON）。
- legacy-consumer 主敬殿: legacy-r36-courts real entry, terrain-step attribution and non-terrain body clearance 10/false/true/0: {"name":"主敬殿","variant":"legacy-r36-courts","source":null,"waypoints":[[-186.4,-211.5],[-186.4,-205.3],[-175.4,-205.3],[-175.4,-193.3],[-186.4,-193.3],[-186.4,-172],[-184.1,-172],[-184.1,-167.5],[-186.4,-167.5]],"fps":10（完整帧/三角见 JSON）。
- legacy-consumer 主敬殿: legacy-r36-courts real entry, terrain-step attribution and non-terrain body clearance 10/true/false/0: {"name":"主敬殿","variant":"legacy-r36-courts","source":null,"waypoints":[[-186.4,-211.5],[-186.4,-205.3],[-175.4,-205.3],[-175.4,-193.3],[-186.4,-193.3],[-186.4,-172],[-184.1,-172],[-184.1,-167.5],[-186.4,-167.5]],"fps":10（完整帧/三角见 JSON）。
- legacy-consumer 主敬殿: legacy-r36-courts real entry, terrain-step attribution and non-terrain body clearance 10/true/true/0: {"name":"主敬殿","variant":"legacy-r36-courts","source":null,"waypoints":[[-186.4,-211.5],[-186.4,-205.3],[-175.4,-205.3],[-175.4,-193.3],[-186.4,-193.3],[-186.4,-172],[-184.1,-172],[-184.1,-167.5],[-186.4,-167.5]],"fps":10（完整帧/三角见 JSON）。
- legacy-consumer 主敬殿: legacy-r36-courts real entry, terrain-step attribution and non-terrain body clearance 60/false/false/0: {"name":"主敬殿","variant":"legacy-r36-courts","source":null,"waypoints":[[-186.4,-211.5],[-186.4,-205.3],[-175.4,-205.3],[-175.4,-193.3],[-186.4,-193.3],[-186.4,-172],[-184.1,-172],[-184.1,-167.5],[-186.4,-167.5]],"fps":60（完整帧/三角见 JSON）。
- legacy-consumer 主敬殿: legacy-r36-courts real entry, terrain-step attribution and non-terrain body clearance 60/false/true/0: {"name":"主敬殿","variant":"legacy-r36-courts","source":null,"waypoints":[[-186.4,-211.5],[-186.4,-205.3],[-175.4,-205.3],[-175.4,-193.3],[-186.4,-193.3],[-186.4,-172],[-184.1,-172],[-184.1,-167.5],[-186.4,-167.5]],"fps":60（完整帧/三角见 JSON）。
- legacy-consumer 主敬殿: legacy-r36-courts real entry, terrain-step attribution and non-terrain body clearance 60/true/false/0: {"name":"主敬殿","variant":"legacy-r36-courts","source":null,"waypoints":[[-186.4,-211.5],[-186.4,-205.3],[-175.4,-205.3],[-175.4,-193.3],[-186.4,-193.3],[-186.4,-172],[-184.1,-172],[-184.1,-167.5],[-186.4,-167.5]],"fps":60（完整帧/三角见 JSON）。
- legacy-consumer 主敬殿: legacy-r36-courts real entry, terrain-step attribution and non-terrain body clearance 60/true/true/0: {"name":"主敬殿","variant":"legacy-r36-courts","source":null,"waypoints":[[-186.4,-211.5],[-186.4,-205.3],[-175.4,-205.3],[-175.4,-193.3],[-186.4,-193.3],[-186.4,-172],[-184.1,-172],[-184.1,-167.5],[-186.4,-167.5]],"fps":60（完整帧/三角见 JSON）。
- legacy-consumer 主敬殿: legacy-r36-integration real entry, terrain-step attribution and non-terrain body clearance 10/false/false/0: {"name":"主敬殿","variant":"legacy-r36-integration","source":null,"waypoints":[[-186.3,-259.2],[-186.3,-231.2],[-186.4,-231.2],[-186.4,-211.22],[-186.4,-205.3],[-175.4,-205.3],[-175.4,-193.3],[-186.4,-193.3],[-186.4,-181.75（完整帧/三角见 JSON）。
- legacy-consumer 主敬殿: legacy-r36-integration real entry, terrain-step attribution and non-terrain body clearance 10/false/true/0: {"name":"主敬殿","variant":"legacy-r36-integration","source":null,"waypoints":[[-186.3,-259.2],[-186.3,-231.2],[-186.4,-231.2],[-186.4,-211.22],[-186.4,-205.3],[-175.4,-205.3],[-175.4,-193.3],[-186.4,-193.3],[-186.4,-181.75（完整帧/三角见 JSON）。
- legacy-consumer 主敬殿: legacy-r36-integration real entry, terrain-step attribution and non-terrain body clearance 10/true/false/0: {"name":"主敬殿","variant":"legacy-r36-integration","source":null,"waypoints":[[-186.3,-259.2],[-186.3,-231.2],[-186.4,-231.2],[-186.4,-211.22],[-186.4,-205.3],[-175.4,-205.3],[-175.4,-193.3],[-186.4,-193.3],[-186.4,-181.75（完整帧/三角见 JSON）。
- legacy-consumer 主敬殿: legacy-r36-integration real entry, terrain-step attribution and non-terrain body clearance 10/true/true/0: {"name":"主敬殿","variant":"legacy-r36-integration","source":null,"waypoints":[[-186.3,-259.2],[-186.3,-231.2],[-186.4,-231.2],[-186.4,-211.22],[-186.4,-205.3],[-175.4,-205.3],[-175.4,-193.3],[-186.4,-193.3],[-186.4,-181.75（完整帧/三角见 JSON）。
- legacy-consumer 主敬殿: legacy-r36-integration real entry, terrain-step attribution and non-terrain body clearance 60/false/false/0: {"name":"主敬殿","variant":"legacy-r36-integration","source":null,"waypoints":[[-186.3,-259.2],[-186.3,-231.2],[-186.4,-231.2],[-186.4,-211.22],[-186.4,-205.3],[-175.4,-205.3],[-175.4,-193.3],[-186.4,-193.3],[-186.4,-181.75（完整帧/三角见 JSON）。
- legacy-consumer 主敬殿: legacy-r36-integration real entry, terrain-step attribution and non-terrain body clearance 60/false/true/0: {"name":"主敬殿","variant":"legacy-r36-integration","source":null,"waypoints":[[-186.3,-259.2],[-186.3,-231.2],[-186.4,-231.2],[-186.4,-211.22],[-186.4,-205.3],[-175.4,-205.3],[-175.4,-193.3],[-186.4,-193.3],[-186.4,-181.75（完整帧/三角见 JSON）。
- legacy-consumer 主敬殿: legacy-r36-integration real entry, terrain-step attribution and non-terrain body clearance 60/true/false/0: {"name":"主敬殿","variant":"legacy-r36-integration","source":null,"waypoints":[[-186.3,-259.2],[-186.3,-231.2],[-186.4,-231.2],[-186.4,-211.22],[-186.4,-205.3],[-175.4,-205.3],[-175.4,-193.3],[-186.4,-193.3],[-186.4,-181.75（完整帧/三角见 JSON）。
- legacy-consumer 主敬殿: legacy-r36-integration real entry, terrain-step attribution and non-terrain body clearance 60/true/true/0: {"name":"主敬殿","variant":"legacy-r36-integration","source":null,"waypoints":[[-186.3,-259.2],[-186.3,-231.2],[-186.4,-231.2],[-186.4,-211.22],[-186.4,-205.3],[-175.4,-205.3],[-175.4,-193.3],[-186.4,-193.3],[-186.4,-181.75（完整帧/三角见 JSON）。
- legacy-consumer 主敬殿: legacy-auto-contract real entry, terrain-step attribution and non-terrain body clearance 10/false/false/0: {"name":"主敬殿","variant":"legacy-auto-contract","source":{"file":"tests/lib/auto-routes.mjs","sha256":"2d5391f947aa774233b70c2af18a164250a66e7187d5ce4b08aa9bac7b3036fb","name":"[outer-east] 文华门→主敬殿→返回"},"waypoints":[[-186（完整帧/三角见 JSON）。
- legacy-consumer 主敬殿: legacy-auto-contract real entry, terrain-step attribution and non-terrain body clearance 10/false/true/0: {"name":"主敬殿","variant":"legacy-auto-contract","source":{"file":"tests/lib/auto-routes.mjs","sha256":"2d5391f947aa774233b70c2af18a164250a66e7187d5ce4b08aa9bac7b3036fb","name":"[outer-east] 文华门→主敬殿→返回"},"waypoints":[[-186（完整帧/三角见 JSON）。
- legacy-consumer 主敬殿: legacy-auto-contract real entry, terrain-step attribution and non-terrain body clearance 10/true/false/0: {"name":"主敬殿","variant":"legacy-auto-contract","source":{"file":"tests/lib/auto-routes.mjs","sha256":"2d5391f947aa774233b70c2af18a164250a66e7187d5ce4b08aa9bac7b3036fb","name":"[outer-east] 文华门→主敬殿→返回"},"waypoints":[[-186（完整帧/三角见 JSON）。
- legacy-consumer 主敬殿: legacy-auto-contract real entry, terrain-step attribution and non-terrain body clearance 10/true/true/0: {"name":"主敬殿","variant":"legacy-auto-contract","source":{"file":"tests/lib/auto-routes.mjs","sha256":"2d5391f947aa774233b70c2af18a164250a66e7187d5ce4b08aa9bac7b3036fb","name":"[outer-east] 文华门→主敬殿→返回"},"waypoints":[[-186（完整帧/三角见 JSON）。
- legacy-consumer 主敬殿: legacy-auto-contract real entry, terrain-step attribution and non-terrain body clearance 60/false/false/0: {"name":"主敬殿","variant":"legacy-auto-contract","source":{"file":"tests/lib/auto-routes.mjs","sha256":"2d5391f947aa774233b70c2af18a164250a66e7187d5ce4b08aa9bac7b3036fb","name":"[outer-east] 文华门→主敬殿→返回"},"waypoints":[[-186（完整帧/三角见 JSON）。
- legacy-consumer 主敬殿: legacy-auto-contract real entry, terrain-step attribution and non-terrain body clearance 60/false/true/0: {"name":"主敬殿","variant":"legacy-auto-contract","source":{"file":"tests/lib/auto-routes.mjs","sha256":"2d5391f947aa774233b70c2af18a164250a66e7187d5ce4b08aa9bac7b3036fb","name":"[outer-east] 文华门→主敬殿→返回"},"waypoints":[[-186（完整帧/三角见 JSON）。
- legacy-consumer 主敬殿: legacy-auto-contract real entry, terrain-step attribution and non-terrain body clearance 60/true/false/0: {"name":"主敬殿","variant":"legacy-auto-contract","source":{"file":"tests/lib/auto-routes.mjs","sha256":"2d5391f947aa774233b70c2af18a164250a66e7187d5ce4b08aa9bac7b3036fb","name":"[outer-east] 文华门→主敬殿→返回"},"waypoints":[[-186（完整帧/三角见 JSON）。
- legacy-consumer 主敬殿: legacy-auto-contract real entry, terrain-step attribution and non-terrain body clearance 60/true/true/0: {"name":"主敬殿","variant":"legacy-auto-contract","source":{"file":"tests/lib/auto-routes.mjs","sha256":"2d5391f947aa774233b70c2af18a164250a66e7187d5ce4b08aa9bac7b3036fb","name":"[outer-east] 文华门→主敬殿→返回"},"waypoints":[[-186（完整帧/三角见 JSON）。

## 接触与通行不能混淆
- 主敬殿：24/24 往返到达；严身体接触 372，精确旧低地形归因 0，未豁免相交 0；真实入殿子步最大抬升 0.00m，可见支撑偏差最大 0.020m。文华旧地形接触 372、旧踏步支撑偏差 24 另列。
- 本仁殿：8/8 往返到达；严身体接触 60，精确旧低地形归因 60，未豁免相交 0；真实入殿子步最大抬升 0.50m，可见支撑偏差最大 0.020m。文华旧地形接触 0、旧踏步支撑偏差 0 另列。
- 集义殿：8/8 往返到达；严身体接触 60，精确旧低地形归因 60，未豁免相交 0；真实入殿子步最大抬升 0.50m，可见支撑偏差最大 0.020m。文华旧地形接触 0、旧踏步支撑偏差 0 另列。
- 严格平滑相机身体扫描仍记录低台沿接触；只有旧平台/石帽、接触高度不超过STEP_UP .6、真实子步抬升与可见脚面吻合且往返到达时，才归为可跨低地形，不声称完全没有身体接触。
- 原门槛由精确旧节点识别；记录平滑feet与实际physics ground的差值，避免将相机平滑迟滞误作控制器没登上平台。
- 未改文华殿原阶梯/台基/门槛接触，以及旧碰撞脚印支撑比离散踏步高的样本，独立记为baseline inherited，不因本轮不修改而删除。

## 历史红证据
- 旧完整合同路线经过文华门，仍会记录其原阶梯/台沿接触；这些不属于本次四身份，保持未豁免诊断，不能据此归咎新四身份或静默删除。
- 首版本仁与集义各384个新菱格均与窗框分离，深度间隙0.0475m；原模块和数值保留在 JSON 的 initialRedEvidence。
- 后续通过不抹去首版红证据；当前结果只对应上列模块哈希。

## 复现
node --test tests/r48-outer-zhujing-proxy-review.test.mjs
node --test tests/r48-outer-first21-retention.test.mjs
