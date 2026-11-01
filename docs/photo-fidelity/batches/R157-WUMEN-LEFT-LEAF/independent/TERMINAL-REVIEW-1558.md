# 午门左近叶累计候选：独立终态评审

2026-10-31 15:58 UTC；审查者 `/root/review_chunked_qa`。仓库 `r157-restored-411214`；构建时 HEAD 为 `eec6847e8783ad28cb95371f50eba7bbb98078c2`，叠加已审左近叶候选与明确 QA 迁移。

## 结论先行

**本轮有限累计候选可作为开发检查点保存；没有发现新增的未解释回归。不是全套全绿、完整无历史 clone 验收、GPU／发布批准或整午门完成。**

独立从原 TAP 与原构建产物重算／核验：

| 门禁 | 实际终态 | 相对前驱 eec |
|---|---:|---|
| 原 full 三分片 | **1313 / 1100 过 / 213 红**，无 skip/cancel | 全部状态＋标题 Counter 完全一致，原命令逐字相同 |
| 请求 105 文件 batch | **581 / 571 过 / 10 红**，无 skip/cancel，exit 1 | 32 增／7 减全部准确解释；原 10 红不变 |
| `/gugong/`、`/forbidden-city-3d/`、`/` 三构建 | **各 570 modules、exit 0** | 三份实际 build-info、HTML/JS/CSS 与当前 runtime fingerprint 验证一致 |

本次独审没有重跑 World、batch 或 build。只读复算完整 Counter、核文件与原日志，并实际执行既有 `verifyBuildSource` 三基址验证函数。

## 1. 冻结与运行源码边界

15:56 在门禁全部结束、generated reports 恢复后，独立遍历真实集合／逐文件 SHA：

- **592 source**：`source-final-1527.json` SHA `07f0da6a6b846915e647ebdb82d3dbc502e9b8492be59c6fad88469c46fdc2bf`。
- **4368 QA**：`qa-final-1529.json` SHA `685222aefa4d7079ae31b50a3cfa243e82866d7f1b2ccc01b11f685b0ff008f2`。
- 两份完整路径集合与全部字节精确相等，范围内没有软链。
- 相对 eec：仅原 `WumenLowerBase.js` 改动，新增 `WumenLeftLeafStuds.js`；其余 **590 前驱 source 字节不变**。不是以提交号替代 dirty 构建内容身份。

来源、位点和组件范围沿用已签的 `COMPONENT-REVIEW-1505.md`：east 近叶 64 可见、8 遮挡未知、0 确证缺失；15mm 纯视觉贴面，同门铰、无新增物理；工程归一化／统一金色不是米制测绘或原照锈色。原 827 记录／452 collider／16 support 双态保全是明列字段合同，不称任意 Three 属性穷尽保证。

## 2. full：没有把 213 红说成通过

逐项解析两轮原始 TAP 的 `(ok/not ok, title)` 多重集，不仅比较总数：

- main：1190 / 978 / 212；exit 1。
- Qinan stair：48 / 48 / 0；exit 0。
- Zhaode routes：75 / 74 / 1；exit 1。
- 合计 1313 / 1100 / 213；前驱和候选完整 Counter 相同，新增／消失均为 0。

各 resource 记录的精确命令与 eec 原分片一致；本轮没有改写原 current-state 文件、清掉失败结果或更新其黄金。此处只关闭“相对 eec 是否新增 full 失败”的问题，不关闭这些既有失败及更早 width 已明确保留的三条旧等分合同红。

独立证据：`full-independent-counter.json`，包含完整候选 Counter 与三组原 TAP SHA。

## 3. batch：581 的真实分母及迁移

独立核对请求列表：旧 98 文件完整保留，增加左叶 7 文件，105 路径唯一、原运行 flags 不变。

从实际单次原 TAP 得到 **581/571/10**，耗时 811.91 秒、资源记录 maxRSS 1734672KiB，exit 1。没有 SIGKILL、cancel、skip 或另轮片段拼接冒充该轮。

从先前实际终态 TAP 独立构建新 30 标题列表，再核本轮完整 Counter 差：

- 7 个新文件共 **30 新顶层项**：组件 12、比较 4、历史复制 4、592 guard 6、merged 2、CPU 1、World 1。
- 原 591 guard **6 顶层→1 个严格子 6 wrapper**：顶层净 -5，原 6 断言历史字节及实际子执行均保留；子项不重复计入总分母。
- 既有 side-portal CPU 标题 `49536→57984`，是一进一出、数量中性；完整逐三角断言仍在。
- 因而 **556 + 30 - 5 = 581**，完整标题差为 **+32 / -7**，不是“旧标题全部原样零消失”。

新 32 个记录全部为 ok。原 10 个失败状态／标题 Counter 完全一致，包含 **8 个文件启动失败占位**和 **2 个实际 test 缺史失败**；不能将文件失败占位当作文件内原断言已执行。

实际日志仍涉及这 10 个缺失历史 ref：

`064ecb27`, `3dcafeb6`, `66fd5710`, `6ffd4ebc`, `98cfd572`, `9e17ef00`, `d2592770`, `e14c61911844e7aa6ce7c0251e64fd0ad61e67f4`, `f88dc035`, `fde9a95b`。

继承分类表中的 **38 个旧标题仍全部未出现在本轮 Counter**。分类表原字节保留（SHA `60e538a76cb36b70429488943428f301af9e91f917c1c25f86af483f9831be96`）；它不是补跑记录或缺史问题已经修好的证据。

本轮 batch 原 TAP SHA：`bc6bcb54ebe754c635961c54bed32f1972188b44a0d86ec9468ca22df285f401`。

独立证据：`batch-command-independent.json`、`expected-new30-titles.json`、`batch-independent-counter.json`。最后一份包含完整 Counter、精确增减、缺失 ref 及 38 标题清单。

## 4. 三基址构建身份

实际调用仓库原 `verifyBuildSource({root,dist,expectedBase})` 三次；额外核同基址 CSS 文件、HTML fingerprint/base metadata、JS/CSS/HTML/build-info SHA 及各原 resource exit 0、原 build 日志 570 modules。

共同 runtime fingerprint：

`691f0ea0ea8f132ebded2d5e08930c2e3860bdea59ba1e33ebf0a18b70603a4f`

| base | buildId |
|---|---|
| `/gugong/` | `R146-fix-b91db0731950` |
| `/forbidden-city-3d/` | `R146-fix-804b84dc829b` |
| `/` | `R146-fix-34e97d03af5b` |

三份都如实记录 `sourceCommit=eec6847e…`、`sourceDirty=true`。`release=R146-fix` 是保留值，不能用这次验证声称已发布新版本；也不能后改成未来新提交 clean、伪装旧构建来源。构建验证证明输入／入口一致，不是浏览器或 GPU 验收。

独立证据：`builds-independent-verification.json`。

## 5. 组件、迁移及真实 World 关联

本终审承接而不重复计数：

- 独立新 12 + 原 lower 19 = 31/31、eec 前驱重放 2/2、真实旧 hook 负控 0≠1。
- 独立迁移 14/14；原 1054 fixture／runner 字节不改。592→591 是真实独立复制树，不是 fs 伪装；原 guard／原断言继续在精确前驱上实际执行。
- `isMesh` 被 clone 归一化造成的旧负控实红已保留，复合比较在 clone 前后认证 raw portal；没有删掉旧断言。
- 新 World 原 position-only 盲区先补 canonical 实际矩阵／属性／render 签名及真实变异，再实跑。
- 独立只读核两 World：left 40 组合全部到达、8222 帧；width 24 组合 16 到达、8 预期阻挡、1188 帧。raw 30882 collider／1365 support，完整既有物理 hash 保全链成立。运行命令没有历史 loader 或 installer 注入，路线用 raw W.cm。

这几类证据验证不同范围，**不可把重复 test、历史子项、路线数量加成一个总“通过断言数”**。新 World oracle 为当前严格认证组件，不是独立照片测量；architecture 字段只核实际列明范围。详见原三份独审报告及 `WORLD-RECEIPT-1532.md`。

## 6. 生成输出及封装草稿

6 个测试生成 reports 均先保留原输出，再逐字恢复为 **pre-run=HEAD**。独立检查 before／after 原件 SHA 与当前文件，reports 工作区 clean；没有用生成结果更新黄金。详见 `final-freeze-and-restoration.json`。

当前包内作者 **35 个原 TAP gzip** 已逐个解压，与外置原日志逐字相等，gzip／raw SHA 都一致。原 RED（hook、材质盲区、事务、592 guard 探针、isMesh、merged 草案等）未被改写为 GREEN。继承 38 标题分类亦逐字相等。包内图片类型文件目前仅 **6 张已审 CPU PNG**，不含私有原照／PDF／裁图。

封装草稿的 README/CUMULATIVE 终态与本次复算一致。完整最终 index 及提交尚待作者纳入本报告后生成，本报告不预先宣称最终 index 或 commit 已验证；后续只需尾核身份／索引，不必重跑门禁。

## P0–P2 与备份契约

- **P0：未发现。**
- **新增 P1：本轮有限变更及已执行门禁没有发现未解释新增阻断。继承 P1 明确保留：full 213 红、batch 10 缺史红，以及 38 原标题没有执行。** 不能称完整 batch 通过、所有旧源码可恢复或整项完成。
- **P2／范围限制：** 64 位仅图像可辨占位；8 位未知、工程尺寸和统一材质、15mm 无新增碰撞；CPU 不等于 GPU，运行年代／实景状态没有新增认证。

后继备份必须：

1. 先保存有限开发提交，保留 eec 回滚，不改 main、不因局部通过直接发布。
2. 以592源和4368QA manifest为输入；若远端投影省略大日志／CPU导出，明确逐文件投影，不把省略后的树称完全原样本地QA镜像；至少保留完整小 Counter、缺史分类、关键 pins／原黄金／历史断言与必要 fixture chunks。
3. 真实 clone 中实际重验允许范围（左组件、592复制闭包、有限比较及串行 World），结果独立记账；不把本地结果、现有 Git 缓存或原591镜像结果代称远端592实际源通过。
4. 原591 runner、原6 guard历史副本、原width历史合同与590manifest、eec Lower原件和592 pins缺一不可；不虚构或推测那10个缺失提交的源。
5. 本候选远端仍 **PENDING**，不能据前驱备份完成推定新候选已备份。整项完成增量 **0**，GPU／release 接受仍 false。

独立终审工件目录：`independent-wumen-left-terminal-1545/`。本轮不对外上传文件、不启动新重测试、不修改运行源码或原QA。
