# R92 保和殿东侧墙门与露台联合校正方案

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task. Checkbox steps are verification gates, not permission to invent source precision.

**Goal:** 在已授权联合范围内消除通用窄台与实照长墙的冲突，不复制东照片到西边。

**Architecture:** 独立 BaoheEastTerrace profile 管理东侧三级边界，墙门 profile 消费该边界；PalaceBuilder 仅改变保和段负 X 边，不改变全局 margin/setback 或其他殿台。轴院地面外墙的内端同步截短，防止旧墙埋进新台体。

**Tech Stack:** Three.js、Node test、真实 CollisionManager/PlayerController、已有 CPU/浏览器诊断。

**Spec:** 用户 12:01:07 同意墙门与东侧露台一起核对校正；12:03:33 允许内部确认后直接实施。父要求内部审图后再作重大几何。

## Global Constraints

- 唯一基线 `r93-qinzheng-tables` local `9cf1460148124b56a9d485197f7f2af4d24dd312`；新 worktree `r92-joint-east-terrace`，旧 R92 失败试验完整保留。
- 不碰 main/Pages/远端。冻结前由父独立审查。
- 不移殿、不改室内/台明、不镜像到西侧、不碰未定位 FC-0D3F161564 廊内拱门。
- 保留北向御路台阶及中和东西登台路线、R88–R93 已通过内容；此次不是整座三台测绘复原。
- 原图只作私有证据，不入运行资产/生产包。

## Review Focus

1. 历史图的台边/栏杆线不等于2026实测；先核图尺及柱网交叉尺度。
2. 新东边不能通过对称 `hw` 同时扩西边；西侧几何/碰撞须保持。
3. 旧外墙17在扩展台体中的部分必须移除，不能藏在台里制造碰撞墙。
4. 门口必须两侧真实地面同高、无栏杆/包围盒封口；不能仅视觉通。
5. 北阶保留与扩台横向接头必须无洞、无重叠挡墙、无悬空行走面。

## 一、已核来源与置信边界

### 1941历史平面图（此次新核的重要证据）

路径 `r58-a-three-halls-review/private-refs/baohe-1941-plan.jpg`，1920×1334，343413B。
SHA256 `f37851bb97460fd81e72bc1f679524468d8c95af3ca910789c49c97d70242ecc`。
原地址 https://file-pano.dpm.org.cn/hotspotImage/2026/06/25/b1ced0e6c4924342bf1d7cfb86b47788.jpg 。目录日期不是绘制日期；图签民国三十年八月，历史1941。
已用 view_image 原像素检查。图上南、下北：减柱前部在上、宝座后排在下；因此图左为东、右为西（原草案曾误写右侧，独立审查已纠正）。必须按左侧取东台边，不能因大致对称而取另一边。
图有公尺比例尺、三级台边、栏杆柱、横墙、殿柱网。东上层台面明显不是当前殿边3.55m窄条。尺度以公尺图尺与可辨尺寸标注为主；现模型49.7m与图纸柱跨不一致，只用于差异检查，不作为独立尺度。需；扫描缩放、纸面变形、栏杆与结构边缘区分产生误差，不能报告厘米精度。
独立复读图尺后初读区间收敛为：中轴至东上层约53–55m、底层约64–67m。此前54–59/65–71混入以当前模型柱宽归一尺度，已撤回；不得采用上限59/71。现区间仍是人工读图的候选包络，不是统计置信区间或现状实测。必须经独立像素复核后才选择工程控制点。

### 2020官方文章所载同侧实照

`r58-a-terrace-links-review/sun2020-p6-baohe-east-crop-private.png`；官方 PDF https://www.dpm.org.cn/Uploads/File/2020/10/23/u5f9255173a228.pdf ，PDF p6/刊p55。
已重新实际看像素。支持：殿接长上段墙—段中小门—外端显著跌落—较低外墙。整个原照片仅854×259像素；不可由此直接量门宽或唯一求解相机。它对历史图的宽露台关系提供定性互证，但不证明历史图每条边和现状完全相同。

## 二、前后预期位置（候选，不是已完成结果）

| 控制 | R93实际当前 | 联合候选目标 |
|---|---|---|
| 殿东红墙面 | X=-25.3 | 不变 |
| 东上层台边 | X=-28.85 | 历史图注册包络 X≈[-55,-53]，内部审查后定工程值 |
| 东中层台边 | X=-34.3167 | 独立读图，再检验是否兼容现5.4667层退，不默认强制 |
| 东底层台边 | X=-39.7833 | 包络 X≈[-67,-64] |
| 小门 | 运行版本无该补墙；已撤试验中心-27.075 | 位于长上层墙中段且两侧台面8m；其站位/宽高需照片注册，不直接沿用试验 |
| 外墙17内端 | (-40.5,123) | 截至新底层外端，保持后左门(-76.4,123)和外侧终点 |
| 西侧三级边/殿内 | 保留基线 | 完全保留 |

关键现状来源：`src/scene/PalaceBuilder.js:buildComplex` 的 `w/2 + margin` 给保和28.85，其中margin=4只是通用建模值，不是保和台基测量。`buildTerraceUnion` 默认对称扩边，不能直接只改hw。

纵向限制：历史图北端与当前Z167.0667/178并未注册相等。此轮拟保留既有北阶和纵向控制，仅修东翼宽度；这一兼容处理必须公开标为未完成整台测绘。若独立审查认为它使新东翼无法保持可信拓扑，停在诊断，不通过任意折线掩饰。

## 三、任务与验收

### Task 1 — 来源注册（先于运行改动）
- [ ] 记录图尺端点、至少两组柱轴、三级台边的人工像素窗口与方向；用两种尺度计算区间，交独立reviewer核对。
- [ ] 用同侧照片标记殿接点、小门两边、上段终点；建立透视/控制不确定性，不将画面线性比例伪装成米。
- [ ] 父内部确认候选东翼平面及墙线；保存同相机实际before与诊断候选after并注明未上线。

### Task 2 — 东翼与外墙协调（RED→GREEN）
Files: create `src/scene/palace/BaoheEastTerrace.js`; bounded modify `src/scene/PalaceBuilder.js` and explicit axis wall17 builder binding (inspect actual consumer first); test `tests/r92-joint-east-terrace.test.mjs`.
- [ ] RED: production geometry exposes registered asymmetric east tier edges while west/current north stairs remain identical; existing baseline must fail east bounds assertion.
- [ ] Minimal: explicit per-tier east bound, coherent solid/deck/walkable/rails. No duplicate overlay slab. Preserve other rects and support heights.
- [ ] GREEN: actual geometry bounds, no embedded oldwall17 span, retained gate gap and north stair traversal; guards against wrong hall/index, NaN and double invocation.

### Task 3 — 墙门（RED→GREEN）
Files: create `src/scene/palace/BaoheEastFirewall.js`; bounded production hook; test `tests/r92-joint-east-firewall.test.mjs`.
- [ ] RED: long upper wall/real door aperture, registered stepped silhouette, joins to hall and external wall; production omission must fail.
- [ ] Minimal: independent Baohe profile consumes approved tier bounds. Coping does not blindly equal ground+fixedheight unless registered. All doors have physical jamb/lintel solids, no full-opening box collider.
- [ ] GREEN: 10/60Hz walk/run both ways, lateral door-edge sweeps, support before/after, no escape/drop/trap, gate and both existing stair routes.

### Task 4 — 累积验证与独立审查
- [ ] Re-render same before/after overview, small gate, east edge/north join; inspect actual pixels. Match source silhouette and disclose unresolved camera/era precision.
- [ ] Run focused Baohe retention, R32 terrace routes, R86 firewall and R88/R89/R90/R93 retention; aggregate project regression, complete node test set with named historical failures, dual-base builds (root + existing Pages base), production package proof only after parent release instructions.
- [ ] Independent review owns actual production support/collision probes and source fidelity. No green geometry tests presented as fidelity proof.
- [ ] Parent authorizes freeze/identity/remote only after evidence review. No standalone R92 release identity now.

## 邻接与实现细化（12:08，待独立尺度结论）

- `data/zones/axis-courts.json` item17由`ZoneBase.buildWall()`直接消费；最窄改动是只改其from[0]，不改通用ZoneBase。最终端点与profile必须有一致性测试，避免配置/几何两份数值漂移。
- item16后左门中心(-76.4,123)，item17外端(-106.47,123)；item31长廊中心线X=-103.37至Z122.5。东底层64–67m仍与门中心有9.4–12.4m名义水平间距，但必须减去实际门楼宽/台座验证，不把中心距称净空。
- item20内左门(-62.4,203.85)，item21横墙Z203.85，保留北最外边Z178有25.85m轴向间距；只改东宽并不直接相交，但真实mesh/collider仍须检查。
- 北阶函数`buildBaoheNorthTier`消费对称halfWidth；不得将东扩边以更大halfWidth传入（会动西边）。建议保留原北阶返回物，东侧增加同一层台面的边界延伸栏杆，且不能留下旧侧栏杆穿过扩后台面。主台体用明确minX/maxX与中心偏移构建，不加重叠浮板。
- 三级高度2.6667/5.3333/8和目前5.4667退台只是既有工程值；若图尺三级台边区间同时容纳，可作为保守兼容拟合，必须标注不是读图精确值。
- 北端Z保留会形成对1941平面非忠实的兼容延长；图中南北尺寸暂未重新设计，禁止把整个台基标为已精确复原。


## 内部审阅用具体候选（12:09，非实测精度）

采用图尺支持的东上层半宽53.6m，保留现工程退台5.466667：三级东界（低→高）`[-64.533333,-59.066667,-53.6]`。对应西界继续`[39.783333,34.316667,28.85]`，不对称是此次修复范围边界，不是断言真实台基不对称。高度和Z范围保持基线。

外墙17内端拟从X=-40.5截到-65.25；保留原底边至内端的0.716667m连接余量。实际后左门mesh（含屋檐）X[-81.516251,-71.283749],Z[119.562869,126.437131]，新底界至门檐6.750415m；外墙新内端至门檐6.033749m。此是运行几何净间隔诊断，不是原址尺寸。

来源门上段图像控制（仅待相机校正）：现存750×500裁图，墙接殿约(473,284)、上段外端约(648,315)、门中心投影约(543,330)，门顶对应上沿约(543,297)。投影约在上段前40%；不能直接转世界线性40%。拟先在X[-41,-34]范围诊断，以X=-37作为明确工程试验起点，而非从源测出的最终位置；门宽高另列工程量，先证明1.6×2.6m可用，再按同相机真实图片审核。不得使用测试通过替代图像注册。

最终接受前需内部确认这组兼容边界及门口拟合。当前只有before实景导出，无运行源码改动。

## 实施采用结果（取代早期均匀退距候选）

独立确认东侧退距顺序上→中5.11、中→底5.55，父内部通过；实际采用东界上-53.6、中-58.71、底-64.26，外墙起点-64.976667。未采用早期均匀5.466667候选。运行与限制见docs/current-state/r93a-baohe-east/VALIDATION.md。
