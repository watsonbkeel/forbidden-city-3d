# R118 独立只读复核 — 限定 CPU 结论

复核日期：2026-10-27。未改产品、未 reset、未执行 GitHub 写入。

## 绑定版本

- HEAD：`8955d49d35aba2c9091fbef0d30bd3b323b50478`，有未提交 R118 运行时代码。
- 最终独审运行时 SHA256：`ed4cef463e3c9553b6068cc43899115fec76d97e7c369a5769e58298ad1ff5c6`。
- 最后兼容改动后实际重新跑完 10/30/60 Hz，前后 hash 相等、changed=[]；见 `provenance-final-10-30-60hz.json`。writer 的另一种 sourceFingerprint 为 `a20989ae9a74d6d2deb686bf1e76b6fc8d33b8f599918b66d8e5816cabd90333`，不是同一种聚合算法。旧3190版本的两份provenance作为历史保留，未改标签冒充本次。

## 最后兼容差分

唯一增量是 `InnerPalaceLevels.js`：有Array的真实builder保留原owner push；无Array的旧geometry-only接口改走col，同一F32六坐标。独立重建前源码精确匹配3190 manifest；default/private真实Array完整几何bytes、collider/scope/walk数值精确不变，非乾清路径不变；指定R31原test1PASS＋物理5PASS。随后最终三频完整raw JSON与旧版对应文件逐字节相同（包括所有轨迹/pose/incident），不是因小改而推定重跑通过。

## 已验证

| 频率 | 完整去返帧数 | accepted 微步样本 | 帝新增路线＋后妃全程 capsule endpoint / LOD0 三角交叉 |
|---:|---:|---:|---:|
| 10 Hz | 1,438 | 15,142 | 0 / 0 |
| 30 Hz | 4,310 | 16,890 | 0 / 0 |
| 60 Hz | 8,616 | 21,540 | 0 / 0 |

- 实际可见 B 建筑与 private prebuilt 成品三角；每个 accepted 微步检查原尺寸 capsule，每个逻辑帧检查完整实际 LOD0 动画模型。独立判定数学未在 RED→GREEN 间放宽。
- 双人进入不同西北罩床 slot 并返程；睡眠状态未见身体或模型与世界相交。
- 首轮发现的乾清南北木槛、乾清门木槛、平台侧缘及后妃床/炕前足穿插，修后在上述 3 个频率均消失。未改全球 STEP 或角色 body 尺寸。

## 不可省略的边界

**不是全路线“零穿插”。** 共同旧太和前缀仍有 181 / 541 / 1,084 个 rendered actor-frame 交叉。HEAD 原版相同输入前 10 帧位置逐值相同；第 1 帧 actor tri31 与 gold tri223 顶点相同且旧版也交叉，证明该首例继承未修；不是逐一重验所有旧前缀 incident。

每频新增路线分类还含 3 个 index333 sweep 候选：从旧前缀名义 8.60、已低于 finish 的起点抬到实际 8.630000114；不得隐去，也不应误报为新的终点穿墙。除该交界外，新增路线/后妃无 conservative sweep 候选。

这是 CPU 可见 **B fallback**；可选 GLB 为 **S**，未加载。本次不是 GPU/mobile、S 层、最终动态玩家/障碍、stream/cache/evict 矩阵的独立验收，也不是每个 rendered triangle 的帧间连续扫掠。后者与普通回归须引用各自证据。旧 `head-prefix.json` 的 scope 字段误写“fallback S”；以上 B/S 更正为准，数值 raw 保留未改。

writer 也实际重跑了最终 a209 源码完整 60 Hz 两角色更新 profile（before=after；此处仅只读核对，不是独审重新计时）：新段 7,466 样本 P50 .098 / P95 1.984 / max10.414 ms，cold global max13.697 ms、构造451.874 ms；非 whole-frame/GPU/mobile。1,331 面共276,848标量字节，未计JS/索引开销，非实测heap。修前 f971 的1.619ms P95样本保留历史，不冒充最新样本。最终预算接受由根复核决定。

## 证据位置

本小包：`FINAL-SCOPED-SUMMARY.json`、最终及历史 `provenance-*.json`、`runtime-source-manifest.json`、`head-prefix.json`、`profile-review.json` 与独立 oracle 源码。

全部重 raw 原位保留于 workspace 的 `r118-independent-review/`：
- `routine-oracle/full10-30-60-final-compat/`：最终ed4/a209源码实际重新运行的三频全raw、before/after及脚本。
- `compat-final/`：独立兼容差分、旧新源码快照、定向1+5PASS。
- `routine-oracle/full10-after-footprint/`：10 Hz 全帧、完整首末命中、raw 与 before/after。
- `routine-oracle/full30-60-after-footprint/`：30/60 Hz 同上。
- `routine-oracle/full10-before-contact-fix/`、`full10-after-surfaces/`：真实失败与逐步闭环。
- `routine-oracle/head-prefix-provenance.json`：774 个原版 archive 源文件逐一匹配 HEAD；`head-baseline/` 保留原版副本。
- `contact-*`：乾清低台／承乾木槛 9 条独立玩家轨迹；`model-slots-local*`：10 项模型/床位局部验证；`bed-diagrams-reviewed/`：已目视核对的 CPU 图证。
- `SCOPED-REVIEW.md`：阶段判断、范围限制及历史更正。

最终评价：**新增路线／床位的上述 CPU 身体与逐帧模型安全证据通过；旧前缀缺陷、GPU/mobile 未验不得被改写为全通过。** 随后只读确认 writer 最终 a209 的 R11827/27、protected motion90/90、resources41/41 终态通过，组JSON均before=after；这不是本独审重新执行全部标准门，继承失败须另列。构建日志终态成功，R118-257ab63f2b45 的输出identity与index一致；大chunk warning保留，未作浏览器/GPU验收。
