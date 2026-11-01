# R157 后右门高台宽坡 — 独立实用候选

基线5b83065fd660fa5f7c68e8cbfa5266aa779a80e1；仅后右门，不修改用户branches/main/Pages。

## 图源与明确工程取舍
新取得后右门自身官方group/cover及两张hotspot照片已亲看：高灰砖台、中央宽长坡白石栏，独立南槅扇（照片右侧浅色遮罩）与北赭色面板。来源原metadata见SOURCES；图像SHA见EVIDENCE，私图不随代码发布。不是以后左/中左镜像取代自身照片。
原RearAxisGate的三核心间单通道、柱网、门叶/背后横木、南北不同门面及屋面原几何完整保留，仅后右整组升1.8m；原15.2×6.4m铺地包络保留。原后左完整网格/物理逐字段不变。
新增高1.8m砖台、两面宽8m/长12m的封闭坡体与真实同面支承，白石栏板/简圆头和分段沿坡碰撞。南面照片支持主要轮廓；北面同坡是保持双向游戏通行的工程延续，不宣称北坡实测。全部高度、宽度、坡长、柱头简化及开叶状态是工程拟合，非历史测绘或现场开放政策。旧旁廊与横墙位置、墙原7m实体碰撞、门洞宽度及场景data不变；不扩编连廊、不补已拆乐器库。

## 必要验证
- 实际前驱完整World扫描两条拟坡体范围，零非本门collider占用。
- 新5项真实RED后实现；最终6新+9既有有效回归=15/15。旧回归中仅后右获准floor0→1.8/support0→3及相应身体高度、已实现坡栏metadata更新；闭门/贴框/南北不同面/实例/真实TextureLibrary合批与资源释放仍锁。
- 既有1项依赖98cfd572历史Git对象，在父与候选浅clone均缺对象，未运行通过；首16项13绿3红（2旧高度预期+1历史对象）保留，后续错误negative name-pattern未排除历史项的原红也保留。最终明确排除该历史项，不叫全套绿。
- 实际完整World32/32循环往返：24后右（3lane×10/60Hz×走跑×两方向）、4中右、4后左。总11087帧；后右峰|feet-ground|0.150333m、中右0.212778m、后左0。起点在新坡脚外真实地面z106.6/139.4，不在斜坡内凭空出生。两横墙cameraY6负例挡住，闭门与实栏挡住。
- 原所有门mesh顶点/位置XZ与旧物理完整保全且后右Y一致+1.8；后左逐字未变。无全局Collision/控制器/河界改动，无隐形救援面。
- /gugong/生产构建exit0，603模块（以build.log实际数为准）；sourceCommit5b且dirtytrue是提交前本次源码，不冒称clean。metadata/fingerprint见build-info。旧chunk大小提示保留。

## 视觉与边界
views四图为同相机实际后右门+原相邻横墙完整三角的CPU诊断平色，亲看高台坡栏明显改善；不是真实贴图/GPU/手机截图。不称整37项用户验收，旧试玩ZIP未含本次；无需据此替换用户branches或部署。

## 命令与回滚
node --test --test-concurrency=1 --test-skip-pattern='Rear-gate historical' tests/r157-houyou-high/component.test.mjs tests/photo-fidelity/batches/rear-axis-gates.test.mjs

EVIDENCE_OUT=/tmp/houyou-world.json node --max-old-space-size=1024 --test tests/r157-houyou-high/world.test.mjs

VITE_BASE=/gugong/ npm run build

回滚保留原5b开发分支和此前累计包；不修改main/用户branches。
