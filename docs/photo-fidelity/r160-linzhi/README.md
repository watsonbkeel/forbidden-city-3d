# R160 麟趾门最小单间门体
Base `e0966f10507fb75722c0ce40223d9ee40233b308`。仅新 `src/scene/palace/special/LinzhiGate.js`，未改原数据/共享ZoneBase/B/Collision/FirstPerson或旧墙/街。E61 `FC-75AB2BF1F2`，不与螽斯/苍震/千婴混同。

## 自身证据与边界
https://www.dpm.org.cn/explore/building/236552.html 正文：东二长街南门、一间黄琉璃歇山、檐下绿琉璃仿木构件。
https://img.dpm.org.cn/Uploads/Picture/dc/13162[1024].jpg 官题《麟趾门背面》，作者亲看完整屋盖、石脚两侧门柱、红双扇。**原图闭门；本候选两扇侧开为保旧街的游戏适配，绝非现今开放声明。** 位置/尺寸/颜色/正面与细纹均拟合。以既有街心(-120.8,303.4)拟合，不将anchor(-119.9,303.4)当实测；不擅移院墙，不新加横墙。

最小黄歇山/绿额枋、双门柱灰脚、侧开红双叶；13真实逐mesh三角owner，.06m低门槛是真Box，配1真实顶rescue:false；无新坡/接触例外/rooms/maps。可见门槛有实体，不是虚浮支承。未知正面保 `frontElevationVerified:false`、未知现实开放保 `currentAdmissionVerified:false`。

## 原件与结果
原件仅 `/tmp/r160-linzhi-1053`，图源原件仅/tmp，不上传论文或逐帧数据。
- 唯一旧基线先验：完整盒X[-125,-116.6] Z[301,306] Y[0,7]无旧col/support/可见三角/body/water交叠。247身体采样，93817候选三角。loadAll:false，east-six/ningshou/garden/axis-courts+global；不是全宫或GPU。**只指施工前旧空间为空，不指施工后新门无实体。**
- 7 missing-builder真红→7组件绿。红断言提示沿用了“five-bay”字样（实际身份测试已为1）；绿前仅改提示为single-bay，未改一间断言。覆盖真实UV、各mesh精确owner、真门槛/顶、前置/重复注册守卫、资源finish/dispose各一次。
- 原生local1绿：10/60走跑、x=-120.8 z297→312→297真穿303.4门位，4路628帧全到，最大脚地差.049930392。两门柱、两实际侧开叶横碰共4拒绝。不是仅走到299.2。
- 候选注入World1绿：同4贯通完整数组等local；原4街3315帧完整数组等先验，未改点；新贯通与先验各帧数同，但脚高因真低槛变，不虚称前后全部帧相同。所有旧east-six可见/碰撞/支承/rooms/maps/regions流完全同summary。
- 2CPU亲看真实几何，平色而非GPU/HD纹理。1164生产三角，1176导出含12测试地面三角。
- 作者未跑全项目套件/build，未装正常hook；最终由集成人正常接线、必要验证和build。

## 精确正常接入
`buildLinzhiGate(this.kit,this.kit.root.name)` 放ZoneBase `this.kit.finish()`前（模块仅east-six）。与已正常天穹不相干，无旧数据修改。
作者World使用loader注入并捕获旧before/after；累计必须复制到新路径和新/tmp输出，去生产注入，改为正常安装身份断言。不要在正常hook之后把含新门的流当作原before。可比manifest旧流及原4街/新4贯通完整数组。作者routes固定/tmp输出，不直接复跑覆盖。

命令：`node --test tests/r160-linzhi/{component,routes,world}.test.mjs` 分别运行7/1/1；`node tests/r160-linzhi/export-cpu.mjs /tmp/r160-linzhi-1053` 后用render-cpu.py两次生成front/oblique。原件路径和hash见manifest。
