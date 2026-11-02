# R160 永和宫后殿东配殿最低独立体
Base `734c07c517e1c7cb4de47a1c744ef7f2d5a6b676`；仅新 `src/scene/palace/special/YongheRearEastWing.js`，E61 `FC-D240B3E3A3`。旧源/data与共享hook未改，不把现前配 east-six32 或后殿同顺斋31重复计为此对象。

## 自身来源
官网 https://www.dpm.org.cn/explore/building/236518.html 后院段明确同顺斋之后东西配殿各三间、明间门、黄琉璃硬山（不是只拿前院文字）。原全景 vp3668/group158/sph1943461388466900992 由正常公开vpDetail/vpGroupDetail回读确名《永和宫后殿东配殿》，原JSON锁manifest。
自身cover https://file-pano.dpm.org.cn/panorama/2025/07/10/e17fea3b-4e5d-4ef5-84cb-d32950029454.jpg 亲看可辨硬山、红柱/窗框、中央门组/两侧槛窗/低台；现代告示/垃圾桶/盆栽不建。**照片中央门开，本轮明确闭壳限制不建室内**，不是现代开放复原。不得声称URL年份等于拍摄年份。

主体7.2×3.6、三等分间、中心(-166.2,392.5)与朝院西(+X,rotation-π/2)为相对后院拟合，无测绘。隐藏背侧/色彩/窗格/扇数/低台阶尺寸fit。未迁现前殿/同顺斋/院墙/任何原路线，未加后西配或背夹缝通路。50逐mesh真实三角owner+2真石Box；.2平台/.1前阶各真toprescue:false；无虚坡/contact/rooms/maps。

## 真实红→绿，不隐藏纠正
全部原件 `/tmp/r160-yonghe-east-rear-1117`；如下都保留：
1. 首scan旧盒xmin=-169.5真RED：1院东墙owner、17可见三角（墙帽向内至-169.14999），66周边身体点；0路线已跑。不是无效碰边。
2. 授权只收多余预留到xmin=-168.8，不缩7.2×3.6或移中心/旧体。`scan-corrected`已核零旧占用但在旧路线对象错误数组解构TypeError，尚未跑路线。
3. `scan-corrected-final`仅QA解构恢复，同新盒 X[-168.8,-162.8] Z[387.5,397.2] Y[0,7]，旧owner/support/visible/body/water0，260盒内身体点半径.5、94649候选三角。原后院横路/东侧接近4/548、原街4/3315均到峰0。盒外紧贴旧墙夹缝不声称可通。
4. 组件7missing-builderRED（提示误沿用five-bay文字，实际身份断言已3）→首源码7红：通用博缝使实际xmin=-168.87767逃盒；`bounds-diagnostic`只选1条定位包络。没有碰旧墙，但仍尊重获准盒。唯一授权檐出.6→.5（未缩主体/移动中心/改盒）后7GREEN；首bbox红全部留存。
5. 最终actualbbox X[-168.7776734,-162.94999999] Z[388.5,396.5] Y≈0..5.3324 完全落新盒。资源once/精确三角/真Box顶/真实UV/前置注册守卫均在7项，不声称late发布回滚。
6. local1绿：10/60走跑前台4/178帧，(-160,392.5)→(-163.6,392.5)→原返，峰.105888473；前闭门/后闭墙2负控拒绝。后墙负控是独立单体CM封闭性检查，不是全局背夹缝通行宣称。
7. 候选注入World1绿：新4完整数组同local；原后院4/548与原街4/3315完整数组同纠正先验，原点未改。旧east-six3608mesh/2139collider/108tops+rooms/maps/regions前后全流同。loadAll:false，实际east-six/ningshou/garden/axis-courts+global，不是全分区。
8. 2CPU作者亲看实际几何平色，非GPU/HD材质。1432生产三角，1444导出含12测试地面三角。无全项目套件/作者build/正常hook声明。

## 接入与复核
唯一集成人在ZoneBase finish前正常调用`buildYongheRearEastWing(this.kit,this.kit.root.name)`（模块仅east-six）。作者World是loader注入+旧before/after捕获；累计复制新脚本/新/tmp输出、去生产注入并验正常记录，不能正常hook之后把含新体流冒称旧before。完整原8+新4数组可直接硬比。routes也是固定raw输出，勿直接重跑覆盖。

实际命令：分别`node --test tests/r160-yonghe-rear-east/{component,routes,world}.test.mjs`最终7/1/1；导出export-cpu.mjs后render-cpu.py两图。选定bounds诊断不是全组件通过。旧/新原始日志与所有SHA见manifest；照片、API原件和逐帧仅/tmp，不能上传为生产资料。
