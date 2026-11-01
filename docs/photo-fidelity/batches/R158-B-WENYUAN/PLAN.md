# R158 文渊阁整组复核与池桥整栏实施

**Goal:** 保留已完成主阁层级、楼梯、家具；按本组官图修正池桥整桥双侧栏的实/空结构，缺证碑亭与隐藏内部不编造。
**Architecture:** 独立 `WenyuanPondBridgeRails.js` 只消费既有 `wenyuan-pond` 精确参数，返回 group/colliders/metadata。主写手接入 SouthWaterSystem，必要时仅加专用 rail-top inward recovery hook；本工作树不改共享文件。
**Tech:** Three.js / Node 测试 / 真实 FirstPersonControls CPU 路线；浏览器启动实际失败，视觉 VERIFY_PENDING。
**Spec:** MASTER-PROMPT.md §§1–12 + Git B-REVIEW required feature matrix，基线 c9b25a71。

## Constraints and review focus
- 不修改 main、不部署、不重建三层/梯/家具，不动桥面 32 个 ramps、水系或池岸。
- 拒绝身份/尺寸/变换错误，不借其他桥照片；8 柱站是保留数量拟合，不冒称实景精确普查。
- 仅官图可见两侧栏类别：下实板、上透空+单短撑、圆筒雕头、卷云端板；精雕、背面、桥拱未知。
- 真实渲染三角形必须与碰撞三角完全一致；水边上跌落不穿栏、不被困。
- 不移动资源、不复制官图到发布目录；新增几何分配失败及时释放且不处置共享材质。

## Steps
- [x] 读取原要求/B-REVIEW/既有模块，实看本体正面、一层、三层官图。
- [x] 核实真实浏览器阻塞：Chromium socket EPERM；不宣称视觉验收。
- [x] 写缺失新整栏行为测试，验证 RED。
- [x] 实现独立两侧整栏及精确三角 owner，验证 GREEN。
- [x] 用 QA loader 接入完整生产世界，检验 routes/body/drop 与全32原桥面不变。
- [x] 对全组三对象逐特征记录保留、修改、待证与待实机，不把整桥栏通过当整组通过。
- [x] 准备专属文件与测试提交；给集成写手准确 hook、测试结果、阻塞。

## Final verification
- [x] 独立 Astra 收验17/17，96跌落、12同轨往返、3456其他桥/水对照；无剩余范围内P0–P2。
- [x] UV资源所有权、真实外缘/方角/精确相切RED→GREEN，未放松实体。
- [x] 保留全组false和隐藏部分未知；浏览器socket EPERM及原宽套件失败如实记录。
