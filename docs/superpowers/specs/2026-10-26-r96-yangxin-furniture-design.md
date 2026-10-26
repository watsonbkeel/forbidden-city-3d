# R96：养心西暖阁家具域落脚修复设计

## 目标与已授权边界
累计最终R95本地 `14d8997e64ce6fdb3bd5223b3dda805f1852ca12`（写本设计时远端R95待唯一上传器发布）。R95保持只读。修复真实地面步行/跳上旧低几后普通退下制造穿入的问题；不改变人物0.5m方形足印、1.7m身体、家具/建筑网格或碰撞实体，不全园改控制，不贴Duixiu标记，不保证穿过真实墙。

旧RED：B/S×10/30/60Hz，从local(9.72,-4)地面进入，跳上可达桌/炕边，普通向南退出会在updateGround纯竖向下降制造重叠。跳可救出≠普通行走正确。仅把support半径.3→.5的反例仍会向东下降撞体，已否定。

## 方案选择（工程选择，不是新增用户精确尺寸）
- 否定一行改半径：没有完整竖向/迈步扫掠，已被反例证伪。
- 暂不做全园普通盒控制替换：大量未知台阶/救援语义，需要另版范围。
- 采用**养心西暖阁显式所有权的局部普通实体适配**：当前实体不变，真实square足印、完整body扫掠、支撑与可站姿分离。沿用既有Collision分段水平移动和沿墙滑动框架，域外逐输入与R95同结果。

## 作用域与生命周期
B层 `YangxinWestWarmRooms` 为一个现存collider附加纯域元数据，不新增实体。元数据包含id、world-XZ范围，来自现有plan.bounds与0.8m工程过渡余量；仅控制器选择依据，不参与绘制或几何查询。该margin不是改人物半径，最终须用实际门/地面接口验证，不以margin自动认安全。

Collider注册时验证/复制marker；区域索引按源collider数组/注册代数缓存。B区卸载移除owner即释放域，S层载卸只改变其真实障碍物集合，不决定域存活。query使用原空间网格，不每帧扫全世界。staticRoutineNavigation借源代数，held clone移动/移除owner及时失效，不每个NPC每帧重建索引。

域判定使用from→to完整square足印的XZ扫掠，含高空落下。离域时保持真实feet/verticalVelocity/airborne；不可强制落地才交接。过渡须在家具之外真实可站的门内/平台地面，不让边界横切家具。

## 接口
新增 `src/controls/FurnitureMotion.js`：
- `furnitureScope(cm,fromEye,toEye,radius): boolean`，完整扫掠域接管。
- `furnitureContact(cm,x,z,maxTop,radius): {surface,poseClear,blocker}`；surface `{height,witness,owner}`只来自可达高度内真实顶面，普通floor、上方屋顶并存时不能用屋顶擦掉floor。NPC不是支撑。
- `furnitureBodySweep(cm,fromEye,toEye,radius): null | {fraction,kind,owner}`，完整feet→head、静态盒解析TOI、真实三角/overhead与动态体也不能漏；切触可切向/远离，正深度进体拒绝，不能复制legacy .35m脚豁免。
- `furnitureTryStep(cm,fromEye,toEye,radius,stepUp,motion)`返回与Duixiu局部接口同形但独立命名/所有权。仅有效grounded源可lift→translate→settle；空中不autostep。每段全身/低顶扫掠。真实drop走离后保持feet进入重力。
- `resolveFurnitureVertical(cm,state,dt,radius)`返回局部状态或域外null；下降与小落差均连续扫掠，向上顶碰、站台落地/跳复位、动态体暂挡但不重置跳跃。

Collision只加此域dispatch，非域legacy分支原样；FirstPerson在legacy地面上抬捷径之前接局部竖向结果，传递独立`lastFurnitureStepFeet`。实际半径/kinematic上下文不使用硬编码玩家半径覆盖NPC。

本阶段只声明接口；具体非盒/坡面处理必须按实际域内对象清单验证，不允许bbox假地板或忽略异型对象。若无法兼容则明确阻断，不放宽碰撞。

## 验收与不做
纯机制包含面/棱/角/桌腿/薄板/斜顶、±微小切触、同XZ多层、低顶、NPC占位；真实B/S地面进入后10/30/60走/跑/倒退/跳与8向退出，逐帧独立正体积oracle。保留原R96半径反例。门内外、S载卸、B载卸、传送/飞行退出/人物radius .32等调用域外严格差分，R95人物首显及Duixiu旧失败点保持。

性能只增加近域查询，远域结果/查询工作可证明不变；测冷/热、held clone和108作息，不用功能绿冒充CPU/GPU验收。R96不修R97加载、不改R98造型。

## 独立设计审核补充（05:23）
- 实际north使用`max(plan.bounds.north, plan.bounds.sNorth)`，不是只取-.15；候选world范围X114.12..126.90、Z271.15..279.041262...。已测单殿B/S域内146/148普通collider、14box-walkables、0triangle/overhead/ramp；完整世界仍补核，不把单殿清单外推全场。
- held导航clone的**局部障碍与支撑**也必须读取live source（非仅marker）：S载卸、新数组remove、相同count的update都会失效。可给clone显式`furnitureMotionSource`，域外保留原R95引用语义，不重构全局clone。
- 无motion公共getValidPosition只做真实当前位置的保守全身移动，不假定grounded自动抬脚；kinematic仅真实源支撑、真实radius与poseClear成立才step。Teleport/飞行落点与沿地kinematic不是同一语义，单独测试。
- 动态NPC妨碍站姿时surface仍保留真实floor，poseClear=false；不能删地板掉穿，不能站NPC头顶复位跳跃。
- 空中跨边必须在本次完整swept-footprint处理完后原样移交feet/verticalVelocity/airborne，接管该帧不得再落入legacy upward-snap。
- 不需要为本版凭空实现通用曲面控制；若完整实际域发现非盒，先报告并明确精确支持/拒绝策略，绝不静默当bbox实体或忽略。

R95已远端交付：7bdf2e761cf9f176be9be0ab5aace93c128cc305，树7022b966与本地14d8997e准确等价。R96正式发布前重读main以保留用户后续合并。

### 纯机制坐标约定更正
Task2低层`furnitureBoxSweep(fromFeet,toFeet,box,radius,height)`与`furnitureStaticContact`使用**feet坐标**，不从eye反减身高；避免同一接触经`feet+HEIGHT-HEIGHT`舍入后变成假穿入。身体仍精确`[x-r,x+r]×[feet,feet+height]×[z-r,z+r]`，没有EPS抬脚/缩体。上层Collision接线须显式传真实feet scalar并在分步内跟踪，不将此数值改进当作改碰撞容差。9项纯机制已RED→GREEN，控制器尚未接入、6项真实退步仍待修。

## 用户批准的R96累计范围（2026-10-26补充）
本文件的局部家具接触合同保持独立。用户新增同版人物40m附近模型流式（外围预热/退出滞后、远处逻辑不停）、皇帝太和↔中和路线与座位一致性。先关闭家具机制检查点，再为两个角色模块补具体设计/RED；不得用新范围替代现有碰撞、真实提交身份及资源生命周期门。
