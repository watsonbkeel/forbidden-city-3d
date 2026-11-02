# R158 FC-D2A4662D07 — 东所中殿文字拟合候选

基线b3776de83d67a4d46a595130cbf9eb93ea44ac7d，等价最新远端6cc9。唯一新运行模块NansansuoEastMiddleHall.js，作者未改共享hook/旧源/data。不是整九殿或整组南三所完成。

## 可证与未核
故宫官网236452正文明确三所形制相同、各三进，中后殿五间绿琉璃硬山。亲读原文并亲看官方鸟瞰/map3及7996：7996题为**中所中殿**，不能当东所本体照片。东体当前currentIdentityVerified/officialPhotoIdentityVerified/locationVerified均false，rebindsItem17=false。地图注明位置拟合及旧北壳身份未改，未把保留item17后殿名或撷芳殿争议重绑定。

中心(-317.2,53.5)、19×7.5m、檐4.4/脊7m、低石脚.3m均工程适配；四侧窗格、中央闭叶/纯色、背墙/侧面无自身现代立面证明。独立模块沿用已审中殿类别的低模几何做可逆文字拟合，未修改该中所模块；不是复制其本体照片身份。不开室内/游戏门，不猜井亭、配殿、纵院墙/雕饰或现实开放。

## 真实占用与通行
施工前正常World仅加载outer-east+global，拟合盒X[-327.2,-307.2]Z[48.5,58.5]旧collider交叠0、861个半米身体/水网格无阻、z59横路61点清。不是所有分区扫描。最末可见包络X[-327.050001,-307.349999] Z[48.741961,58.258039]，未挪旧屋/水/路。

最终3/3组件：新唯一ID、三维可见顶点全对应实际Float32 triangle owner、z59净空、注册前置/重复/冻结守卫及normal finish/dispose。无late-publish回滚、飞行或跳顶验收声称。7196可见三角、0新walkable/room；不是大空屋代理填空气。

作者World为**QA before-finish注入**，不是已装正常共享hook。旧数组前缀/所有root child及其structure逐引用/内容不改，硬锁3前host+3北原profile+已有中所体，最终合批metadata与map各恰一新ID。16/16接受路线3590帧峰.125394888m（旧北阶），2闭墙拒绝。含z59横路/两侧绕圈/原东前殿和旧东北壳各10/60走跑4条；地面两组脚差0。没有借新台阶/吸地修改旧控制器。

红记录保留：3缺builder真RED；首组件2绿1红因新QA读取旧middleHallOwner键，修正确east键，产品未改；首World在候选构建前因新QA把北檐嵌套addon.scope当root host红，改为精确3原remainingProfile，未改路线/源或减少断言。最终才计绿。

2同视角候选CPU亲看五间硬山、闭面/石脚，无明显穿帮；平色非GPU/贴图/手机。原日志/帧/CPU geometry只/tmp本地非持久，远端仅摘要/哈希/自制PNG，不含官图像素。作者未build/推送，最终正常接线及应用构建待唯一集成人。

## 唯一集成人
精确patch在PROPOSED-SHARED-HOOK.patch：新增import，现buildNansansuoMiddleHall之后一次buildNansansuoEastMiddleHall，仍在kit.finish前。正常World必须NORMAL_INSTALLED=1，它不注入prototype且硬锁calls0/唯一record/6旧hosts；禁止QA二次安装或fallback。
```sh
node --test tests/r158-east-middle/component.test.mjs
NORMAL_INSTALLED=1 EVIDENCE_OUT=/tmp/east-middle-normal.json.gz node --test tests/r158-east-middle/world.test.mjs
```
scan.test仅b377空盒先验，安装后不应拿它期待空盒；原结果在PINS localRaw。whole app build由累计负责。
