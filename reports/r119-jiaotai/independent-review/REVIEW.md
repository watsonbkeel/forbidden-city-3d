# R119 独立只读评审 — 图源、实际成品与收口

2026-10-27 04:12 UTC。评审无产品编辑、无 GitHub 操作、无并发全世界重建。

**结论：本轮限定的三组改动没有剩余图源／新增布局 blocker；可交根代理收口。不是整殿复原、全测试全绿或 GPU 视觉验收。**

## 最终绑定

- R118 before：`a20989ae9a74d6d2deb686bf1e76b6fc8d33b8f599918b66d8e5816cabd90333`。
- R119 after：`6f9a617a6f297c5dce35e68bd7cbabe4b203d1ae4af086a43dc62ea86a714786`。
- 两侧 `reports/r119-jiaotai/visual-final/export-*-high.json` 均有导出前后相同 fingerprint；独立脚本再核当前源码与 after 指纹一致，检查期间未变。
- 当前 HEAD `3d40ed95af8009b2bff6620cc3a5ed5236c5fa15` + 本轮 dirty runtime；独立 `verifyBuildSource` 校验 HTML/JS/build-info 同为 `R119-40255b98ed46`。`sourceDirty=true` 是这次检查的真实状态；后续 clean commit/build 由根／writer 另绑定，不冒充已检查。

## 图源与亲看范围

亲看官方正面、钟侧、牌／上屏近照及旧低清辅图；精确URL/SHA在 `reference-manifest.json`。[故宫建筑页](https://www.dpm.org.cn/explore/building/236467.html)支持基本布局，不提供本轮米制尺寸。缓存名 `interior-2` 实为牌近照，不是第二整室机位；URL年月不是拍摄日期。高清本次 web 直接抓取失败，使用有原官方出处且SHA吻合的本地真实像素，不伪称重新下载。

三机位 before/after 高档已亲看；最终 source-bound 六张PNG逐字节等于此前亲看的对应图。最终低档正面另亲看：主体与三组细节仍在，黄罩不是纯色回退。CPU z-buffer 读取真实几何与已准备图像，不等于 WebGL/PBR/阴影或字体验收；CPU 无中文字形不作产品牌文错误。

## 范围与纠偏

- **屏框**：保原屏尺寸、站位、牌相对外field宽 .44、下部铭文留白；仅上屏红金龙云示意色域、牌细边、上field薄框。没有小款／印章／全文伪转录。
- **藻井／悬件**：九个拟合profile、唯一悬球早已存在；本轮只加近景口沿与笼端环，不写成补缺失九层。旧datum、开口、far轮廓保留。
- **内檐**：仅西侧上部与既有中央承框；初稿“前向可见→南门perimeter”被独审指出并撤回。没有新四柱或东／北／南未知整排镜像。
- 独审指出整段4:1图域被横向压扁，writer以同材质横向UV重复修正；末图已消除整墙单幅拉长。纹样仍为原创示意，不能称精雕复制。
- R112未完成整殿分母、未见背面、精确尺度、历史目标时点／照片日期与罩下库存均未被本轮自动闭合。黄罩／毯纹理是既有成果，不重报。

## 独立实际三角／图像差分

`compare-exported-geometry.py --final` 直接检查实际 merged scene 两份序列化数据，不依赖新增件名称断言单独作证：

| 项目 | 实际差分与约束 |
|---|---|
| 可见选区三角 | 12,439 → 13,759；+1,330/-10，净 +1,320 |
| 新内檐 | 792 tri；minY 7.1700001；每个顶点仅西侧或中央框范围 |
| 口沿／笼环 | 480 tri；minY 8.428；旧藻井三角顶点保留 |
| 屏field／框 | +58/-10；全在旧上field包络内，F32边界误差 < 5e-7 m |
| 其他选区几何 | 原三角顶点位置全保留；不声称全场景所有历史穿插为零 |
| 纹理 | 旧选区图仅central atlas改变；8 cells仅2（牌边）/3（上屏）变化，其余6 cell及黄罩／毯真实RGBA byte-exact |
| 相机 | 三机位position/target/FOV/矩阵完全一致 |

新增投影体在高处、屏边留原实体包络，未引入新的低位通路障碍。writer 的真实控制器四门→钟漏→后绕→返回10/30/60与物理／钟漏／织物／开口保持门已有终态；本独审没有重新独立复播整个控制器，不把差分检查冒充全程body穿入清零。

## 资源与必要门的准确边界

- resident（含隐藏far）净 +1,320 tri、+1 mesh／material，geometry ArrayBuffers +126,720 B。
- 新atlas512×256：logical raw524,288 B；理论完整RGBA mips699,052 B。原central raw2,097,152 B／理论mips2,796,204 B另列，near/far/static共享单份，不重复计为三张图。GPU实际分配／JS heap增量未测。
- 最终相同来源的三对fresh成本：high median299.457→316.426ms，low290.081→295.431ms；少量样本，不声称提速或帧率。旧UV前样本保留而未混入最终值。
- 读终态并核来源：R119+R106 **19/19**；R118 **27/27**。高HD／低SD真实全区预建＋正常streaming均成功、单份新atlas、19个实际材质key合法。新增atlas同步归原初始化，不新增首访准备流程／未来catalog。
- 112个current-state文件 **1101 PASS / 188 FAIL**，该固定集相对R118历史189失败名无新增，R31旧接口问题已少1；**不是全绿**。另9文件专门旧交泰门21/7→19/9，有两项明确意图冲突（旧整殿mesh数与near藻井冻结签名），旧expected未改；不得藏进“无新增失败”。
- GPU、真实手机、浏览器生产帧率：**未验证**。

## 证据

本目录 `final-actual-geometry-difference.json`、`final-evidence-readback.json`、`final-build-readback.json`、`final-visual-readback.json` 与可重跑脚本；原始全图／成本／TAP位于 writer 的 `reports/r119-jiaotai/`。早期过程与边界纠偏另见 `INITIAL-SOURCE-SCOPE.md`。官方参考图不随报告重新发布。
