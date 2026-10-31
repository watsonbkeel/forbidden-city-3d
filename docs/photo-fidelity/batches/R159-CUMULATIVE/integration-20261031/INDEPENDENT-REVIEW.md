# R159 乾清走兽与交泰二器：独立只读集成审核

审核时间：2026-10-31 09:45 UTC。审核者：`/root/review_chunked_qa`（Astra）。

## 结论

在以下限定证据与措辞下，未发现未关闭的 P0/P1 或本次范围内尚待修复的 P2 代码/QA 问题，可作为开发检查点。**这不是单次完整测试命令全绿、GPU/整对象验收、部署验收或无旧历史 clone 可恢复证明。** 原 current-state 的 210 个失败没有被本审核消除。

本审核只读源码、历史对象、测试/日志和图像；独立运行轻量局部/纯 QA 单测，未修改生产文件、未运行并发重 World、未上传或部署。报告文件本身写入 `/tmp`，不是生产改动。

## 审核输入与身份

- 工作树：`/workspace/scratch/02a8023d1a85/r158-arrow-integrate`；分支：`feat/r159-palaces-cumulative-20261031`。
- 回滚点：`453837918e2d324ce406382333730cad1b1b26f2`。
- 乾清已审模块导入：`ec76db54` → `6e335030`；交泰：`628b3f2b` → `5a2887fe` → `5f43e74f`。
- 乾清生产 hook：`6aa40d2e38cd9159384b2a0d76186448df20ede4`；两者生产接线检查点：`ed3784c8b94e071a9dae86199d60e380fe20e8bc`。
- 后续修复均为 QA；589 个 `src/data` 文件逐 SHA 与 `source-qa-freeze-0900.json` 一致。运行源码指纹：`a5983c3a8b140b5693d6327a97f4c42cbc47345cb9a1e867f20e2146a2a1c996`。
- 最终完整 QA 清单：`/tmp/r159-cumulative-evidence-0854/qa-freeze-final-0941.json`，4250 项全部独立逐 SHA 核对；清单 SHA256：`5c20ff6fced05a1655e46805ea82593309f7475b8556b3e34c37d3fdb701b4b6`。
- 对旧 4231 项：无删除，新增 19；仅六个旧 World 消费者作显式有限比较迁移；**全部旧 fixture/golden 字节不变**。最初 0914 非 NUL 清单漏列 12 个中文 PNG 的问题已显式纠正；文件本来就存在且未变。两项测试自产 reports 已与 ed3784 原字节核对恢复。

## 真实入口，不以手动安装代证

### 乾清

`PalaceBuilder.buildHall` 仅为 `data.name === '乾清宫'` 增加 `walkingBeastProfile: 'qianqing'`。共享 walking-beast 模块的新增分支只分派至乾清专属 profile/座底算法；四个已审实现文件与对应导入提交逐字一致，旧其他 profile 分支未被替换。

新增 production test 直接导入当前 `PalaceBuilder`，不用 replacement loader/installer；保存了 hook 前 0-record 红与 hook 后真入口绿。旧 22 项几何/座底/朝向/预算/处置等专项保留；独立轻测也执行通过。真实 World 内唯一乾清记录为 72 animals / 8 riders。数量、局部几何和工程拟合不能外推为物种雕刻复原、测绘尺寸或整殿完成。

### 交泰

`JiaotaiDisplaySetting` 末尾仅在 canonical `(x0,y,z0)=(0,2.16,354.1)` 调用 `buildJiaotaiFrontVessels`。模块仍校验既有平台、frame、祖先单位变换、原平台完整几何、唯一安装与原子登记回滚；增加六个小普通实体 AABB，无新增 walkable/rescue 平面。

独立金样 `independent-candidate.json` 来自生产 hook 前的 reviewed module 安装，而非从待验 live World 反录。我在 SHA 锁定去 hook 的 unit setup 中独立重建，原局部 geometry/physics/support 摘要、六 mesh、六 owner bounds、完整 record 全字段相等。此重建只是金样来源校验，**不是生产入口证明**；入口由另行直接 production tests/World/readyScene 证明。

旧 15 项手动安装测试逐字保存在 `jiaotai-front-vessels.unit.mjs`：SHA256 `fc3173947b2195d98d78fd68f2772f708cbba5beec1722cde85e972bc18b1af2`。wrapper 严校子进程 15/15；loader 只对精确 SHA 的当前 display 文件删除精确 import/hook，结果等于 6aa 的该文件。其余依赖仍为当前源，故这是 **unit setup，不是冻结历史闭包，也不是 production 测试**。将 production tests 强制置于该 loader 下的既有 2/2 红亦保留。子 15 不重复加到顶层分母。

## 三宫与真实 CPU World

### 三宫 94 回放

生产 successor 与原 proof 的有效差异仅去除候选模块 import、手动 `buildHall` 注入 callback，并更改 scope/mode；原断言全部保留。调用为 `readyScene('high')`，不传 configureBuilder。

基准 `/tmp/r159-qianqing-hooked-jiaotai-baseline` 的全部 589 `src/data` Git blob，以及 package/DOM 文件，独立核为精确 6aa。public/node_modules 共享现有资源/依赖，因此不是独立空环境安装实验。

`jiaotai-production-three-palace.json` 的 94 回放独立计数为：6 四门 +24 侧路/绕行 +8 近平台 +8 前沿通过 +16 组 baseline/blocked/exit（三次），即 **78 到达、16 预期新增实体拦截**；每组均能退出，不是“94 次到达”。旧三宫非新增材质 geometry、572 个旧 collider 与全部支持精确保留，新数为 578。六组 merged bounds 每轴独立核对为注册 bbox 的精确 Float32 量化；2e-5 仅用于顶点分组，不是接触断言放宽。

### 累计 World

使用既有 CPU functional World fixture 的真实生产 builders、合并、CollisionManager 和 ZoneManager，未注入安装器。它不是浏览器 GPU 运行。

最终原始 World：30882 colliders /1365 supports；六交泰 owner 的集合、唯一性、独立 bbox 和完整物理字段全部认证（static tag、triangle/overhead/xiqing/duixiu/furniture 字段）。之后只生成新 comparison rows/collider arrays，顺序/索引一致，再送既有严格 Wuying55/493 合同。原 30876 个 collider（126 武英 +30750 其他）、全部支持与水域的原严格 hash 保留。

比较 cm 不继承碰撞/地面查询方法；仅显式保留真实 constructor 供既有独立支持 probe。实际 consumer、所有路线和运动查询仍使用 raw `W.cm`。六旧消费者的数量迁移为 raw30882 +comparison30876，不能称这六文件仍原字节或把 view 分母冒充 raw 分母。

## 发现并闭合的 QA 问题

1. **P2：六新实体初始只核 owner/bbox，附加 physics 字段未锁。** 已加金样 SHA pin、完整 row 认证及缺失/重复/陌生 owner、bound、各 metadata、非目标漂移负控。新 World 内 11 负控通过；独立轻量 synthetic-only 校验另覆盖 13 情形，明确不冒充 World。
2. **P2：可见性初始只查两 group。** 我在内存中实证单 mesh、祖先隐藏仍过，后又实证透明材质 opacity=0 仍过。新 production verifier 校验六 leaf 及所有祖先 visible、material.visible 和透明时 opacity>0；先红后绿日志保留；独立轻测通过。原 15 unit 未改。
3. **P2：比较 cm 遗漏真实 constructor。** 完整 batch 的 instrument 旧比较器实际报 `probe.addWalkables is not a function`，不是生产回归。已显式保存 `constructor:W.cm.constructor`，而非恢复 query 原型；真实 constructor/probe 单位先红后绿，独立复跑 2/2；最终 instrument 实际五项全部通过。
4. **资源终止后的有限 QA 内存修复。** SIGKILL 均保留，未当作通过或断言回归。私有 SHA 锁定观察进一步确认 Wenhua 整对象 JSON 非突变 hash 未完成、instrument 在完整比较与 row drift 负控完成后卡在 `structuredClone(actual)`。私有 probe 不计正式通过。
   - Wenhua 只把前后两处非突变摘要改为严格根键/array 类型、逐行完整 JSON hash 的有序摘要；行数/顺序、行内字段/键序、全部支持/水域仍覆盖。**不是原 digest 字节等值**，所有 fixed golden hash 算法未改。两单位覆盖 13 数据漂移和 6 根键/类型反例，独立复跑通过。
   - Instrument 支持缺失负控只深克隆 walkables；原 rows/rivers 明确共享只读引用。原断言保留，并补支持克隆身份、原支持长度/嵌套摘要及整体 bounded fingerprint 前后不变。比较器源码只读 rows/rivers。最终无 loader、896 MiB 实际 5/5，约 20.4 秒。

以上修复不改任何生产、物理模型、clock/driver 或历史 golden，也没有用新期望值覆盖实际偏差。

## 门禁结果：必须保留分片措辞

- 原 current-state 全集合：**1313 /1103 pass /210 fail，0 cancel/skip**。独立逐执行标题与失败标题 Counter 对照 453 完全相同；这不等于逐一证明全部旧失败根因相同，更不是全绿。
- 首 84 文件 batch：513 /507 /6，六红都是旧 comparison 30876 与实际 30882 的分母契约冲突，原日志保留。
- 迁移后的完整 84 命令：**513 /510 /3，exit1**；含两个 file-level SIGKILL placeholder 与一个 QA constructor TypeError。此原终态没有被覆盖、回写或改称 exit0。
- 最终覆盖账：八个依赖文件在修订后的各自终态中重跑，共 13 顶层记录替换；再加入新摘要单位两项。独立逐日志 SHA、实际无 loader 命令/exit0、标题多重集及 placeholder 替换重算，得到 **85 个唯一文件、515 个顶层测试全部覆盖通过**。首 513 标题无丢失，仅新增两项。旧 unit 子 15 不重复计数。
- 对应账：`FINAL-COMPOSITE-COVERAGE-0942.json`；这是**同一生产源码、QA 修订与依赖分片记录明确的复合覆盖，不是一次 85 文件命令全绿**。
- 最终 Wenhua 无 loader 896 MiB：1/1，六真实路线，约25.3秒；maxRSS 1,668,788 KiB。Instrument 896 MiB：5/5，maxRSS 1,662,812 KiB。复现应保留记录的资源参数与串行约束。
- 三 base 构建（`/`、`/gugong/`、`/forbidden-city-3d/`）均 exit0 /567 modules；metadata、入口资产引用/SHA 独立验证，runtime input 为 clean ed3784 与同一源码指纹。后续改动只有 QA，不偷换为最新 QA commit 的重构建。
- 三幅 actual-readyScene CPU 图已亲看，九个输入/输出 SHA 与 PROOF 相符。显示屋脊兽列和二器，明确 base/vertex color、无纹理运行光照/阴影/GPU；不作照片像素配准或整对象复原验收。

## 保留边界 / backup 契约

本报告可证明本地已审 source 与上述有限 QA 覆盖，不能代证 GitHub 上传、远端分支、Pages 发布或一个没有旧 Git history 的干净 clone 完整复现。三宫 94 命令仍需显式提供已认证的 6aa 未接交泰 hook 基准；当前实验共享 public/node_modules。既有 frozen-source/gzip 便携和远端恢复工作应另列证据，不由本次局部 unit setup 或本地全套结果偷换成立。

乾清只承诺有来源约束的数量/工程放置；交泰材质身份、历史器名、雕镂细节、隐藏背面、原尺寸和拍摄日期继续未知。GPU、整屋/整对象 acceptance、完工计数与发布结论均不在本审核通过范围。

证据根：`/tmp/r159-cumulative-evidence-0854/`。本报告对应最终4250 QA冻结字节；后续源码/测试变更或证据归档措辞需另行核对。
