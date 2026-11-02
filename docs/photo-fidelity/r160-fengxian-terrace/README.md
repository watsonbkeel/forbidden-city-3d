# R160 奉先殿：两侧真实阶与分段白栏（局部）

Base `1b91d942d3ce0c9643ecc7c5df91e30e54c19cd5`，原 FC-D8AEF2E8A9。仅本殿既有前台，非新殿体，非整月台/整建筑验收。作者不改 release/正常 ZoneBase hook，不 build/GPU；唯一集成人接线、必要累计及构建。

## 图证与拟合

自身官网 https://www.dpm.org.cn/explore/building/236430.html ，自身照片 https://img.dpm.org.cn/Uploads/Picture/2021/11/01/s617f4ed051855.jpg ，本轮亲看 `/tmp/r160-fengxian-own.jpg`，SHA256 `a539b8c50a116e1dab16d7d4c283fcc168882ee230313080fcf76129bce23723`（497393 bytes）。原图仅/tmp，不进产品。作者/集成人已看：三组前阶、分段浅色栏、斜向阶侧栏和两口缸的大形清楚。正文月台40×12m不是本候选工程包络的测绘证明。

保原九间重檐厅体、窗/匾、两口 R143 缸、中央原阶、全部旧地图/房间/碰撞/支承。新增两阶中心 x=-197.3/-167.3，宽5m，8×.15m高/.52m深、趾z232.69、最后一级与原台重叠.10m；栏杆粗大形/四分段，真实门口保持。尺寸、阶/柱重复数、隐藏面及材质数值均工程拟合；不建精细龙凤、中央黑拒马、室内，不宣称现实开放或摄影日期。两CPU是实际几何+库fallback色，不是纹理/GPU/实时现场图。

## 实现及局部接触

- 新 `FengxianFrontSteps.js`：严格正常 east-six 奉先旧frame、旧台明/map及R143缸绑定；仅添加16真实阶Box/真实顶（rescue:false）和104逐实体真triangle栏owner。无空气栏墙/虚坡。全部旧可见与physics/UI流保留。
- 新 `FengxianFrontContact.js`：私有WeakMap只认16新阶+原平台真实top/body/source网格。原平台public字段不改；CM固有转换rescue undefined→true单独精确匹配。授权只两阶中心±2m整掌带，z[231.49,237.2]；原平台仅作这两条通道交接，不认证中央/整平台。跨阶横跳不授权。
- 连续已贴地、原速度/dt门、全路径脚印真面覆盖、原ground0趾交接及原 `wumenJointBodySweep`；不抓首次高落/空中跳跃/侧出，不绕过薄Box或动态障碍。
- `BPrincipalStairContact.js` 仅前缀新wrapper及preserve分派；现Baoyun/Kunning原分派保全。inclusive `function toeRect(` 至EOF逐字同，Collision/FirstPerson/旧认证数据不改。
- 检查的是保留builder源mesh与源数组/正常CM owner；不是任意 merged显示网格修改的全场景实时认证。正常tag卸载撤CM面/体。没有给原中央问题借权。

## 红与最终证据（原件 /tmp/r160-fengxian-0904）

1. `component-red.log` 两项missing-builder真RED；初组件snapshot读null材质错误、来源守卫误读UV转换后不存在的geometry.parameters分别保留原log；修QA null安全和原台/map真实包络守卫，不改旧源。
2. 原World `scan.json.gz` 六路线全到517帧：中央10Hz走峰.5076177/60Hz跑峰1.102，四侧绕行峰0。**中央旧问题未修，不称全台≤.3**。
3. `local-first-native.json.gz` 新阶QA终点237.5撞原檐柱/侧门闭面，8红保留；静态原CM证237.0清、237.3撞旧体，授权仅改终点237.0为“上台前沿后原返”，不移柱/改旧路。半径.5脚掌沿z[236.5,237.5]由末级顶与旧平台联合真实支承；不声称越柱或进入侧门。
4. `local-landing.json.gz` 原生8/8到但跑下降真红：10Hz.616（3帧> .3，阶内2/趾外1），60Hz.835298（25帧，阶内12/趾外13）。父随后明确授权本侧阶局部接触，未调深度/点/全局容差。
5. `contact-red.log` 4项missing-contact真红；`contact-first.log` 因原platform源rescue undefined与CM true不一致而拒绝，保留。精确源/CM规范区分后 `contact-normalized.log` **7/7**：local8/624全到峰.131461，2栏真实拒绝，薄体/动态/移删复制/侧出/跳高状态负控成立。
6. `jump-green.json` 实际原生静止跳跃与4m高落各100帧，有/无私有授权全部帧相等。
7. `preserve.json` 正常整个east-six原2817mesh/1348collider/61walkable及maps/rooms/regions全流SHA前后相同。
8. 首旧B+保护合跑 `protection-green.log` 实为10/11：旧B缺稀疏fixture ENOENT，真实跳高与全流绿；补同HEAD的原JSON后 `old-b-green.log` **9/9**。不修改旧测试/放宽合同。
9. `world-final.json.gz/log` 作者唯一候选World：真实库、原生控制器、loadAll:false/east-six+global，仅QA注入末端新builder。原6/517完整数组逐字=先验，新4/242全到峰.03699（60跑0）。此World不是已安装生产hook。
10. 两CPU亲看粗栏/左右阶清楚；resource-green单独记录正常merge/dispose，无大图或纹理精修。

## 接线与复现

正常接线仅 `ZoneBase.build()` 所有旧构造结束、`this.group = this.kit.finish()` 之前调用 `finishFengxianFrontSteps(this.kit)`；只有east-six匹配，不能在kit.finish之后再造。新contact由builder私有注册，B前缀已在候选。

本地：`node --test tests/r160-fengxian-terrace/{component,contact,routes,jump,preserve,resource}.test.mjs`；旧B9使用精确HEAD测试及 `tests/r157-pavilion-side/retained-contact-57.json`。

**原作者脚本固定/tmp路径，勿原地覆盖**。累计World必须复制脚本到新目录、改base/output，并去QA注入换正常生产hook；保原6点位和242帧新路线断言。扫描、红日志和source保全表保持只读。正常累计之后才关闭集成门。
