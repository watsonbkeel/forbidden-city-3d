# R160 螽斯门最小单间门体
Base `49c8c84c201e6573f1a3251f86ec048e0e8e88c0`。仅新 `src/scene/palace/special/ZhongsiGate.js`；原E61 `FC-CF00F15FA8` 但运行分区正确为 **west-six**，不能按清单E误装east-six。无旧源/数据/墙街改动。

## 自身证据而非镜像认定
官方正文 https://www.dpm.org.cn/explore/building/236551.html 明确西二长街南端、南向、一间黄琉璃歇山、绿琉璃仿木构件、双门叶；另载历史可拆门槛，不据此猜2026开放。
自身斜正面 https://img.dpm.org.cn/Uploads/Picture/dc/13146[1024].jpg （左侧被前景遮挡）；背面及值房 https://img.dpm.org.cn/Uploads/Picture/dc/13145[1024].jpg （邻房遮部分侧面）。作者亲看两互补照片，能核门体大形/灰石脚/红柱墙/绿额枋/双红叶。**不能称任何一图无遮挡完整立面**，不拿旁边值房或别门扩建。

宫门拟中心(122.4,303.9)为现西二街拓扑工程拟合，不把anchor当测绘。宽深、色彩、灰脚比例/门槛、隐面、屋顶细节均fit；借现CourtKit等通用构造不代表借麟趾身份或镜像测绘。较宽门体/石脚按本候选独立fit。两叶侧开为保游戏街路；正面图部分开、背面闭，不宣称现实开放。门槛.06真低Box，非历史拆装门槛精确复原。

## 实体/验证边界
13真实逐mesh三角owner+1门槛Box，1实际top/rescue:false；无新ramp/接触例外/房间/地图或横封墙。没有挪养心北墙、永寿/太极院墙、任何街或复制照片值房。
- 先验完整盒X[118.2,126.6] Z[301.5,306.5] Y[0,7]零旧collider/support/visible/body/water；247网格、82101候选三角。实际west-six/garden/axis-courts+global，loadAll:false，非全宫/GPU。此零仅施工前旧占用，不是新门无实体。
- 7 missing-builder真RED→7组件GREEN：身份/zone、bounds、精确mesh-owner、真实低槛/顶、UV、前置/重复守卫、资源finish/dispose各一次。不是late发布回滚测试。
- local1GREEN：实际(118,300.4)南横通道→(122.4,300.4)→(122.4,312)→原返，10/60走跑4/692帧全到，峰.049930392；2柱/2真实开叶4负控拒绝。没有照搬麟趾z297起点穿养心旧墙，也没有只到新门外。
- 候选注入World1GREEN：新4贯通完整数组同local；永寿/太极既有门前原坐标短往返4/552帧完整数组同先验，原点未迁。不是两殿全室内路线验收。施工前后新贯通帧数同，脚高因真低槛改变，不称前后整个新路线数组同。
- 旧west-six4016mesh/1572collider/101walkable及rooms/maps/regions流全部同（具体SHA见summary）。只保护该已加载范围，不宣称GPU或全宫全套。
- 2CPU实际几何亲看，平色非HD纹理/GPU；1164生产三角，1176导出含12测试地面三角。
作者未跑全项目套件/build，正常hook未装；独审后唯一集成人负责正常接线和build。

## 接入/原件
ZoneBase在finish前调用`buildZhongsiGate(this.kit,this.kit.root.name)`，模块仅west-six，错误zone无操作。不得沿用east-six条件。
原件 `/tmp/r160-zhongsi-1106`，官图/页仅/tmp；manifest锁hash，勿直接重跑固定输出覆盖。累计复制world脚本到新输出，去作者loader生产注入，正常身份断言；不能正常hook后捕获含门流却称旧before。原旧流以及4旧/4新完整数组可硬比。routes同为固定输出需副本另写。
命令：分别`node --test tests/r160-zhongsi/{component,routes,world}.test.mjs`，实际7/1/1绿；`node tests/r160-zhongsi/export-cpu.mjs /tmp/r160-zhongsi-1106`和render-cpu.py两图。
