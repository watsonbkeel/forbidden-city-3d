# 午门 Task3 离线 trim 独审（2216 最终冻结）

## 结论

**有限通过：当前低细节离线 trim 生成及已列明的几何、未安装位姿、资源合同。** 独立最终 **10/10、exit 0、0 skip/cancel**；六个既定错误实现均实际断言红。两类本轮发现的 P1（位姿与宝顶 winding 漏检）已补 QA 关闭，trim helper 本身未因此修改。

不批准与屋面组合、亭翼安装、实际承托/围护、碰撞、FP、World、TextureLibrary 外观、GPU 或生产。`0.427464 m` 不可解释为建筑屋顶增高，也不可仅归为微小法向误差。

## 身份与执行

- 树：`r157-wumen-joint-layout-1622`；HEAD `3e66485fdaf67419c1fee94908f84431ab238500`。
- `roof-task3-2208/freeze-2216.json` 的 9 个输入逐 SHA 重核，包括 package/package-lock。
- trim helper：`49c604127c67cf509178537197bc099f723fd6554f8dcb5087ec5c86b1ba7013`。
- 最终 test：`413f6522d30c6d212cc63aa6828a92bdc9c28bc66111d6ed20d49b9b6bb564f5`。
- 原 600 个 src/data 的实际集合与逐字内容再次等 HEAD，未改共享 RoofBuilder 或生产源。
- 我方原 9 项与最终 10 项分别独跑；最终 TAP `current-10-2216.tap` 为 417.585623 ms。不叠加为 19 个独立合同。
- `final-freeze-audit-2217.json` 绑定全部独立 TAP/exit、输入和 Y 复算；`y-audit.mjs/json` 是另行独立的实际 Tube 分解，不改作者原 JSON。
- 本轮没有 World、CPU 渲染、构建或网络访问。早期两次只读路径猜错（单数 trim 文件名、错误 RoofBuilder 子目录）只造成读取失败，已按 freeze/实际文件纠正，不计作产品/负控结果。

## P1 发现与关闭

### 1. 几何属性正确不等于实际位姿正确

原 9 项可在 group Y 整体加 0.5 m、或 finial mesh X 缩放为 2 时仍 **9/9 全绿**。这是我方 SHA 锁 loader 实证，不是推测。

后继第 10 项独立建立明确 reference parent，以及各类型 child 的 recipe pose；锁 position/quaternion/scale/local/world matrix、自动更新、visible/layers 与相关默认执行状态。它证明的是**局部未安装 frame**，不是实际旧楼/城市安装。

### 2. 宝顶三角排序抹掉 winding

原完整属性 oracle 将每三角三个顶点排序后比较，面积只检查 lengthSq；反转宝顶 index 朝向仍可能通过而改变 FrontSide 剔除。作者随后实际反转验证 **旧 10/10 漏检**，保留原 test 与日志；最终第 7 项改为保留三角内顶点顺序，仅三角列表排序。独立最终反转确在第 7 项数学红。

最终六个固定变异结果：

| 变异 | 通过/总数 | 失败位置 |
|---|---:|---|
| hip 半径加倍 | 9/10 | 完整 Tube/radius |
| group Y scale=1.1 | 8/10 | 通用 scale、完整 pose |
| 各 mesh UV 首 U 改值 | 6/10 | Tube、wing primitives、finial、prism |
| group Y 平移 +0.5 m | 9/10 | 完整 pose |
| finial X scale=2 | 9/10 | 完整 pose |
| finial 三角 winding 反转 | 9/10 | 有向完整三角属性 |

全部为实际 assertion 失败，无导入或 SHA 不匹配造成的假红。上述盲区不是证明当前原件实际位姿/朝向已错；原实现的对应状态经本轮最终合同通过。

## 实体、半径、端点与删除账

原生逻辑与当前 pinned `src/scene/RoofBuilder.js`、Three 源码核对：

- 四条 hip：默认 CatmullRomCurve3；TubeGeometry 8 tubular / 4 radial / open。lower 6 控制区间，upper/wing 8；upper 从 t=.02 起，其他从 0 起。
- tip 用末点减倒数第三控制点的 XZ 单位方向，水平延长 `3hr`、Y 增 `1.6hr`。hr 固定，重新生成曲线截面，不缩放已合并屋顶。
- lower 围脊是 **四侧面，顶底开放**；不是实心帽。innerHalf+hr，Y(0)−hr 至 Y(0)+1.8hr；原 perimeter/y metre UV，tile1。
- upper 宝顶：固定 12 点 profile、hf、radiusScale=.55，Lathe 6 sectors。每顶原 132 三角，明确删除 12 个两极结构退化，保留 120；84 原顶点经未用点清理为 82。不能称原 index 或全部属性字节原样。
- wing：固定 box 截面 `3.4hr×2.2hr`；native cylinder cap 半径 `.42×2.2hr`，长度按新 rx；cap 绕 Z=π/2。没有 chiwen、walking beasts。

独立构造两参数模式并计数，与作者实际账相符：**每模式 10 层、52 mesh、3128 个非零实际三角、48 个宝顶极点删除**。其中 hips 共 2560 三角，四个 lower prism 共 32，四个 finial 共 480，两翼 box+cap 共 56。

Tube 完整 position/normal/UV/index/groups/drawRange 与独立原生构造对照；半径按各 arc ring 中心到实际 Float32 顶点测量。其余 primitive 的完整属性/三角及末轮位姿亦有检查。Tube/Lathe/Box/Cylinder UV 为 native 参数式，不冒称米制纹理或照片认证。

## 法线变化必须保留为 delta

本机 pinned Three `LatheGeometry` 的末 profile normal 使用未归一化 prevNormal，原实际长度约 0.01572468，故早期 6 项出现真实 5/6 红。现删除 pole 退化后，对保留的 native direction 显式 normalize；每个 finial 有 17 个 normal 分量变化，记录最大分量差约 0.75924367。

这是明确的新 normal 编码/长度修正；方向保留，不是原 native normal bytes 不变。最终位置、UV、normal 与有向非退化三角联合比较，不因“原生 primitive”就豁免验证。作者首 SyntaxError 与随后缺模块 file 红均分别保留，不把它们当六条已执行的几何红。

## 约 0.427464 m 实际 Y 差的独立分解

我方按同一 Tube 顶点索引复算。最大位于东翼 single、hip/0、index 30（ring 6、radial 0、弧长比例 u=.75）：

| 分量 | Y 差（m） |
|---|---:|
| 曲线中心弧长重参数化 | +0.21149897699841969 |
| 固定半径 Frenet 截面方向变化 | +0.21596538902311652 |
| 两次 Float32 量化差 | −0.0000003576902374291535 |
| 实际同 index 顶点差 | **+0.42746400833129883** |

旧、新控制点的 Y 逐值相同，但相同弧长比例对应的曲线参数由 `0.6967838116320462` 变为 `0.6555451531099611`。所以不能只用控制点 Y 保持来推断 Tube surface Y 保持；也不能把同索引顶点当成相同建筑空间位置。

独立对应 mesh 的组件 frame 顶部 bounds 最大增量约 **0.031973838806152344 m**，不同于上述同索引差。wing cap 的 geometry local Y 是长轴，经 Z 旋转后不是建筑 Y，不能从其原始局部长轴 bounds 推断屋面抬高。

这份拆分足以支持**离线参数派生差已被量化**，不构成“所有实际 Y 保持”或“新形制高度已获图证”。后续与瓦面/围脊/柱梁组合还需实际接触、交叠、外观及完整 delta 门禁。

## 生命周期与范围保留

新 geometry 由候选独有，ridge/gold 材料借用；正常/重复 dispose、迟发生成错误、dispose listener 抛异常时保留原错误并继续退休 owned 几何有实际测试。未宣称真实 GPU 资源释放或完整材料序列化/纹理外观不变。

两模式仍共用未安装 reference XZ，亭 parentY0，翼 localY 后 parent12.3/Ryπ2。低细节 fixture 的默认执行标志不等于原生产 RoofBuilder 全部渲染状态保全。旧600源和既有金样不变，仍须另审最终生产输入、组合、安装及原全套/缺史问题。
