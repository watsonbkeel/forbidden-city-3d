# R160 景阳宫后殿东配殿最低闭壳
基线 `42e44132c8792be951986832bf794a47842c23ed`，只新 `src/scene/palace/special/JingyangRearEastWing.js`，原E61 `FC-FE29005359`。既有src/data/共享hook/main/branches不改。

## 有限自身证据，非镜像身份
官网 https://www.dpm.org.cn/explore/building/236511.html 后院段独立说明御书房5间、东西配殿各3间黄硬山、西南井亭。官网自身图集 https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d19e1640eb.jpg 以西南井亭为前景，左侧北御书房正面/右侧南主殿与远处后东配成组；图集 s5e9d19e15e107.jpg / s5e9d19e160e96.jpg 辅助后院主殿关系。该东体身份来自后院朝东的地理拓扑推断，不是简单图片左右，不是独立专名vp。metadata `OFFICIAL_GALLERY_REAR_COURT_TOPOLOGY_INFERENCE`、ownViewpoint:null，不渲染小匾/新专名。
**可见仅远端红闭扇下部、照片右侧深格窗、低灰台/短阶；照片左窗、上部门顶和大部分屋盖被井亭遮。** 屋型/三间由官网文字支持；这些遮挡处、隐藏背侧、粗格/扇数/色彩/等分与全部坐标尺寸都是工程拟合，不宣称逐面实景核验。井亭/近侧两殿/树/临时物/内陈全不建。item39是z421前东配，item38是后殿御书房，已建后西为另物，均不重复计数。

## 几何与边界
中心(-166.5,443.3)、rot-π/2向院西(+X)，7.2×3.6三间；硬山width7.2/depth3.6/base3.5/height1.5/overhang.5/hardGableEnd:true。完整实际bbox X[-169.077673435,-163.249999988] Z[439.3,447.3] Y≈0..5.332399845，全部在唯一盒 X[-169.3,-163.1] Z[439.1,447.5] Y[0,5.5]，未改盒/缩体避旧物。
50逐mesh三角owner+平台/前阶2真Box，.2/.1真顶rescue:false；0虚坡/contact/rooms/maps。只外壳/可达前台，非室内/整院/现今开放验收，不宣称背夹缝通路。同XZ上方Y5.5..30原可见三角实记0，不冒上方无限净空。

## 实测
原件 `/tmp/r160-jingyang-rear-east-1246`，SHA在manifest。
- 唯一正常基线scan1/1：221半米盒内身体点、97081候选可见三角，旧owner/support/visible/body/water均0。驻留east-six/ningshou/garden/axis-courts+global，loadAll:false，非全宫。
- 新起点(-162,443.3)globalbodyfalse/0owner；身体X[-162.5,-161.5] Z[442.8,443.8]，不沿用后西首轮出生穿台错误点。院心(-157,443.3)↔(-162,443.3)30走跑2/101峰0证明实际可接近；此为先验连接路线，无新物理修复。
- 既有合理街4/3315+景阳院横2/337+靠西2/97，共8/3749完整数组同后西纠正基线。沿既定(-138,441.2)而不是无效440出生点。
- 7missing-builder真RED→7组件GREEN：完整真实bbox/独立身份/逐面owner/真Box顶/实际UV/前置守卫/资源一次。不声称late回滚。
- local1/1：10/60走跑(-162,443.3)→(-163.9,443.3)→原返，新4/124峰.097277779；前闭门/后闭墙2拒。后墙是单体CM封闭性，非全球背缝通行。
- 作者注入World1/1：旧8完整数组同scan，新4完整同local；旧3846mesh/2377collider/118top+rooms/maps/regions全流同含后西。旧东宫/西宫路线不重复跑，用旧流保全，不冒额外通路验收。
- 2CPU亲看实际几何/平色，1444导出三角含12QA地面，非GPU/HD材质。无作者全项目套件/build。

## 唯一集成
正常末端finish前 `buildJingyangRearEastWing(this.kit,this.kit.root.name)`。作者World是loader注入和旧before/after捕获；累计复制改base/new输出并去注入，硬验正常52owner/2false顶/旧8+新4数组。不得正常hook后将含新体flow冒旧baseline，不覆固定/tmp原件。normalhook/build/备份归唯一集成人。
命令：node --test tests/r160-jingyang-rear-east/component.test.mjs tests/r160-jingyang-rear-east/routes.test.mjs（8/8）；node --test tests/r160-jingyang-rear-east/world.test.mjs（1/1）；export-cpu.mjs+render-cpu.py两图。图文/逐帧仅本地，远端源/摘要/SHA/自制CPU。
