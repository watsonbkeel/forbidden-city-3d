# 西井亭来源及预检
原文 FC-1FD92C0BD2 / MASTER:637；安全父1b5adc79。不纳入花园33714086或三友4fe00b8b WIP。

## 实际读取证据
- https://www.dpm.org.cn/explore/building/236499.html ：位于天一门外右侧、千秋亭东侧，面阔1.94m，方形四朱柱，四斜担梁与四悬梁转八方，黄琉璃八脊盝顶，正对井口的八角露天洞口、四对合角吻、海墁斑竹彩画、石栏、云龙望柱、井周泄水沟及横木滑轮。
- 实看官方 https://img.dpm.org.cn/Uploads/Picture/dc/3958%5B1024%5D.jpg 922×1024全貌；可见方台基、四柱、八角檐、近侧石栏与圆形浅色盖台，树遮顶中心。不可用被遮部分声称看清细雕/洞口。
- 实看 https://img.dpm.org.cn/Uploads/Picture/dc/8026.jpg 担梁/檐口；https://img.dpm.org.cn/Uploads/Picture/dc/8018.jpg 竹节状椽面。不是东井花草苏式彩画；独立低分辨率竹节纹理仅简化拟合。
- 黄希明《御花园井亭》官刊p24 https://img.dpm.org.cn/Uploads/pdf/2206/T00024_00.pdf 已亲阅单页扫描。每面面阔194cm、柱高243cm共同叙述，柱径东28/西24cm分别标注。该页照片为东井，不冒用为西井照片。**旧东井RECON末段“West 2m/.24m”中2m是误读，本次纠正为1.94m；柱高2.43m标明来自官刊共同叙述。**

## 独立定位
官刊园图 https://img.dpm.org.cn/Uploads/File/2024/07/22/u669dd30a7f61c.pdf p4/index3，PyMuPDF clip(115,73,503,362),Matrix3→1164×867。19MB PDF只在内存读取，磁盘仅小裁图。六锚同东井RECON：天一(585,469)、万春(1014,415)、千秋(145,410)、钦安(585,233)、浮碧(1017,178)、澄瑞(143,185)，对应原模型锚。
仿射 X=-.122770047u+.00350261342v+70.7374591；Z=.0004950426u-.117287935v+519.824499。独立作者与只读复核均识别千秋亭东南小亭符号(278,480)，结果(38.28864,463.66391)，采用(38.3,463.7)。拒绝旧疑似点(125,600)：其在千秋西南且近山石。六锚残差.12–.56m，人工±3px≈.36m，整体至少±1m拟合误差，非测绘值；不据此任意挪锚求通过。

## 物理预检与局限
safe parent全高区域[32.45,44.15]×[457.85,469.55]只有1个旧GardenBuilder树碰撞[39.303817,0,460.252143]–[40.903817,3,461.852143]。真实树干实例5在(40.103817,.3,461.052143)，高度11.376m，冠高14.012m。总体核心盒命中50树干三角，**不是50个屋面交叉**；hitBounds是全三角顶点界不是交点界。旧床面y.29与石边x37.4–37.7确实穿核心，必须裁剪可见源而非藏入台基。
以移置东井屋面仅作早期拓扑关系代理，屋面/树干线段三角交点0，屋顶.1m网格站立身体接触0；这不证明西井设计或动态安全。新候选必须实测所有物理源、跳跃/下落、原树真三角和两侧通道。34树的原随机序列/矩阵不得改变。

## 明确非复原/未验
屋盖半径/坡线/开口大小、台基/栏尺寸、覆莲及琵琶栏精雕、云龙和吻兽、隐藏栏闭合与入口、圆盖隐藏底面、排水槽和横木滑轮尺寸方向均是中性模型拟合；没有深井/水面/绳索事实断言。完整模型工程外壳≠整历史对象验收；GPU视觉、帧率与真实设备性能待验。

### 动态发现后的严格范围
32例真树干动态测试13例地面接近穿透（CM报告free），source triangle 12/13/19/20/36/37等；16屋顶预置无命中。不是声称新亭制造了所有旧树缺陷，而是新增铺装通路必须闭环。仅该确定树的旧低AABB替换为完整既有树干实际实例F32三角；34棵树可见buffer、实例矩阵及随机消费均不改。冠叶保持原非实体，不添加树AABB顶面或隐形护栏。此修改不扩大严格运动域，但树源完整bounds延伸域外，需追加树域边界/非目标路线保留验证，不能用专项绿替代整区安全。
回滚单位是整次源码提交及所有挂钩，不是单独删除westWellProfile；GardenBuilder局部床裁剪和该树源适配属于同一原子版本。当前不承诺运行期profile独立关闭开关。

### 后续复现结果（仍非最终验收）
树源补齐后32例同样运动从13个命中变为0，原复现保留tree-motion-before.*。复审定位域外枝顶合法预置(40.71662267,458.56175741),脚高11.37623787；实际World10/60Hz落体和向北交接4例无穿透，不能把分派风险推测写成已证失败。保留严格域不扩，继续四向/跳跃验证。首轮原子红测因深对象失败诊断SIGKILL（未并发），已改成数组长度及对象身份短诊断，两个真实失败再现后修复为重复预检与晚失败局部回滚；没有删失败日志。

### 整树包络闭合修正
四向高位扩测16例发现4例树枝步离真实穿透，保留tree-boundary-extended-before.*，其中10Hz向+x frame1脚11.2362命中triangle773。此后才批准工程上扩为整亭+这一个原树共同小域，而不是提前把预置风险称为已证可达。
安全父新增包络全高普查[32.45,47.25]×[456.45,469.55]仍仅原同一树，无其他建筑owner。严格域改[33.7,46]×[457.7,468.3]，完整原树bounds再加.6m全被包含；实际可见铺装/裁床同改[34.3,45.4]×[458.3,467.7]，右端到原床边，南端到原床起点，避免把树源跨缝或把旧高床埋在新地面下。没有加新的不可见地面；该铺装是现代模型通行拟合，不称历史铺地测绘。新旧原树矩阵/所有实例buffer必须保持相同；其他physics只允许该原树一项例外。

### 2026-10-29 resumed independent verification
- Resumed without resetting any WIP or moving the fixed official-map fit. No production algorithm changes were needed after the already-present bounded combined pavilion/tree-envelope repair.
- Fresh original 32-case true-tree motion replay: 32/32 without triangle intrusion (`resume-tree-motion.log`, `tree-motion.json`). Fresh 3-second high-branch replay: 16/16 legal starts and no intrusion. This short probe targets a fixed point 3m from the start: it does **not** establish terminal exit, especially +Z where it turns around near the target.
- New `tree-boundary-terminal.mjs` holds a cardinal heading relative to the current position, checks each frame against the unchanged tree's exact triangles, and asserts legal starts, zero intrusion, and grounded completion outside the tree's full horizontal bounds plus .6m. All 16 cases passed at 10/60Hz, with/without initial jump; terminal feet 0 or the visible paving .04m. `tree-boundary-directed-terminal.json` records endpoints. The separate 15-second fixed-target diagnostic is retained and explicitly not counted as exit coverage.
- Expanded visible paving invalidated the old south route fixture's foot=0 start at z457.9 (radius .5 already overlaps the paving starting z458.3). Start moved only to z457.6, outside the real paving. All 32 two-way bypass walk/run/jump combinations passed with unchanged per-frame source-intersection and final grounded assertions. No anchor or production geometry was moved for this test.
- Serial combined candidate/east-well/terrain/shared-roof/stair/input regression: 250/252 passed. The two failures are the east-well historical *whole-garden equals old parent* snapshots: new west profile and the explicitly retained single-tree physics replacement violate their no-subsequent-additions assumption. Safe-parent replay of those exact tests passes 2/2. These remain visible failures, not silently rewritten tests. West-well's current-parent retention tests pass, including 34 original tree buffers/matrices, all other physics, non-ground geometry and material/height/UV samples outside the bounded cut.
- Full current-state aggregate and root production build are being checked separately; their results belong in the verification receipt. No GPU/real-device visual or performance acceptance is claimed. No deployment or main modification.
- Neighbour replay completed: `world-parent.json` and `world-candidate.json` contain 96 real-controller trajectories over six retained lanes (x48, x17, z472.1 cross-lane, Qianqiu south, Tianyi west approach, Yangxing north), at 10/60Hz, walking/running, jumping/not, both directions. `world-comparison.json` verifies every frame hash, final position, legal start and arrival flag identical. 72 reached their target, 24 were already non-arrivals in the parent; all 96 starts legal. This is exact retention, not an assertion that the old 24 routes are usable.
- Terminal tree test wording is deliberately **outside the tree envelope**, not outside the strict motion domain: two westward non-jump cases land on the visible .04m paving while still inside the larger motion region.
- Full current-state completed: 1331 tests, 1113 pass, 218 fail. Every one of the 218 failure names was reproduced by read-only safe-parent replay (216 direct files plus 2 tests imported from r138/r139). 211 initial error bodies match; 7 already-failing R32–R35 historical source-hash guards have different current hashes because this candidate adds ZoneBase/Collision/world hooks. `aggregate-parent-final-comparison.json` enumerates those seven; this is not a green aggregate claim. Large raw failure logs remain local, with SHA-256 and size recorded in `verification-resume.json` rather than bloating the small-file checkpoint.
- Root Vite production build passed: 503 modules, 5.42s, temporary output `/tmp/west-well-resume-build`. No deployment, no main modification, no GPU or real-device acceptance. The six old tracked r104/r58 report files regenerated by regression remain unstaged, as do unrelated Yikun WIP files; no reset was used.
