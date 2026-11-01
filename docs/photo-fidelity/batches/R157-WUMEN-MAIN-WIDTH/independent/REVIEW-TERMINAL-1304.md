# 午门正楼 1.43 有界柱网候选：恢复环境终态独审补充

2026-10-31 13:04 UTC。只读审核；本人未修改生产或仓库 QA，未运行重 World。本次补充不覆盖前两份已发报告：`REVIEW-COMPONENT-1203.md`（SHA256 `018173858fd277aa19718d72e71c2a4c4473ba2a77f0a362cfad4c5e6201529d`）及 `REVIEW-WORLD-1216.md`（`ba15fa78d327005bf7082d9ec0cbe60f70a42829264159afcc870d692d94f025`）。

## 结论先行

**可作为有严格范围和已知缺口的开发候选保存；不能称完整门禁全绿、完整浅克隆 QA 可移植、已发布或午门整项完成。**

- **P0：未发现本次新增的阻断级生产缺陷。** 已审核的统一 10 轴、88 目标几何/实体 collider 变化及非目标保全结论保持；源码仍仅原 3 文件改变。
- **P1：完整 batch 缺历史对象，尚未闭合。** 92 文件请求的实际终态为 **524 记录 / 514 通过 / 10 失败**，不是预期完整执行的 554；**38 条旧标题本轮未执行**。不能用新专项绿或构建成功替代这些缺失断言。
- **P1 跟踪：原 current-state 有 3 个旧水平合同由绿转红。** 清源与候选同环境完整 A/B 已证实只变这 3 条；其旧等距坐标/旧小于 3 米阻挡阈值与批准的新柱网冲突。已有有界几何合同和新的南排真实组件路线承接，但原 117 文件一字未改、原红保留，**全套仍为 213 红，不是 210 红不变**。
- **P2：工程拟合与图证边界不变。** 1.43、八个侧跨等宽及保留 60.05 米包络是有出处的简化拟合，不是逐间测绘或已测柱心总距；本轮不完成全部柱网、通天柱、门窗或午门整楼。CPU 为有限 base-color 诊断，不是 GPU/现场照片逼真度验收。

## 1. 冻结和恢复身份

树为 `r157-restored-411214`，HEAD `411214d091723b3a5078bbb9499321c2c5c3d354`，本次生产候选仍是该 HEAD 上的 dirty 3 文件。独立核验 `source-freeze-1210.json` 的 **590** 个实际 src/data 路径及每一 SHA，全部相符；原 587 文件不变。三改动仍为 WumenMainGrid、GateTowerProfiles、GateTowerMeasurements，没有增加默认 hook、屋顶/台基/门叶或全城坐标修改。

最终 `qa-freeze-1259.json` 的 **4334** 个实际 scripts/tests 路径及全部 SHA 相符；相对 1210 的 4333 项，仅新增 `wumen-main-width-south-strip.test.mjs`，无旧项修改或消失。独立结果为 `final-freeze-focused-1303.json`。

恢复后的清源树 `r157-width-baseline-411214` 的 590 个 src/data 常规文件完整路径集合、字节及 Git HEAD blob 全相符。两树原 current-state **117 个文件**均逐字等 HEAD，未因候选而改断言。正式 A/B 前另核 **149 个补齐输入**：candidate = baseline = 原 HEAD Git 字节。最初缺 sparse 输入的首轮日志保留，不拿它代正式完整输入结果。

旧环境的完整 full-main/qinan/zhaode 原 TAP 曾被远端备份明确省略，本次没有声称找回它们。下列基线是**恢复后重新跑的 411214 清源基线**；新的双方完整 Counter 与原始 TAP 均存证。

## 2. 原 117 文件完整 A/B：恰 3 条变化

我逐个读取双方三份原 TAP、resource 的 cwd/命令，并独立重算全部 1313 条 `(状态, 标题)` 多重集，与作者完整 Counter 逐项一致：

| 阶段 | 清源通过/失败 | 候选通过/失败 |
|---|---:|---:|
| main，1190 条 | 981 / 209 | 978 / 212 |
| Qinan，48 条 | 48 / 0 | 48 / 0 |
| Zhaode，75 条 | 74 / 1 | 74 / 1 |
| 合计，1313 条 | **1103 / 210** | **1100 / 213** |

全部 0 skip/cancel；没有其他标题增删或状态变化。独立完整结果：`final-full-ab-independent-1247.json`。

3 条 `ok → not ok`：

1. `Wumen outer columns retain horizontal axes and radius parameters while approved heights change`：要求旧 x=-23.352777…，实为新 x=-23.657025…。
2. `Wumen column count, plan, radii and horizontal tessellation remain fixed`：同样直接锁旧水平坐标。新严格合同已逐对象核柱数、半径、全部几何及授权 X 差异，非把这些约束一起放掉。
3. `Wumen south outer strip stays blocked at actual eave columns`：固定南排横走仍要求 reached<3。最近柱心已由 3.336111…移至 4.553101…；仅该旧数值失败不等于新柱失去碰撞。下述独立后继验证了新实际接触位置。

不能把这 3 个红从原 TAP 删除、换标题或直接计成通过；它们是明确记录的有限合同迁移事项。

## 3. 南排补验证：本人的 8 绿 / 8 旧源红

对正式路径独立运行两次轻量命令：

- 当前候选 **8/8 通过，exit 0**：`south-strip-current-independent-1302.tap`。
- 同一测试加已审旧三源码 loader：**0/8 通过、8/8 失败，exit 1**：`south-strip-old-source-independent-1302.tap`。不是只看作者负控或测试名。

8 种组合是 10/60Hz × x 左右两方向 × 走/跑，使用实际 FirstPersonControls 和实际门楼 raw CollisionManager。共 **840 帧**逐帧核身体无碰撞穿透、脚高 12.3、无侧向逃逸；另验旧轴 clear、新轴 solid。末点绝对 x 为 **3.407606–3.623974**，独立旧金样变换后的接触边界为 **3.632751817**；全部超过旧 3 米阈值，又停在新柱外，不是手动写玩家终点。低帧率允许停止在接触面前，不能把这一窗口描述为精确贴面测量。

**计数澄清：此前 24 组合是北排、x±两侧，不是南北两面。** 它们已有组件和实际 World 两层验证；本次新增 8 是**南排组件 raw controller**，未冒称新增 8 次全 World 回放。原 World 24 与组件 24 也不重复算成 48 个不同场景。

作者最终 10 文件专项原终态 **55/55、exit 0、48.656 秒、RSS 1702472 KiB**，包括实际无注入 World 再跑、6 个新宽轴文件及 4 个旧消费者。已核原 TAP/命令/冻结；其中 47 条与原 batch 重复，仅 8 条南排是新增，不把 55 全加到累计分母。

## 4. 92 文件 batch：缺史导致的真实红与缩分母

原命令 `batch-command-1220.json` 请求 92 个文件，实际 `batch-1224.tap`：**524/514/10，exit 1，0 skip/cancel**。本人重建前驱完整 526 Counter（持久的 515 Counter + 已记录 11 条增量，不冒称旧 TAP 被找回），再独立比较本轮：新增 48 个状态标题记录、消失 50。

精确分解如下：

- 已审历史迁移：原 **10** 个顶层历史标题由 **4** wrapper 替代；其原字节子测试仍按 5+2+2+1 严格运行，不重复计顶层。
- 新宽轴的 **34** 个顶层测试本轮实际通过。
- **38** 个其他旧标题因加载旧对象失败而未执行。
- **8** 个失败是 file-level placeholder；另 **2** 个是已经执行到旧 Git 读取的具体历史保全测试（rear-gate、Xiehe west-end）。两者原 `ok` 变 `not ok`。
- 所以 `526−10+4+34−38+8 = 524`；这只是分母解释，不是对未执行 38 条的通过判定。

独立完整结果与分类：`batch-terminal-independent-1300.json`、`batch-missing-history-classification-1303.json`。缺的直接旧 ref 共 10 个：`66fd5710`、`3dcafeb6`、`f88dc035`、`98cfd572`、`fde9a95b`、`064ecb27`、`e14c61911844e7aa6ce7c0251e64fd0ad61e67f4`、`d2592770`、`6ffd4ebc`、`9e17ef00`（最后对应 ZhaodeGate/ZhenduGate 两模块）。这不是本次午门源断言的物理回归结论。

我只读检查现有 frozen manifest：能够绑定到 Baohe、ZoneBase 这两个路径的只有已经安装后继功能的版本，不能用它们删除 hook 冒充旧原件；MiddleAxis 虽有 pre-North 候选，缺 `f88dc035 → 原 blob` 的独立身份映射，不能仅因语义相符替代。精确 GitHub contents 对首 3 原 ref 均返回 **404 No commit found**，原响应已存 `missing-history-github-read-1250.json`，无远端写入。一次本地 cat-file 对完整 e14 SHA 因 promisor 配置触发自动 lazy fetch，服务返回 not our ref，最终仍 128、未取回目标对象；未把它当权限拒绝或源回归，后续检查禁用 lazy fetch。

补齐须另做有确切原 blob 身份的历史恢复/便携 QA，不准刷新旧 gold、跳过断言、把目前后版本反向删代码当原件，或把本轮失败覆盖成“已复现旧完整 batch”。

## 5. 三基址构建：真实 dirty 输入身份

三次原构建各 **568 modules、exit 0**；本人另实际调用 `verifyBuildSource` 对 `/gugong/`、`/forbidden-city-3d/`、`/` 全通过，并重算 HTML、实际 JS/CSS 入口、metadata SHA。

- runtime fingerprint：`9e5929eda9b12b24c243c26060e0dae9114b864777133187d0d2a74292057ae1`。
- sourceCommit：`411214d091723b3a5078bbb9499321c2c5c3d354`。
- **sourceDirty=true**，与当时 3 文件候选实际状态一致；不是 clean 411214 源构建。
- release 仍 `R146-fix`，未伪改版本号；独立结果 `builds-independent-1302.json`。

构建成功不能抵消 batch 缺史、既有 210 红和新增 3 条旧合同红，也不等于部署、GPU运行或浏览器照片验收。

## 6. 归档与 backup 契约应如何表述

准确表述应是：保存“**590 源文件冻结、3 文件有界生产候选、已审比较视图与实际专项、完整恢复后 A/B、原失败日志、有限构建结果**”；保留可回滚 411214 和旧黄金。

必须显式列：原完整 full 候选 **1313/1100/213**；92 请求实际 **524/514/10** 且 **38 旧断言未执行**；最终专项 **55/55** 是受限集合、不能替换完整 batch；历史对象闭包未齐，不能声称无旧 history 的完整 QA clone 已通过。若之后完成新的远端备份，应再逐文件确认实际上传集合、提交/tree 身份和恢复结果，不能把本轮本地验证提前替代它。

本报告不授权 main 合并，不证明生产发布检查已全部闭合，不提升整项完成计数，不宣称 GPU/远端恢复已验。
