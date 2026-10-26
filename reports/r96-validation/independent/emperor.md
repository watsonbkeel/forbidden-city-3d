# R96 皇帝中和模块：独立限定功能门

候选 e93e71ee3ec03bf19b0fd863c1d2b65643790492；精确源校验见 hash-check.log，绑定 writer reports/r96-emperor/checkpoint-source.sha256。全部产品源码只读。

## 判定
已测新目的地/返程、真实支撑及模型功能可继续最终集成；尚非最终CPU/GPU/手机或整体发布放行。

## 座位/外观
亲看实际source-bound CPU front/oblique图，下摆从椅前垂下、鞋接平台，无明显椅面穿裙。此图不是浏览器/GPU实机。
独立复用此前R94审计clip oracle（非当前产品碰撞谓词），检查三个LOD的3577/1426/474实际模型三角，对真实fragment中18个chair/screen/platform盒：0开放内部正深度穿入、0舍入不确定。鞋实际Float32最低Y=8.810000005811451，原平台顶8.810000003576278，相差2.235nm；不宣称浮点绝对重合。每LOD实际最低鞋顶点分别26/14/12。根高取实际pad顶减.49，未仅引用新增纯metrics自证。见 seat-oracle.json。

## 真实运动与占位
- route-oracle.json及route-oracle-S.json：实际完整B世界和实际太和S GLB经InteriorLoader加载，10/30/60Hz分别检验途中21→06反转、完整21点到中和、6点回太和。全部到达/返回原binding，standing每帧半径.36、脚底到头1.7m的独立AABB正体积oracle 0穿入。普通走动最大XZ步长=12/fps，无跨路段高速跳点。
- 坐/站仍是原DailyRoutine离散、占位扫掠检查的姿态转换，不是连续坐下动画。中和最终站点68.25→座位68.9，XZ移动.65m；起身同帧可附加正常行走。因此不把所有帧的整体位置差都称≤12/fps。太和原姿态转换也保留，全部transfers单独记录。
- real-occupancy.json：实际world从太和出发，玩家提前占中和座位，皇帝在Z≈68.05合法停步，未先把皇帝强放进玩家身体；让开后坐下。玩家从不与已坐皇帝重叠的(.8,68.25)占起身路径，仍working等待；让开才回太和。
- S-cold-seat-model：实际太和S，清空路线旁观察，500帧更新中实际新seatVariant第9模拟帧提交；近身体/实际mesh一致、无隐形body、无count错配，并成功返程。这不是实机0.9秒指标。第一次把玩家相机置于路线中，皇帝正确停在Z64.3；该player-on-route证据保留，不能误报为模型不加载。

## 原内容保留
retained-contract.mjs直接import冻结R95与候选，153个合法旧template/pose/seatVariant/LOD组合的全部geometry attributes、indices、userData精确相同；非法旧组合仍同样拒绝。整个108角色registry精确相同（含另外107角色），未减数量或改角色定义。新行为改动仅皇帝路线数据与专用variant，普通作息代码未更改。

## 限制
S证据为真实太和S资产；中和没有独立S配置。静态oracle按实际椅/屏等轴对齐盒验证，未独立复现完整GPU idle shader动态。旧variant几何保持并不等同历史服饰考证。人物性能5轮配对由writer在CPU清场后单独执行；家具成本/最终累计旧行为门另行补齐。
