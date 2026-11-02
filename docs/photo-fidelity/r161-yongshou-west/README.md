# R161 永寿宫后殿西配殿：独立自身门窗图、屋型暂定

原F55项 `FC-9E42F18295`，基线 `2018942d49aa788f187071b7b670435ae426b618`。唯一新生产文件 `src/scene/palace/special/YongshouRearWestWing.js`，未改shared hook/release/main/branches。正常 `ZoneBase.build` finish前调用 `buildYongshouRearWestWing(this.kit,this.kit.root.name)`，仅west-six有效。

## 三层证据不可混用
1. 官文 https://www.dpm.org.cn/explore/building/236450.html ：后院正殿5间、东西耳房、殿前东西配各3间。**正文没有明确后配硬山屋型**。
2. 官方API vp2934/group35确名“永寿宫后殿西配殿”；自身封面 https://file-pano.dpm.org.cn/panorama/2025/07/10/6527239e-b595-4ee7-aafc-772d0f418dd7.jpg 可见中央闭门组、绿边侧窗、红柱、低灰台短阶。另group中vp2937明确本配南侧，普通cover https://file-pano.dpm.org.cn/sphPic/2026/11/01/2a82a3eec7564d1f9e04da0ad05f58d9.jpg 只见墙柱/檐底；两图均未完整呈现屋端。
3. 因此**硬山是工程拟合，不是官文或自身全屋图已证**，`roofTypeVerified:false`在真实metadata；屋高/瓦色、所有坐标尺寸、闭门叶比例、粗绿窗格、后侧均fit。不追彩画雕刻，不建室内、井亭/展陈。图库路径年月不是实拍年月，现实开放未验。

去重：west-six item10是前西配z319.8，item8是独立替换的5间后正殿；本体位于后院西侧，不把它们重绑/计新主体。0新room/map，不增加前端开发注释。

## 完整真实盒/实体
中心(112.2,343)、朝院心-X，三间6.6×3.2。roof gable/hardGableEnd/width6.6/depth3.2/base3.5/H1.5/overhang.5暂定；实际roof函数加7.4×3.8×.2基台/.1高.4深短阶的完整bbox为X[109.822326374,114.577673626] Z[339.299999952,346.700000048] Y[≈0,5.332399845]，严格在唯一盒[109.7,114.8]×[339.1,346.9]Y[0,5.5]。
44逐mesh真实三角owner+2基台/阶Box=46，2真实顶rescue:false；0虚坡/contact。闭门窗面localZ=-1、柱线-1.7是安全前廊深度拟合，不是量得实景。

## 验证与一次QA目标纠正
- 真实roof轻算 `bounds.mjs/json/log`，先锁完整bbox。唯一正常World先验旧visible三角/owner/top/water交叠全0；1非通路边缘半米body诊断红保留，非通行背南缝不作全盒body门槛。
- 基线正常west-six/garden/axis-courts+global驻留、loadAll:false；固定院地(107,340.2)→(109.4,340.2)→(109.4,343)原返2/116峰0、起点global清，原永寿/太极门前4/552峰0，共旧6/668。
- 7missing-builder真RED→7组件绿；覆盖专名身份/完整bbox/逐mesh真实owner/2真顶/真实tile UV/注册前置守卫/资源各一次。不是late-publish回滚测试。
- 首local目标110.4：60Hz走跑到达，10Hz止于x110.385945/feet.2，未穿过110.4目标平面，真实红保留；不是把.014差当已到达。父只准QA目标110.4→110.35一次，产品/旧6/driver/容差/闭门负例不改。
- 静态目标110.35/.2 native body clear。按半径.5的脚掌X109.85..110.85，最前.05不在阶台上而是既有连续地0；**不能称全掌同高阶台覆盖**。父明确接受真阶+台+连续地0承接，不加虚支持/contact。
- 最终local1绿：10/60走跑(109.4,343)→(110.35,343)原返4/68帧全到，峰.103848653802；原2闭中门/后墙负控仍拒（背墙只单殿负控，不宣global背缝可通）。
- 唯一作者注入World1绿：旧6完整对象同先验，原4030mesh/1586collider/102top及room/map/region全流同；新4recorded frames/driver同local，离线核连end完整对象亦同；末态native body清/feet0。World脚本test标题残留JingrenRearWest仅继承诊断文本，实际模块/base/坐标/zone均为本候选，未把别项测试充数。
- 同XZ有限上方Y5.5..30有38旧三角，其全部顶点最低7.211192131；相对新最高保守垂距≥1.878792286，非无限上方净空。
- 两CPU亲看粗形：实际geometry与library fallback色，非GPU/HD。1372导出三角含12QA地面，生产1360。没有全站suite/build、未安装正常hook。

## 原件与累计
原件 `/tmp/r161-yongshou-west-1358/` 及官页/API/两自身图都仅/tmp，SHA见manifest。原110.4红与静态.05边界必须保留。默认作者QA固定输出不可直接重跑覆盖；唯一集成人复制到新/tmp，改base/output并去作者loader注入，正常hook核1record/46owner/2false顶，旧6/新4完整对象与作者最终World同，再cleanbuild。此候选不等整体实景/内室/整R161验收。
