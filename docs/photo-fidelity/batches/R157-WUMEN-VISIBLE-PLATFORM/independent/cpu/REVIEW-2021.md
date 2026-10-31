# 午门下层局部 CPU A/B 独立复核（2016 冻结）

**结论：这8张图可以作为同相机、完整已选下层几何的有限 CPU A/B 证据；不能作为完整午门、世界迁移、柱脚承压、真实入口、FP 或 GPU 验收。** 本轮未发现新的导出漏面或相机错配。几何原件2010的工程/建筑边界全部保留。

## 冻结、范围和真实输出

- 树 `r157-wumen-joint-layout-1622`，HEAD49b；600 个 src/data 逐 Git blob 无变化。`cpu-freeze-2016.json` 7路径和 `freeze-2010.json` 10路径全部精确。CPU exporter SHA `12d8885fa5a692011fc74c5001dce6e37b999750fd61d2cd5c933f850e5ab76f`；renderer SHA `77913cb06f3d4f685072facb8213aa9b67100ade7f54e62eac6414936d9d62e1`。
- `cpu-output-manifest-2016.json` 的26个输出全部逐 SHA 相同：2份PROOF、8个原始三角JSON.gz、8 PNG、8渲染摘要JSON。这里同名 `.json` 是渲染摘要，完整面原件在 `.json.gz`，不要混为一份数据。
- Before明确只选实际 `wumen-lower-five-portals`、`wumen-folded-ascent`、`wumen-south-three-canopies` 三个根；Ascent在实际树中为嵌套节点，未额外导出上楼。独立实际捕获为 **481 Mesh / 23316 三角**。After是隔离真实 U 候选一个根，**788 Mesh / 27000 三角**，包括187cells、12坡及保留的门部；无两个receiver试块。
- 独立重新遍历真实组件的每个实际 index/non-indexed 三角，对原始JSON逐行比全部 **world-matrix后的 XYZ、法线、base color、side、character=false**，before/after均精确相等。比较采用严格JSON序列化口径、无坐标容差；两边各882个JS `−0`正常序列化为JSON `0`单独记录，没有把非零差异抹平。
- 各mode四份原始JSON的完整三角列表相同，仅label/camera随视角变；四对 A/B 的位置、target、fov、aspect、matrixWorldInverse逐字段相同，亦等各PROOF和渲染摘要。PNG都是1200×876，其中800像素画面+76像素声明页脚；未单独缩放一边来冒充同相机。

## 导出测试与负控准确口径

独立新2项 **2/2，exit0，818.275401 ms**；作者末轮2/2，821.292993 ms。第一项真BoxGeometry单材质多groups应输出12三角，限制drawRange后2三角，隐藏实际祖先/材质后0；第二项把实际候选27000行与重新遍历真实全部三角逐字段比对。它不是bbox或首个material group的代理。

作者 `cpu-red.tap` 的0/2原红是“所需exporter不存在”的明确断言红，**不是本轮已有exporter被发现只导出首group的红**。这些历史与语义需区别。两次export、8图render均有exit0，PROOF仍accepted=false。

独立复算也保留了两次未接受尝试：首私有探针错误假设Ascent是直接子节点，0!==1早退；改递归寻名后，巨数组assert深差在终态exit137中断，不能计通过或产品失败。随后按JSON实际格式逐行紧凑比较，512MB上限约1.3秒exit0，输出上述全部精确结果。882个零符号正常化已实测；不将早轮137伪称资源根因已全面诊断，也没有改被审源码/测试/数据。

## 逐对亲看8图

| 同相机对 | 实际能看见 | 不能据此推出 |
|---|---|---|
| north-overview | 新旧U下层整体、翼体明显加长；新12段连续工程坡与平台扣接轮廓。新北边收缩及洞口轮廓在画面中。 | 未装上楼/亭翼后的整体比例、北五拱精确净高与连续通行。高机位不是立面测绘。 |
| court-overview | 两侧翼台长度/宽度差与内庭边，中央3口和两侧原门部仍在；旧横栏与新真实内庭边处理差异可辨。 | 白色大平面不是已证结构承台，不能确认全部门叶/帽细节或隐藏弯道。 |
| east-junction | 旧离散踏步/侧墙和新连续坡、回程/短颈扣口的几何形态差异，局部栏端点可见。 | 不能凭浅色相接证明微米级无缝、全足迹或亭入口；后者根本未绘。 |
| west-junction | 西侧自身的回程/短颈与新U接缝，非用东侧镜像替图；原跨翼横栏不再照搬。 | 不能仅从图认定安全代理、所有接触高度或FP停步。 |

After显著减少了旧踏步/侧墙表现而采用此前公开的连续坡工程体；这是真实候选形态替换，不应把“图更整齐”或三角数增加当作照片保真度提高。长翼完整显示在overview内；junction视角本来是局部裁视，不冒称全门。

## 保留的P1/P2边界

**P1（生产/建筑仍未闭合）：** 正楼、四亭、翼楼及横连上层均未参与8图，不证明任何真实柱脚承托；没有世界原点/南墙/阙门迁移，没有平台权威认证/真实FP路线。本地模型仍在组件local坐标，来源frame只是候选metadata；不能据同相机A/B把旧−419.6到新约−379.566的世界接入宣称完成。源图/OSM的不同层级、11点残差及未知亭口仍原样保留。

**P2（显示口径）：** 真实fixture材料多为默认白色，CPU只采base color及简化法线光照，不采纹理/alpha纹理、真实灯光/阴影、透明效果或GPU程序。因此alpha栏在图中表现为白色带，不能判断实际雕栏空隙；微缝、UV带形、真实装饰颜色须另验。声明页脚正确写局部下层、工程拟合及非GPU。renderer摘要的 `rasterizedTriangles` 是处理时产生像素写入的计数，不是导出总面数或最终可见独立三角的严格计数，不能据它误报漏面。

## 回执

本独立目录 `independent-wumen-platform-cpu-2017/` 保存测试TAP/exit、`manifest-camera-audit.json`、`actual-row-audit.json`及紧凑脚本/终态、初轮未接受脚本/exit、`terminal-audit.json`。8图逐张亲看，但没有重新重渲染。轻测槽已明确释放供下一只读承托审计；本结论只接受有限CPU证据身份和范围，不给予生产/完整几何验收。
