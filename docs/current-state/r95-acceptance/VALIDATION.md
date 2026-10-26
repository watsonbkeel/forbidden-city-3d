# R95 验证与交付边界

本地累计开发候选，尚不代表main或Pages已更新。基底R94 local c6a2a287 / remote736fb6c4；用户main c32e6d44增加的R88报告fingerprint已原字节纳入，初始index树精确等main 8424ec5b。不改建筑/山体/通行、人物数量/位置/造型、账号或main。

## 确证修复：人物首次显示

用户低档储秀宫108注册/32加载/2可见/76准备/0失败，独立旧源码第420帧复现。根因是FIFO先准备远角色，低档仍先备全部LOD、睡姿、行走姿态。设置菜单不暂停main.animate的人物更新；document.hidden才暂停/取消，恢复会重排。

- 当前相机附近任务在作业边界优先；每第4次给最老任务，在途生成器不抢占。每帧名义1ms与最低进展预留.25ms未增大。
- 初绑定先备当前基础LOD2；座位仍额外保留原LOD0精确物理接触指标。实际需要的细LOD/新姿态进入同一有界队列。只允许同姿态/同座位/同走路身份的已备LOD暂显，不以站姿代睡姿或标准座代乾清低脚座。
- 无资源时不作同步几何构造。实际提交集合用于近人物动态碰撞；初稿隐形碰撞独立RED已保留、修后GREEN。玩家占位时不会在资源完成后生成人体包住玩家，等玩家退出后正常恢复。
- 15/30/60Hz模拟与独立完整世界检查：日夜、皇帝夜座/返程、画质/开关/hidden/地图快速切区，无错误和缺资源同步acquire。独立稳定窗口全108ready、queue0；仅加载附近区域时78ready/30待区域不是丢人物。34实际batch几何各dispose一次，pool/root/dynamic归零。

## 清场五轮配对（CPU，不是实机秒数）

同机交替次序、30Hz模拟dt、真实冷区域/CharacterSystem/InstancedMesh；原R94对本候选。宫女首实际提交370–503帧→38–99帧；后妃339–449→70–147帧。不要用这些帧数推称用户设备准确秒数。低档同场景缓存42→14项。

冷段p95原1.068–1.185ms，新1.056–1.182ms。稳态p95原0.478–0.768ms，新0.857–1.038ms；配对中位增量 **+0.240ms**。新稳态p99 2.743–3.204ms、max2.893–4.848ms，所有轮次保留。近处首显显著改善不等于全面CPU提速，名义1ms不是硬实时保证。完整数值见 `reports/r95-acceptance/characters/paired-performance.json`。

## 验收账本

- 新机制/公平性/资源错误/隐藏恢复/近处占位专项、独立RED及生命周期见 `reports/r95-acceptance/characters/`。
- 人物相关109项：100通过，9旧合同失败；同9项在冻结R94原源码重跑失败：旧夜间UI措辞1、旧38/96人数预算3、R51旧造型/脚接触合同5。未改旧expected以冒充全绿；原日志和对照保留。
- 武英当前合法起点/实际出入16场景，9/9。原zone-lint脚高0两报警日志仍保留，不能据此重做建筑，也不推广为全园零缺陷。
- 当前1290套最终1127通过/163失败，与R94原失败名称多重集精确一致，无新增/消失。独立R89/90/92/93累计185/185通过（48/11/116/10），绑定19fc7c56，未知运行差异0；最终构建及包身份见下。首次稀疏工作树少旧HOOKUP.patch使1289套/1126通过/163失败；已取原Git blob补齐，不篡改fixture。补齐单模块40项39通过/1原身份失败。
- 163旧失败118身份/保留合同待迁移、7夹具、38待核；是分诊不是结案，所有失败完整名称/证据保留。另716中止历史输出未穷尽。

## 能力与后续

用户main官方CI Node20.20.2构建/Pages部署成功；本地测试Node24.19.0，非本地Node20通过。线上R94-44444072f87e的HTML/JS/CSS/build-info一致；云Chrome因WebGL Disabled无法进入3D，实际网页交互、手机GPU与用户设备首显 **NOT_RUN**，没有绕过环境限制。

R96炕沿普通退步确证缺陷、R97 Garden约374→556ms重建回退、R98后侧/承托墙与R99–105仍在计划，不宣称前面全部需求完成。原用户截图仅留本地诊断，未纳入公开文件。

## 最终构建与本地包

构建输入提交 `4d9aa8562238bd121f8682b72696f835bc4d65d4`；干净输入fingerprint `308372f2c3182ef8b54c449136ead371a95d80b25d8e1eb4050657a24103e8af`。后续证据提交不改这些输入。

三个全新独立outDir串行构建，避免emptyOutDir=false的历史残留：
- 根路径 `/`：`R95-bfdc13746f45`
- COS兼容路径 `/gugong/`：`R95-e5600a4975db`
- 实际Pages配置 `/forbidden-city-3d/`：`R95-54af856dc658`

每份137产物逐字节HTTP通过，133 public文件/31 GLB/6内景模型及decoder相对路径核对；不是浏览器执行或远端部署。Vite大chunk警告保留，未通过改warning阈值藏掉。

根路径预构建包139文件、42,176,584 bytes；manifest SHA256 `011bffd5aa22ae10a8412ec6b95ed86b649dcd5bb354b4f03a78f2365516d089`。本地启动器身份/HTTP与全139文件hash测试2/2。准确产物检查见 `reports/r95-acceptance/artifacts/`。没有替换main、触发Pages或将此本地包说成用户实机验证。

## 复跑入口

- 机制：`node --test tests/r95-character-*.test.mjs tests/r51-preparation-progress.test.mjs`
- 台账/武英：`node --test tests/r95-ledger-contract.test.mjs tests/r95-wuying-current-routes.test.mjs`
- 实际世界生命周期：`node scripts/r95-acceptance/character-demand-verification.mjs 15 low`（也可30/60与high）；不是GPU脚本。
- 五轮配对：`R95_BASELINE_ROOT=/absolute/path/to/frozen-R94 node scripts/r95-acceptance/character-paired-performance.mjs`。基线应为c6a2a287源码并备相同依赖，双方不并行跑重负载。
- 包：`R95_PACKAGE=/absolute/path/to/r95-production-package node --test tests/r95-package-launcher.test.mjs`。
- 全当前套：`npm run test:current-state`。预期保留163红项；它会重写部分旧reports，须另存本次证据并恢复原历史blob，不能提交覆盖。
