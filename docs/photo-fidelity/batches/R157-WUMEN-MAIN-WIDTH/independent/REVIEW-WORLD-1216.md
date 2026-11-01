# 午门正楼宽轴候选：真实World与七消费者补审

2026-10-31 12:16 UTC，Astra `/root/review_chunked_qa`。承接 `REVIEW-COMPONENT-1203.md`（SHA `018173858fd277aa19718d72e71c2a4c4473ba2a77f0a362cfad4c5e6201529d`）。本补审只读真实World原日志，另独跑2项明确synthetic的比较helper单位测试；没有自行或并发运行World。

## 结论

**88条比较视图及本轮实际World、七旧消费者的有限迁移通过。** 原全套current-state、完整累计batch和三基址构建尚不在此结论中；也没有GPU/远端恢复/发布/整楼完成批准。1.43继续只是已审工程拟合。

输入仍为基准411214上的三生产文件WIP，不谎称基准commit字节就是新比例。`source-freeze-1210.json`590和`qa-freeze-1210.json`4333均独立验证实际路径全集=清单、逐SHA全符，七消费者运行后再次核SHA无漂移。

## 严格88行比较对象

`wumen-main-width-world-comparison.mjs`固定原before-411214快照SHA `2138d5b37119c2d4f34e1d2afb325ee843020a3fa1887011cbf7bfba289d5c28`，从原98局部碰撞与已独审X/UV变换推导88个新旧完整ordinary-solid row，不从本轮World反录新gold。

每个目标以全部字段的hash唯一匹配，实际碰撞box和原PalaceBuilder提供的Box3对象身份/字段/边界双重核对。没有给生产添加语义owner ID，也不将其宣传为已有语义owner ID；它证明的是完整物理row与原provider对象/边界对应。缺失、重复、伪provider、目标box及全部物理metadata漂移均拒绝。

仅在新数组同索引替回这88条旧row及对应比较collider；原数组、真实manager及全部其他行保持。比较cm无query/movement方法，保留真实constructor、支承/水体引用。旧Jiaotai六体视图随后组合，原Wuying55/其他历史hash仍原样执行。helper本身不独立证明其余30794原始行，必须依靠后续旧全物理合同；本次真实World已经执行该链。

独立单位测试 `world-comparison-unit-independent-1210.tap`：2/2、exit0、1.86秒。这是实际组件+synthetic填充数组，不冒称完整World。

## 新真实World原日志

`world-first.tap/json/exit`：1/1，exit0，总28.434秒。实际 `buildR52World()` 无新安装器注入；唯一午门组与先通过组件88合同、再真实canonical finish的参考逐完整mesh/材质摘要对应。参考是当前已审组件，不是独立照片gold。真实组隐藏/实际顶点偏移负控拒绝。

raw30882碰撞、1365支承；88映回→Jiaotai→原Wuying55完整保全链通过，目标metadata/伪provider及非目标漂移负控通过。比较前后完整物理摘要相同，路线使用原W.cm，未用比较对象替代碰撞。

24种真实World路线组合齐全：两侧×10/60Hz×走/跑×三模式。8个新柱轴预期受阻，8个原柱轴释放、8个擦边通行到达；1188个记录帧均执行body不穿透和脚高12.3m断言。它们与组件阶段是同一组场景的不同层级验证，不重复计成48种新路线。

原 `prior-world-real-red.tap` 的非目标hash失败保留；没有因预期变化而删除失败或刷新旧gold。

## 七旧消费者：断言原字节，有限入口迁移

独立从Git411214读取每份原文件，对七份现文件逐一验证：**恰一行import改为显式 `wumenWidthThenJiaotaiPriorComparison as r159JiaotaiPriorComparison`，其余全部文件字节不变**。各前后SHA与 `seven-consumer-import-migration.json` 相符。原helper及旧gold未改。

这意味着原比较函数现在明确经过额外88条认证/映回；不能再把其中“保留所有旧物理”的旧日志标题误读为88条真实raw坐标未变。它们的路线/probe仍使用原W。

七独立串行命令原终态，均1024MB V8 heap、exit0、无cancel/skip：

| 消费者 | tests/pass | 秒 | peak RSS KiB |
|---|---:|---:|---:|
| R159三宫累计 | 1/1 | 26.970 | 1667356 |
| 文华门累计 | 1/1 | 26.876 | 1666044 |
| 太和门设施 | 1/1 | 19.341 | 1663504 |
| 旧四项累计 | 1/1 | 16.585 | 1654768 |
| 武英桥累计 | 1/1 | 19.195 | 1624124 |
| 箭亭累计 | 1/1 | 15.809 | 1718060 |
| 太和仪器 | 5/5 | 22.026 | 1726680 |

合计11/11。独立读取各原TAP标题/末尾计数及resource，输出 `seven-consumer-terminal-1216.json`。这是七命令串行通过，不冒称整个累计batch一条命令全绿；旧环境资源中断也不因此被倒写为通过。

## 尚待项

本阶段无新增未关闭P0/P1。完整current-state的210旧红是否保持、完整batch的新分母/历史迁移Counter、三build及后继提交/备份另待实证。保留CPU非GPU、源图非测绘、原通天柱/门窗/宏观比例等未完成边界。
