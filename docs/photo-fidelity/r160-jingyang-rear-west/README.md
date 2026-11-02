# R160 景阳宫后殿西配殿最低外壳
基线 `d143ca93cec3db51e246fbb85d877756e7a69ad6`，只新 `src/scene/palace/special/JingyangRearWestWing.js`，原E61 `FC-BD30A6AEF7`。旧src/data、共享hook/main/branches未改。

## 身份证据：官方图集拓扑推断，不冒专名全景
官网 https://www.dpm.org.cn/explore/building/236511.html 后院段独立写御书房五间/东西配殿各三间黄硬山/西南角井亭。自身官方图集 https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d19e15e107.jpg 显示后殿御书房正面、其西侧配殿及前方西南井亭；同图集 s5e9d19e160e96.jpg 正面御书房匾可读辅助主殿身份。因此不是简单“图片左=西”，而是朝北看后院正殿+西南井亭拓扑关系推断。metadata `OFFICIAL_GALLERY_REAR_COURT_TOPOLOGY_INFERENCE`，ownViewpoint:null，不称找到了独立专名vp，不读配殿小匾/不写古鉴斋匾。
自身侧景可见三间黄硬山、红闭扇组/两侧暗格窗/低灰台。本轮只粗大形，窗格/扇数/彩色/隐背侧/三等分/全部米制坐标拟合；不复制钟粹绿色双门，不建井亭/前景邻檐/临时垃圾桶/内陈。item40是前西配z421，item38是后殿御书房，不重复计数。

## 完整几何与旧高檐
中心(-132.5,443.3)、rot+π/2朝院-X，主体7.2×3.6，屋盖width7.2/depth3.6/base3.5/height1.5/overhang.5/hardGableEnd。全部实际bbox X[-135.750000012,-129.922326565] Z[439.3,447.3] Y≈0..5.332399845。完整盒 X[-135.9,-129.7] Z[439.1,447.5] Y[0,5.5]，不是删掉屋盖求净空；新真实最高点含在内。
原高檐在同XZ、Y5.5..30仍有33个三角，记录于World preservation.overhead；这些整三角最低顶点保守界6.509848118，减新盖全局最高5.332399845得≥1.177448273m垂直净差。不是精测现场或上方无限净空；原檐/墙不动。
50逐mesh三角owner+平台/前阶2真实Box，.2/.1精确真顶rescue:false。0虚坡/contact/rooms/maps，仅闭合外壳与可达前台，非室内/整院/GPU验收，背夹缝不声称通路。

## 首RED及唯一正确出生点诊断
所有原件 `/tmp/r160-jingyang-rear-west-1224`。
1. 首scan完整盒221点/96633候选三角旧owner/support/visible/body/water全0；原街4/3315和横路2/337到，但靠西(-138,440)→(-138,446)走跑皆出生即卡60帧，真实node test exit1。外层tail exit0不是测试通过。无候选产品时已失败。
2. 父要求定位。`start-owner.mjs`仅实际ZoneBase.buildHallBaseline item37/actual library单体CM，原body[-138.5,.35,439.5]..[-137.5,1.65,440.5]唯一穿旧平台Box[-160.6,0,424.25]..[-138.4,.6,440.15]；诊断CM移除此一个owner后false，生产完全未删。可见台石沿最北440.26000042。说明是QA出生身体已穿台缘，不证明常规到达路故障。
3. 唯一授权仅南点440→441.2，X=-138/北终点446/原横/街/盒全不变；新body最南440.7，距可见石沿.43999958、距Box.55。`scan-valid-start`正常World同时确认原点唯一east-six平台owner、纠正点body清空。全部旧盒仍0；原街4/3315+横2/337+合理靠西2/97，共8/3749均到峰0。原RED与诊断保留，未反复换点/缩盒/改物理。

## 候选终态
- 7missing-builder真RED→7组件GREEN，含实际全包络/身份/逐三角owner/真Box顶/真实UV/前置守卫/资源一次；不声称late rollback。
- local1/1：10/60走跑(-138,443.3)→(-135.1,443.3)→原返4/152，峰.105888473；前闭门/后闭墙2拒。后墙负控是单体CM，不是全球背缝路线。
- 作者注入World1/1：旧合理8完整数组同纠正先验，新4完整数组同local；旧3794mesh/2325collider/116top/UI全流相同。loadAll:false，驻留east-six/ningshou/garden/axis-courts+global，不称全宫。
- 2CPU真实几何/平色，1444导出三角含12QA地面，非GPU/HD。首次oblique误保留旧远相机，旧图/JSON/log保留old-camera；仅修QA相机重渲，无产品/World变化。
未跑作者全项目套件/build。照片/研究及逐帧仅本地，远端只源/摘要/SHA/自制CPU。

## 唯一正常接线
末端finish前 `buildJingyangRearWestWing(this.kit,this.kit.root.name)`。作者World为loader注入/before-after捕获；累计复制脚本改base与新输出、去注入，验正常52owner/2false顶/旧8+新4数组。不要在正常hook后把含新体流冒旧before，不覆固定/tmp原件。正式build/部署归唯一集成人。
命令：node --test tests/r160-jingyang-rear-west/{component,routes,world}.test.mjs，实际分前两8/8、World1/1；export-cpu.mjs+render-cpu.py两图。
