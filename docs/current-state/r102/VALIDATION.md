# R102 交泰既有纺织表面（累计候选）

基底R101 local1d42feef / remote1bd81bd3；用户main96f658fd已合R99，不改main。runtime冻结c661b942，仅JiaotaiDisplaySetting调用和新增JiaotaiTextileSurfaces；R101牌框与R100石栏等全部累计保留。

## 来源和边界

亲看故宫官方[交泰正向内景](https://file-pano.dpm.org.cn/hotspotImage/2026/03/20/13ecc40ac5cb4d2088f3b95fbaf234b7.jpg)与[钟旁侧景](https://file-pano.dpm.org.cn/hotspotImage/2026/03/20/4e14d7797d784519a8120f42ac7fd21f.jpg)，SHA409278e71e169b7534af75ea971cc68c89126897c3731b4723f8ee9151c27da8 / 6e68bdf3832a63f6f9f0332a43517406105d62a6c97cccdc514ba01a504f1973。可证黄底浅纹、原罩肩、台毯边饰及蓝色图案分区；未知细纹题材、实色、尺寸/件数及摄影日期。URL目录日期不是拍摄日期。原图不上传。

只给已有26个纺织mesh和1个4.60×3.36m台毯平面加map/必要UV；不改position/normal/index及形体、变换（UV有批准变化）、陈设数量、碰撞、支撑、地图或人物。不揭罩补宝玺。两图案是独立程序绘制的非语义曲纹与边饰，不是原织样、书法、龙纹或历史符号复刻；布褶仍仅由原几何肩面表现，纹理未烘现场照明。

## 实现与真实像素验证

最初package.json有@napi-rs/canvas声明但环境实际未装/cache不可用，初始化MODULE_NOT_FOUND保留，未把它当产品红项。改为同一浏览器/Node纯RGBA生成器创建两512² DataTexture，不新增依赖或绕WebGL限制。sRGB、white材质乘色、flipY=false、linear与mipmap设置显式；纹理随已有两专用材质dispose恰一次，无全局GPU缓存。

RED旧目标无map；GREEN资源/全属性/生命周期3项。独检发现11圆柱小尖顶逐vertex主轴投影产生44个正面积三角UV退化，新增RED后仅这些CylinderGeometry沿用原连续UV，修后4/4。主罩面的实际尺度投影保持，台毯原UV不动，几何/物理没有为修纹样改变。

实际production image.data导出无损RGBA与PNG，PNG逐byte/翻Y对照；CPU透视采实际map/UV，独立双线性repeat/clamp/sRGB/方向夹具2/2。图有局部display陈设，不是完整殿内GPU截图，未复现PBR、runtime灯光/阴影或GPU mip选择。远处CPU纹样呈点状取样，不能据此宣称实机远景无alias。已重导修后前/斜/近三机位；没有用Python另画近似纹理冒充生产map。

独立221mesh中194非目标全属性精确，27目标仅map/指定UV改变；710个正面积目标三角修后UV退化0。五次merge与重复dispose、实际PNG原字节通过。小圆柱尖沿用旧UV，不声称所有目标都按.64m尺度。

原R54实际入口/台周/地图/钟漏/角色保留13/13；累计和完整原失败差分另记。其他中轴内景缺项未关闭。

## 成本与能力

五轮交替顺序、每组10次局部交泰fragment构建+dispose（同进程warm），组中位再中位8.181199→22.0101995ms，约+13.829ms；全部样本/p95/max保留。测量绑定c02bb93c；后来仅小圆柱UV early-return减少局部UV工作，生成器完全不变，不伪称再次实测修后耗时。此为局部CPU，不是全世界首载/GPU或FPS。每图512² RGBA，两图基础2MiB、含mip约2.67MiB估算；不称显存实测或零开销。

root明确接受这项有可见材质收益的约14ms局部加载成本，不为它扩缓存架构。Garden约182ms原重载回退仍未解决，R97/R98未采纳运行改动不继承且负证据保留。实际Node20、GPU/手机NOT_RUN；不重试被拒环境。

## 累计与构建

独立累计184/184通过（c661b942）；完整原套1290本轮1127通过/163失败，新增/消失名均0、取消/跳过0；三base/包身份见下节；旧163红项仍保留，不修改历史expected抹红。安全回滚为已交付R101。

固定夹具恢复有一次流程错误：manifest路径连替错误、shell缺少set-e导致预检失败后启动raw测试；发现后Ctrl-C exit130中止，partial TAP完整归档，不用作任何通过证据。修正路径并按自身HEAD展开166夹具后，重新完整一次1290得到上述结果；未拼接两次结果。后续命令采用set-e失败即停。生成报告归档后两旧跟踪报告逐自身HEAD恢复。

## 冻结构建与预构建包

干净buildSource `20fe291566322b241960668441ef7b503fb2f4de`，fingerprint `d93bb79323dbd8b7e61c14d43f3f36f9522c08a08b8321fee90a8f791df84d00`。后续尾提交只文档/报告，不把最终源码提交假写成构建来源。

| base | build ID | 结果 |
|---|---|---|
| `/` | R102-dc0f42d86845 | PASS |
| `/gugong/` | R102-bdbffc18a526 | PASS |
| `/forbidden-city-3d/` | R102-c0baddfc3a6d | PASS |

三全新outDir串行构建，各137文件逐字节HTTP、133public、31GLB及6内景/decoder/纹理路径通过。三份原始build.log已force入Git；大chunk警告保留，没有为消提示改拆包。两程序纹理在运行时生成，不新增图片下载；这不等于GPU上传/内存零成本。

根路径包139载荷、42,174,254B，manifest SHA256 `83bcf4f4f5cb8f4a6c9afadebcb64eeb90b1a1de92446e3a8ef9c6d4b0c2128a`；启动器与逐payload/准确build身份2/2。实际Node24执行，Node20/GPU/手机仍NOT_RUN；本地成功不是上线，远端最终回读由唯一上传者负责。main是否合并由用户决定，不自动部署Pages。

发布8张PNG均为自产RGBA纹理2张与实际局部CPU前后6张，不含官方照片/用户截图；原始照片只保留外部私有参考。独审代码、结构/资源/像素核验及必要RED均保留。
