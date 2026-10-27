# R120 性能候选 — 独立复算（拒绝交付）

2026-10-27。艺术 PRE_PERF `cb77e454…`／runtime `8938de15…` 是不降质比较基线。**NR1、NR1b 都未过预先冻结的全部门，不能称 R120 性能已修复；保留艺术组，恢复性能前运行源。** 05:04 独立恢复读回已完成：全部 562 个 runtime 输入逐字节等于 PRE_PERF、无 extra/missing/different，候选引用为 0，指纹前后均 8938；见 `restore-readback.json`／可复跑脚本。

## 安全静审与独立小对象检查

- NR1 `15e8dbd6…`：只把 SharedRestNavigation 既有两个 numeric proof 函数移出并裁剪 frozen own-enumerable data 的重复验证。冻结是浅层；mutable normal/typedarray 等后代仍递归；保 root identity、同数 replacement、NaN 旧拒绝及 accessor 全量验证。异常 current 返回 false。不是通用 Proxy 识别，未承诺任意陷阱副作用相同。
- 独立脚本从精确 PRE_PERF Git blob 提取旧两函数，比对 12 个定向状态＋160 个混合浅/深冻树，共 172 个比较一致；不构建 world、不代替真实生命周期。getter 变抛异常时旧版 throw、新版 false，均拒绝，raw 未把二者写成同一行为。
- 根准一次 NR1b `629149b3…` 因果细化：current 校验原样，compile 对 frozen leaf 不再建闲置 values/refs，只有 container 临时收集 child。独立同 172 比较再一致。实际四 rail 短诊断的指定数组创建表达式 85,120 → 13,336，proof rows 仍 16；这是选定分配点而非完整 V8 heap，也不是正式性能验收。
- 运行函数未改 geometry/body/STEP、source 使用范围、频率、cache、角色数或异步 ready。两版静审未发现此合同内安全 blocker，但安全可行不等于性能可交付。

## 全部配对原始结果复算

`paired-review.py` 逐个读取 5 对 A/A 和各候选 5 对 A/B 的原 JSON，验证 source 前后稳定、108 registered、两 routine 全去返 8,616 帧、quality=low、paint ready、无 instrument wrapper、轨迹 SHA 唯一且相同。没有删任何慢样本。主指标为新路线 total；counter 按每对不超原 A/A 最大绝对差。没有改用候选中位数放行。

| 候选 | 主收益（全部 5 对为正） | 超出原 A/A 的 counter | 结论 |
|---|---|---|---|
| NR1 | 每对省 2685.405–4031.927ms；中位 3076.538 > A/A 1073.936ms | construction pair2 +45.388966 >25.020191ms | REJECT_COUNTER |
| NR1b | 每对省 2223.280–3643.680ms；中位 2973.451 >1073.936ms | inheritedPrefix P95 pair3 +.072619 >.028352ms；worldReady pair1 +374.957985 >210.688566ms；end-route arrayBuffers pair2 +75,370,196 >74,169,801B | REJECT_COUNTER |

超过预设门不等于已证明每个波动都是代码因果回归，但本轮约定的保守门未过，所以不放宽、不第三次刷样本。完整每对差、其余全部 counter 和文件 SHA 见两个 `paired-review-*-low.json`。

## 计量边界／归档

- driver 原 `readyCpuMs` 在异步 paint 完成前取值；已提醒另计真正 `allReadyCpuMs`。不得用 setup-before-paint 冒充用户的全部 ready。旧诊断 raw 不覆盖、不回填。
- routine raw 的 `memory.ready` 实在去返结束后采，报告称 end-route，不是初始化 ready heap。
- low 配对 raw 有产品 source before/after，但没有实时内嵌 driver SHA；独审 04:53 才观测保存三个 driver SHA，不冒充起跑记录。此 provenance 限定留存。后续 driver 已有更明确绑定，但本轮没有高档接受结论。
- 172 比较绑定各自候选 hash。拒案源快照留 `rejected-source/`，只是审计材料，不应从 src 继续导入。全部重 raw 留 writer `reports/r120-performance/{aa-low,ab-low,nr1b-low}/`。
- 不声称完整 108 人帧、GPU、移动设备、浏览器网络或全世界碰撞性能。只诊断两个真实 routine 及相应 CPU 建造／资源边界。
