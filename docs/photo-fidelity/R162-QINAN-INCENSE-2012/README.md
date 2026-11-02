# 钦安殿两香亭：独立最低可通行作者候选

基线 `f01cdf82e769bf39a74632a29deb8f802815ad58`。仅新增独立模块/测试/证据，不动旧 src/data、ZoneBase/GardenBuilder、发布状态、main 或远端。正常 hook/build/独立复核由累计集成者另做，作者 World 采用 before-finish 注入，不能称为正常集成已通过。

## 证据与未知

主证：故宫官方茹竞萃《御花园的亭子》 https://www.dpm.org.cn/Uploads/pdf/2206/T00019_00.pdf 。PDF SHA256 `b4d0e1fffaaf5e1d6d3e95e9a1d79249dc63d7a110935989d47afa26d39ad0d7`。亲看本地 `/tmp/research-qinan-1948/garden-pavilions-p1.png` 右栏：殿前东西各一方亭，乾隆建，原名香亭；四柱攒尖；前半敞开、后半四面槅扇分隔小室。页面插图题为四神祠，绝非香亭自己的照片。

补证 https://www.dpm.org.cn/Uploads/File/2020/02/18/u5e4bb67fc7439.pdf 第2页印239：在东南焚帛炉、西南夹杆石以北。本轮沿用已读研究 SUMMARY/EVIDENCE，并非取得亭本体影像。`ownPhoto:null`；旧 own.jpg 是殿前景，公开全景 pt:// cube 亦不冒认为自图。没有复制官方图片进仓库/runtime。原 G18 `FC-30C5E54148` 和 G19 `FC-F3135E4D16` 各自独立 metadata/triangle owner，不重绑旧亭/炉/annex。正式名称只写“香亭”，东西工作名/ID只在内部 metadata；没有新增牌匾、mapItem 或 room。

## 实现及 fit

中心 x=-11/+11,z478.4；每个真实完整包络均在 X=center±1.4，Z[477,479.8]，Y[0,5.5] 的方形子盒内。预扫原 3.4×2.8 长方盒不能称为测绘方亭。真实 bbox 见 summary。刷新 f01 World 的原 reserve：两者旧可见三角、owner、support命中均0，y=.04仅排除旧地面，不是全高空柱宣称。

每亭 2.6方×.08高真实石台、四真实柱、四片不透明后室隔扇概形、方攒尖顶。四柱半径 .085/.10、高2.45；x±.9，前柱 localz=-.15、后柱+.9。四柱网格故意为矩形，以保固定z477.5横向接近和1m脚底入口，不能称实测方形柱网。后隔扇 localz=.30/.95、x±.87，后室压缩，前部真开敞但不声称准确前后半比例。屋面 width/depth1.76、overhang.06、baseY2.65、rise1.05。所有尺寸、颜色、屋面曲线、区域位置、南朝向、门关闭姿态及格样均工程 fit；无内部陈设、精细古建复原、开放许可或整体验收宣称。

共34 owner（32真三角、2真石Box），2同顶 rescue:false support；各亭17 owner/1 top。没有空气盒/虚坡/新增全局接触/树山路裁切。两亭互不重叠。共享贴图库未改。原屋面首次超过子盒约1cm被守卫拒绝，保留失败后仅缩小本亭屋面；首次材质名 wood_door 不存在，改用已有 lattice_doors，不修改库。全部真实失败日志保留，未靠旧物改动通过。

## 必要验证

- TDD缺件红（missing independent pair），最后组件5+局部路线1 = **6/6**；实际作者 World **1/1**；真实建前 baseline **1/1**。未重跑已知旧全套/全站GPU，也不声称全套通过。
- 旧固定中轴(0,470)↔(0,478)及z474南横路x-17↔17，30走跑4条建前实际全到达；建后完整frames/end与基线严格相同。横路并未根据静态猜测更换。
- 东/西固定必要接近：从(0,474)至(0,477.5)再到(±11,477.5)、(±11,478)原返。建前30走跑4条全到达。建后30相同输入全到达，新增低台使feet轨迹可变，**不宣称这4条与建前完整轨迹相同**。
- 新10/60走跑各东/西共8条全到达，1320帧；每条都有完整1×1m脚底在真平台的帧，峰feet-ground≤.077278m。4个真实柱/后隔拒绝移动均起点native clear、arrived=false。8路线末态native body全clear；作者World/local完整报告含end/负控/末态逐对象相等。
- 旧3094 mesh（position/normal/UV/index/matrix/material流）、1747 collider、109 top及rooms/map/regions注入前后hash全同。所有父src/data文件blob与bytes保全，详 protected-source.json。
- front.png 东亭正面、oblique.png 西亭斜面均为真geometry CPU fallback渲染，作者亲看；可见四柱、低台、前敞/后隔和方攒尖。仅粗色，无实际贴图/GPU光照/移动端/现场观感验收。渲染2772三角含12三角临时展示地面，runtime两亭2760三角。没有把展示地面加入生产。

## 集成交接

正常 hook 应只一次调用 `buildQinanIncensePavilions(this.kit,this.kit.root.name)`，保两原ID、各17owner/1top，不加地图/房间。请将QA复制到另一个累计证据目录，去掉作者测试的全部 import/call 注入及 before/after/global capture；以真实正常 hook 重验旧流、新8/负4报告及必要30到达，再绑定生产身份上传。不可覆盖 `/tmp/r162-qinan-incense-2012/` 已冻结作者 raw。

manifest 的本地raw hash是本地核验索引，不代表raw已上传远端。GPU、正式正常hook/build、全流式加载及现场精确复原仍未验。
