# R162 玉翠亭 — 独立最低可通行方亭

原 G15/FC-D471A19B37/sourceLine628；父8f687117a6bfdd85989a2cb64657f0c6cb77898c。独立 YucuiPavilion，非凝香/御景亭/四亭重绑。wholeObjectAcceptance=NOT_ASSERTED。本作者未安装正常hook、未构建/部署或跑历史全套。

## 自身证据与拟合
官方 https://www.dpm.org.cn/explore/building/236444.html 图片62题注玉翠亭，原图 https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e981571b6035.jpg 。亲看本地原图：四红柱、方攒尖三色瓦、三侧低凳栏、中央开放前口和低石台/阶。原图SHA256见manifest，仅私下参照，未复制入repo/runtime。官文“曾增设门窗”是沿革，不能据此强造现图没有的闭合房间。原官文及清单东北隅保留；这里区域位置与所有米制尺寸是工程fit而非测绘。照片确切拍摄时间未知。

中心(-45.2,514.4)，2.8方roof/overhang.25、檐base2.7/rise1.2，四柱local±1.2，3.4方平台h.16、南1.4×.4阶h.08。三侧凳仅支腿与座面概形，省略前侧局部格栅、天花细画、细兽/斗拱和牌匾字形；不造未知古家具/房间。黄蓝绿三材质屋面是粗三角色区，不冒精确棋盘瓦。noMerge保护正常finish三组屋面可见与资源一次dispose；未改共享合批器。

完整实际bbox X[-47.281330061,-43.118669939] Z[512.299999997,516.468346739] Y[≈0,4.389999866]，在预清reserve X[-47.5,-42.9] Z[512.1,516.7] Y≤4.8内。26owners=24真mesh三角+2石体Box、2同顶rescue:false，无空气大盒/虚坡/contact。原山、树、床、道路、摛藻堂与旧门全部保留，0旧生产文件变化。

## 真实前置检查与通行
父预扫原大对称盒(-42.2,514.4)真实撞山876三角/25owner红证保留；不以改采样删除旧物掩盖。新区域fit盒在相同World扫描103738旧三角，visible/owner/support/body采样全0。Y≥.04仅排除保留草.012/铺地.028，不声称全高空柱；见 /tmp/r162-yucui-preflight-1950。

固定父旧路：x=-48,z507→515→507；z509.3,x=-65→-44→-65，30走跑4条/522帧全到达。必要建前approach=(-48,509.3)→(-45.2,509.3)→(-45.2,514.4)→反返，30走跑2条/160帧到达；建台后只承诺同输入/到达，不冒旧地0脚轨迹不变。

7缺件断言RED后7组件GREEN。local新10/60走跑4条/376帧全到达；每条真实进入中心附近并完整站在.16平台，峰feet-ground=.143666664879m。两个有效无初始穿入的北凳/东南柱移动负控均拒绝。后补中心站稳断言曾有测试括号语法错误，原失败log保留，纠正后最终8/8；不是产品故障或隐藏失败。

作者实际World(garden/east-six/west-six/axis-courts+global，loadAll:false，beforefinish注入新模块)：原4条完整frames/end同固定父；新4条及2负控完整报告/end同local，终点native bodyclear、feet0。原kit3068mesh/1721collider/107top及rooms/maps/regions前后完整流相同（含position/normal/UV/index/matrix和材质数组）；全旧src/data逐Gitblob保护。未声称完整streaming/GPU。

两张CPU图亲看：四柱/三色方顶/三凳/南开放入口与石台阶可辨，只是实际几何fallback色，非纹理/GPU/手机/整物验收。

## 正常集成关口
在ZoneBase所有既有finalizer后、finish前调用 `buildYucuiPavilion(this.kit,this.kit.root.name)`。唯一原ID记录、26owners、2 false真实顶、三色屋面normal finish存续。另拷累计QA，去作者import/call注入和所有before/after/globalcapture，另raw路径；原4/new4/negative完整对象对作者final，不伪造已安装hook之前的before。保护作者 /tmp/r162-yucui-1951 与父preflight原件不覆；正常hook/build和独审由集成人关闭。无新map/room，前端未新增工程工作名。
