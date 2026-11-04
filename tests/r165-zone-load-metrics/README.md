# 分区CPU加载观测

基线b5。仅本地有界观测，不改变缓存32MiB、队列顺序、碰撞、几何、人物或时间策略。F3沿用250ms可见刷新；隐藏时不读新provider。原buildTimes保持“构建/复用准备”语义，新的total才包括登记及通知。

轻量重跑：

```
node --test --test-concurrency=1 tests/r165-zone-load-metrics/{metrics,manager,display,merge-startup,source}.test.mjs
```

真实单区（约0.6GB；勿与其他大区并发）：

```
ZONE_METRICS_EVIDENCE_DIR=/your/evidence node --expose-gc --test tests/r165-zone-load-metrics/production-zone.test.mjs
```

before.mjs使用仓库冻结的b5原Manager、ZoneBase和CourtKit；只将导入指向同树现有依赖、原CourtKit和原ZoneBase，不拿候选冒充旧源。完整网格/材质/矩阵/属性索引、物理、地图房间/区域、架构/屋顶与默认缓存拒绝逐项对比。

新增数字只在区操作时保存，最多8个完成记录，不留场景、几何、错误对象或用户字符串。build含merge子阶段，禁止把两者再加一次。prebuilt/cached是此次加载来源，其build/merge为0不表示初始构造免费。startup为最近一次启动预构造，不是当前入区；lastQueue是最近一次非空队列调用，未必和随后直接加载或首错属于同一事务。

首错摘要把这一受限快照复制到现有本地文本框。只输出白名单区域/模式/阶段与有限数字；mode/failedPhase先单读且严格原始字符串，循环对象/BigInt不得进入JSON。初次对象与交替getter泄漏的独审红证保留，修复后真实恢复层继续显示。不会自动联网、上传或重试。原console.error和首错对象仍按原系统保留，不声称清理了开发者控制台。

没有抛异常的卡顿、浏览器/OS直接终止页面、初始化尚未进入主循环、GPU等候不能由这份首错摘要确认。F3和计量仅提供线索，不能把最近一次加载当根因，更不能声称已经降温或加速。
