# 额外历史链诊断边界

本轮除正式 current-state 与 R34/R35 专项外，还对旧历史保留链做了探索性运行。该批结果不是通过，不与正式验收计数合并：183 项中 175 通过、8 失败。

其中六个断言失败来自以下旧版产品文件清单遗漏 R34 已新增路径（相应测试文件自本地 R34 `2cd8189` 未改；R35 不新增生产文件）：

- `tests/r25-nameboard-retention.test.mjs`
- `tests/r26-qianqing-retention.test.mjs`
- `tests/r26-qianqing-frieze-retention.test.mjs`
- `tests/r27-jiaotai-retention.test.mjs`
- `tests/r29-qianqing-retention.test.mjs`
- `tests/r30-qianqing-passage-retention.test.mjs`

没有为了制造“所有历史测试通过”而扩大本轮范围、删除清单断言或更新旧夹具。正式 current-state 的对应保留边界使用已验证的精确新增路径；旧工具链欠账保留单列。

另有 R33/R34 场景文件在多组重型场景构建并发时出现文件级终止，未输出具体断言失败。不能直接把原因确诊为内存不足。独立隔离重跑 R34 场景保留测试得到 8/8 通过；最终集成运行的结果以 `FINAL-VALIDATION.json` 为准。探索性终止本身不算通过，也不代替最终复验。
