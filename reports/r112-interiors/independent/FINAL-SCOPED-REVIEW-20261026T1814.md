# R112 独立续审：局部几何/物理/材质门

2026-10-26 18:14 UTC；只读产品，证据补记。

**结论：SCOPED PASS，不是发布/全组完成。** 精确运行源 `c892bbd0f9ee621472839289a44349b3854c440e`，9 个源文件逐个匹配 `source-c892.sha256`。本审读取源码、实际三张 CPU 几何图、已有 raw，并重新计算原始成本汇总与 handoff 同值；没有伪称重跑所有既有 suite。

- 4416 个注册面与成品真实源匹配；12 内器架、12 外炉、9 门路已有证据成立。保留 64520 旧三角/属性、444 旧 collider 与全部旧 walkable。新外炉共享 1 geometry/1 material，既有资源释放 raw 为恰一次。
- 64 压力 raw 是零新增三角穿入，**不是每项 settled/jumped 都真**：两内器架 60Hz 朝中央旧标记假，最终六条 recovery 10/30/60 已闭合，不能删旧失败记录。
- 最终 handoff 九条完整 poses 和 bad 数组与旧输入精确相同；原厅 floor 边 3/10/20 帧交叠照留，不把它算新安全保证。
- Genuine hrtime 十进程成本：每进程 4 路径×600 帧，前120为warmup仍保留；全部候选 raw 的 SHA 与9源 hash 验证匹配，baseline `05c3e7f832dd0aa2b35b4011be9920bb86b8e846`。重算 summary 的分位/峰值全部准确。构建 median 341.936→366.304ms；登记 .978→20.262ms；受阻外炉 p95 .0815→.1968、内器架 .0456→.1117、域外 .0140→.0327ms；候选全峰 5.733ms。增量披露后可接受，非零成本/手机FPS保证。
- `cost-invalid-clock/` 的16.666667样本仍 **INVALID**。10种浮点尾数不能让虚拟时钟变有效计时。

## 证据绑定说明

`pressure-recovery-c892.json` 与脚本仍硬编码 `sourceCommit:fc17633f`；最终文件名、当前源快照与既有阶段链支持其读取时点，但这个旧字段本身不能当最终hash证明。本审没有修改历史raw；writer最终文档需显式注记。`group-fc176/retention-fc176`仍是阶段证据：从该提交到最终只改floor handoff语义，不改实物几何，最终专用handoff/approach/recovery证据覆盖影响。

## 留给集成门

18:13 `shared-targeted.tap`仍零字节，需writer确认/完成；根路径Vite build与VALIDATION定稿仍待集成。没有GPU、目标手机、Node20新证据。乾清/交泰整栋其余14分母账仍不能宣称全完成。

同名JSON含输入与证据hash、原始路径及精确数值。
