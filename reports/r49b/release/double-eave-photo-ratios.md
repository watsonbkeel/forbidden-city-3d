# 双檐牌匾实景像素比例复核

结论：两处双檐夹层归位有明确照片依据；旧低门头位置不符。当前单次等比缩放只能作为模型避交拟合，不能作为实测比例或雕框还原通过。未改生产代码，未跑场景。

## 坐标口径
源图左上为 (0,0)，框为 [左,上,右,下]，误差为人工选边误差。全部按完整雕框/外挑顶冠选边，不把汉字蓝内面当整匾。透视、仰角、倾挂和雕刻深度造成的系统误差另计，照片不是测绘图。

## 模型旧/新完整矩形外框
- 坤宁宫：旧 1.437160 × 2.318000 × 0.150；新 1.141532 × 1.841180 × 0.150。单次比例 0.794296916，旧/新宽高比均 0.620。
  - 当前可避交夹层 [12.37736, 14.278540250436434]，高 1.901180；旧高/当前夹层 1.2192，新 0.9684。
  - 模型中央柱间 5.111112；旧宽/柱间 0.2812，新 0.2233。该柱间为模型数据，不是照片测量。
- 太和门：旧 1.534981 × 2.475776 × 0.150；新 1.174476 × 1.894316 × 0.150。单次比例 0.765140439，旧/新宽高比均 0.620。
  - 当前可避交夹层 [14.228359000000001, 16.18267533546394]，高 1.954316；旧高/当前夹层 1.2668，新 0.9693。
  - 模型中央柱间 5.340000；旧宽/柱间 0.2874，新 0.2199。该柱间为模型数据，不是照片测量。

## 原图像素复核
### kunning-overview
- 原图 1425 × 950：[官方图片](https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e997ecca81fc.jpg)。
- 本地源：r49b-outer-plaque-audit/sources/236487-0.jpg。
- 完整外接框 [970, 447, 1041, 503]，约 71 × 56 px，单边误差 ±5 px；投影外接宽高比 1.268（不是物理宽高比）。
- 局部可见夹层：x≈1005，y≈447–509，边界误差 ±6 px；框高/夹层约 0.903。
- 对应参考区间：visible lower facade column-end interval, NOT identified central bay，端点 [525, 630]、[1295, 710]；水平跨度 770 px；框投影宽/该区间 0.092。
- Strong oblique view: frame is slanted and carving shadow merges with the roof.
- Do not divide this projected envelope by an orthographic model width to infer scale.
- The visible lower facade interval is at a different depth/elevation; no central-bay identification claimed.
### kunning-close
- 原图 1000 × 1499：[官方图片](https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e997ee07b730.jpg)。
- 本地源：r49b-outer-plaque-audit/sources/236487-1.jpg。
- 完整外接框 [125, 365, 902, 1107]，约 777 × 742 px，单边误差 ±8 px；投影外接宽高比 1.047（不是物理宽高比）。
- 局部可见夹层：x≈500，y≈330–1110，边界误差 ±20 px；框高/夹层约 0.951。
- 对应参考区间：cropped facade only; columns absent，端点 [0, 700]、[999, 700]；水平跨度 999 px；框投影宽/该区间 0.778。
- Full carved envelope includes broad flaring crown and bottom/side curls.
- Inner lettering panel is documented only to prevent substitution: it is not the complete plaque.
- No complete column pair visible; a physical plaque-to-bay ratio is not measurable here.
- Upward camera angle, carved depth and possible hanging inclination preclude true aspect-ratio measurement.
### taihe-front
- 原图 1425 × 780：[官方图片](https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e980c931a533.jpg)。
- 本地源：r49b-gate-plaque-audit/axis/taihemen-1.jpg。
- 完整外接框 [707, 410, 731, 434]，约 24 × 24 px，单边误差 ±2 px；投影外接宽高比 1.000（不是物理宽高比）。
- 局部可见夹层：x≈719，y≈409–438，边界误差 ±2 px；框高/夹层约 0.828。
- 对应参考区间：central lower-front red-column centre interval，端点 [649, 567]、[788, 567]；水平跨度 139 px；框投影宽/该区间 0.173。
- Full red/gold edging and lower scalloped termination included, not just blue lettering field.
- Approximately 24 px object cannot justify fine percentage claims.
- Photo central bay is visibly wider than neighbouring bays; model uses nine uniform bays.
- Plaque and lower column endpoints are at different depth/elevation; screen-width ratio is a composition diagnostic, not surveyed ratio.
### taihe-distant
- 原图 1425 × 950：[官方图片](https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e980c2a4da38.jpg)。
- 本地源：r49b-gate-plaque-audit/axis/taihemen-2.jpg。
- Plaque only roughly 10 px wide at this distance. Inspected for central double-eave placement only; not used for quantitative frame scale.
### taihe-oblique-left
- 原图 1000 × 1777：[官方图片](https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e980c9308131.jpg)。
- 本地源：r49b-gate-plaque-audit/axis/taihemen-3.jpg。
- 完整外接框 [211, 228, 378, 360]，约 167 × 132 px，单边误差 ±4 px；投影外接宽高比 1.265（不是物理宽高比）。
- Approximate quadrilateral envelope includes projecting top bar, side scalloping and lower shaped foot.
- Axis-aligned envelope is strongly skewed: its width/height is not the intrinsic plaque aspect.
- Oblique image corroborates plaque is in double-eave tier, not the lower doorhead.
### taihe-oblique-right
- 原图 1000 × 1777：[官方图片](https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e980c9310fb3.jpg)。
- 本地源：r49b-gate-plaque-audit/axis/taihemen-4.jpg。
- 完整外接框 [585, 164, 762, 314]，约 177 × 150 px，单边误差 ±5 px；投影外接宽高比 1.180（不是物理宽高比）。
- Approximate envelope includes projecting top bar and red/gold shaped border.
- Same slanted hanging geometry seen from the opposite side; no camera calibration or plane rectification performed.

## 必须保留的风险与解释
- 坤宁近照整个雕框包含宽展顶冠，约 777×742 px，内文字面约 365×495 px；两者不能混用。旧/新矩形宽高比 0.62 不具有完整雕框复原依据。但仰拍/倾挂未校正，不能把照片约 1.047 的投影宽高比直接改成模型真宽高比。
- 坤宁夹层垂直填充粗估约 95%，选边误差与阴影可使其约落在 90%–100%；候选模型约 96.8% 与这种构图不矛盾，但不独立证明 .7943。近照裁掉全部柱列，不能提取真实柱间比。
- 太和门正面完整框约 24×24 px，夹层约 29 px，框高/夹层约 83%；±2 px 选边误差本身就很大，合理粗区间约 65%–100%。模型约 96.9% 偏紧，但现有证据不足以定量否决，更不能据此继续盲缩。
- 太和门照片中央两柱约 x=649、788，完整匾投影宽/柱间≈0.173；新模型≈0.220，旧≈0.287。照片中间开间明显宽于邻间，而模型九开间均匀，且柱列与匾不共面；这只是构图风险指标，不是可以直接相除的真实测量。
- 70% 工程下限绝不是历史证据，.7943/.7651 也不是从照片拟合得到的实测值。
- 整体体积三角形零相交采用父任务既有 static-after.json 结果；本复核没有重复该计算。
- 建议保留这一次候选作为明确标注的挂层修正，禁止将其描述成精确比例/形制验收。宽展雕框、双语书写、倾挂角、悬挂件和柱网/屋面关系仍待专门还原。

完整可机读数据、图片 SHA256、模型坐标及选边说明见同名 .json。

## 实际候选 CPU 立面与完整框图

- [坤宁局部整殿立面](visuals/kunning-front-local-cpu.jpg)、[坤宁完整框](visuals/kunning-frame-detail-cpu.jpg)。
- [太和门局部门楼立面](visuals/taihemen-front-cpu.jpg)、[太和门完整框](visuals/taihemen-frame-detail-cpu.jpg)。
- 只导出该建筑的实际生产三角，坤宁采用生产的 2.16m 楼面基准。明确是局部建筑图，不是隐去交泰殿后的全城视线验收；相机落点也不宣称可行走。未修改或隐藏生产世界中的邻殿。
- 两处近景均为相机 [0,1.7,-35]（相对建筑原点）、12° 视场的诊断放大；目标分别 [0,13.32795,-8.023] 与 [0,15.2055,-8.2282]。整殿分别采用 85°/95° 视场，全部 1200×900。其他相机扫描和屋檐的正常投影遮挡原样保留在 kunning-camera-scan.json / taihemen-camera-scan.json，不能只拿一条好视线概括全部视点。
- 两处完整框与实际全部结构三角均零相交。可见性、体积不相交、实景挂层、雕框形制是四个不同问题；只有前三者各自相应证据成立，雕框/书法/双语仍未复刻。
