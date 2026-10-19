# 三殿外匾挂点核查（只读证据）

核查日期：2026-10-18 UTC。对象：R24 `/workspace/shared/forbidden-city-3d-r24-baohe-rear`。没有修改项目、执行测试或启动浏览器；只读源文件、检索官方页面并查看原图。给定 R2 对照目录在当前文件系统未找到，因此太和殿、乾清宫采用故宫博物院官方建筑页原图。全部选用图片已通过图像查看工具实际查看。

## 结论

**三座确有同一类可见挂点错误，足以支持独立、有限的纠正候选：正面外匾应处于上下两层檐之间，R24 却统一放在下檐以下的门头附近。** 这不是为做新版本而增添装饰。仅证实挂点与大体格式，不等于匾额完整复原。

- **太和殿**：南向正面中轴，匾在上层檐下、下层屋面以上的夹层正中。官方近照清楚显示竖式蓝底、金色汉字“太和殿”单列，由上至下；红褐色曲线雕框带金色线脚，外轮廓包含上横翼与下垂脚。全景与官方“从太和门望太和殿”图确认它属于朝南前脸。
- **保和殿**：南向正面中轴，同样在双檐之间。竖式蓝底、金色汉字“保和殿”单列，由上至下；红褐/风化浅色的曲线框及伸出轮廓，不是单纯金色矩形。两个现状照片和官方 1941 年正立面图对挂点结论一致。旧图是历史辅助，不能代替现状照片定颜色、装饰保存状态或尺寸。
- **乾清宫**：南向正面中轴，同样位于双檐之间；南侧高台甬路接乾清门的正面全景与近照对应。**竖式蓝底金字，但为满汉双列：照片左列汉字“乾清宮”，右列满文。** 不应沿用单列三字冒称真实完整匾面。红褐色雕框明显，框宽和字列处理不得由太和、保和直接套用。此次未转写满文，也不推定可用字体。

方位判据：太和殿采用官方明确标注的“从太和门望太和殿”图及其前庭拓扑；保和殿官方建筑页说明其位于中和殿后，已有全景 1777 数据中“进入保和殿”约 -0.61°、“前入中和殿”约 178.52°，与正立面/近照相互注册；乾清宫官方正文明确前方月台甬路接乾清门，且“后三宫”条目说明由南向北的建筑顺序。**不是从近照画面上方推断北方。** 本证据不支持新增后/北面复制匾。

## 允许与不允许从照片推导的比例

- 可支持：挂在夹层而非门头；居中；竖式；蓝色字心为高于宽的矩形；曲线框较字心外扩；颜色类别及单/双字列。
- 三张较正面的近照中，蓝色矩形字心的表观宽高比均约 **0.8**（人工读图只宜作约 0.75–0.85 的粗略检查范围）。这是二维照片中的字心比例，不是整个雕框的宽高比，也不是测绘值。框顶横翼、底部垂脚是否算入边界会明显改变外框比例。
- 太和近照字心约 x285–713/y520–1052（1000×1500）；乾清近照约 x280–743/y410–982（1000×1500）；保和近照约 x920–1017/y400–525（1920×1280）。端点人工估读，数像素至十余像素误差；这些坐标只解释粗比例，不冻结施工参数。
- 不能支持：三座匾同一物理尺寸、毫米/米制宽高、离墙距离、支架构造、统一框型、精确字体或色值。仰视、透视、不同屋面/墙面深度、光线和风化均影响表观大小。低分辨全景仅用于挂点和中轴关系，不用于描字。
- 无照片给出可靠拍摄日。网址中的 2019/2020/2025 日期、文件下载日或页面抓取日均不是拍摄日；保和官方照片元数据 productionTime 为空。1941 是图纸制作年代，2026/06/25 是其服务路径日期。此处“现状照片”指官方使用的彩色实景照片，不承诺拍摄于 2026 年。

## 有界技术路径（未实现）

1. `src/scene/PalaceBuilder.js:795–800` 的外匾生成早于屋顶；其 Y 取门头区 `y + doorH + (H - beamH - doorH)/2 + 0.2`，Z 取下层面阔位置 `z0 - d/2 - 0.4`，三殿共用。与照片的夹层位置不符。
2. 同文件 803 起生成的屋顶已保留实际挂点元数据。`RoofBuilder.js:642–644,706` 的 `doubleEaveMountingBand` 为实际生成的下檐围脊顶部 `lowerY`、上屋面墙边檐底 `upperY`、夹层墙半深 `halfDepth`/半宽 `halfWidth` 及 `upperSoffit`。可在屋顶生成后据此建立**仅这三座、仅南向外匾**的有限挂点，不改门、殿身、屋顶或室内匾。
3. `roof.position` 是 `(x0,0,z0)`；band 的 Y 已含 buildRoof 的 baseY，不应重复加殿身 Y。Z 应理解为上层夹层墙平面，不能继续用下层 `d/2`。保持朝南；给厚度、离墙、上/下屋面碰撞留有显式检查。
4. 元数据是几何边界，不是实物测量。`upperY` 是墙边檐底，在向前伸出的匾平面处还需核对实际上屋面下缘；下部曲线脚在照片中接近下檐围脊，不应用任意缩小匾或加大离墙来掩盖模型不合。既有城门实现可供读法参考，但不得照搬其尺寸/框型。
5. 候选应明确标注“挂点纠正；字形/雕框仍简化”。乾清宫满汉双列缺口、三殿红褐雕框缺口保留为事实，不把现有简体系统字形或金矩形改名为完整复原。官方图片仅作参考，不作为游戏纹理。

读取时源文件 SHA-256：
- PalaceBuilder.js：`542b9f7e1c34f232412a813a6603ff980211d41ac2fca1281f92c961a7bb7ad6`
- RoofBuilder.js：`0e846c35971cb9a53a595a525e6d85b8337ca4c622156a8c96871ba7aa9280b6`

## 精确来源与本地证据

官方建筑页：
- 太和殿：https://www.dpm.org.cn/explore/building/236465.html
- 保和殿：https://www.dpm.org.cn/explore/building/236434.html
- 乾清宫：https://www.dpm.org.cn/explore/building/236472.html
- 官方全景入口：https://pano.dpm.org.cn/ （保和殿 viewpoint 1777；旧读取得到的原始数据 `/workspace/shared/palace-next-stairs-evidence/pano-vp1777.json`）

下列本地文件均已实际查看。新下载文件位于本 REVIEW 同目录；保和文件复用已有证据，未复制到游戏工程。`source-manifest.json` 同时记录原图像素和字节数。

### 太和殿
1. 本地：`/workspace/shared/palace-nameboard-mount-evidence/taihe-front.jpg`
   原图：https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e9926e6ea567.jpg
   SHA-256：`99bece99f3703f7359ef70367383ec9aa8aa4b2e48b5d0bc34fc41165a8b20f8`
2. 本地：`/workspace/shared/palace-nameboard-mount-evidence/taihe-detail.jpg`
   原图：https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efefbd5093a9.jpg
   SHA-256：`eebdbe096e5aeecc55d08e380775171438c75b635846dc013c452bce55f36c1c`
3. 本地：`/workspace/shared/palace-nameboard-mount-evidence/taihe-from-taihemen.jpg`；官方图注“从太和门望太和殿”
   原图：https://img.dpm.org.cn/Uploads/Picture/2019/12/31/s5e0a95c8c2815.jpg
   SHA-256：`28f7d32d297001a5b7174fb0f3ff0f38a52d9faa7e7504efd088bfeb54cc2920`

### 保和殿
1. 本地：`/workspace/shared/palace-baohe-columns-evidence/official-photo-extra-5.jpg`
   原图：https://file-pano.dpm.org.cn/hotspotImage/2025/08/19/dlV1Td6ERs6f20zINpkskcSWnuy6tdjhfEpVP0B9.jpg
   SHA-256：`17b15f30a018594874f0e083ae9b7497374fdbb9fe50f09e40b711ccd783953c`
2. 本地：`/workspace/shared/palace-next-stairs-evidence/pano-photo-1.jpg`
   原图：https://file-pano.dpm.org.cn/hotspotImage/2025/08/19/0TTJoy5DShYnwyRpQdjy37GWXr2uTpF5r1G43aKU.jpg
   SHA-256：`3d4edb7951a0c677bd06d95f8878d24eac8ae79ac5f59112079cbe54ddf44060`
3. 本地：`/workspace/shared/palace-next-stairs-evidence/drawing-49.jpg`；元数据：49_正立面_北京故宫保和殿正立面图，productionTime 1941年
   原图：https://file-pano.dpm.org.cn/hotspotImage/2026/06/25/5d9ce88cb6174d278ceeaa19da0eb1c8.jpg
   SHA-256：`c663c3ac0a5d2764b60e96ff880a0245d74422cf5eecd0e0bf40101aa001323c`

### 乾清宫
1. 本地：`/workspace/shared/palace-nameboard-mount-evidence/qianqing-front.jpg`；官方图注“乾清宫外景”
   原图：https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e997affc5961.jpg
   SHA-256：`bcef57d23a41dca2875e902e16207d95c5108fa1f55df3439a23f245bfd04441`
2. 本地：`/workspace/shared/palace-nameboard-mount-evidence/qianqing-nameboard.jpg`；官方图注“乾清宫匾额”
   原图：https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e997b603cfe0.jpg
   SHA-256：`9e6e72d54cc138860a4f2188e1c376b9647004ea26fe82c32e1a21199fd28b9e`

## 验证边界

本报告只确认照片挂点与当前代码的可见拓扑不一致；没有运行 R24 场景、截取模型新画面、执行性能/回归测试或证明未来改动正确。下一候选需独立固定视角确认三座匾与屋面无交叉、字面朝向正确、旧门头匾只移除一次，并保持当前已验证版本可回滚。
