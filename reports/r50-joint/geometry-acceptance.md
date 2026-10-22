# R50 联合树：candidate06-07 版本化几何验收

## 结论与适用边界

- 新增版本专测 `tests/p3c-kit-final07.test.mjs`：6/6 通过。
- 保留原 `p3c-kit-incremental.test.mjs` 的取消、验证、独立工作量边界、历史 metadata 行为项：5/5 通过。
- 原 female candidate05 的 36 个案例与 07 均不兼容：每例的 8 个 buffer SHA 均不同。逐例、逐 buffer 的旧/新 SHA 及真字节比较结果见 `geometry-final07-results.json`。这些旧预期分类为“不适用”，不是通过。
- 原四个固定坐标外观探针保持原断言，狭窄定向重跑结果仍为 0 通过 / 4 失败、进程退出 1。未删除、跳过替换或修改断言。它们不计入新版本通过数。
- 原混合 126 案例的两个整体验收断言未整体重跑，避免失配 Buffer 的巨型深比较输出；也没有将它们列为通过。原日志完整保留为 `geometry-preserved-06-light.tap`。

因此不能称“所有历史测试全绿”。当前通过的是明确版本化的 07 字节回归与保留行为项。

## 当前版本验收

1. 同步和增量 API 各覆盖原 126 案例中的全部 90 个男性案例，对原归档输出作真实 `Buffer.equals` 精确比较，并核对每个属性及 index 的 typed-array 类型、itemSize、count、normalized、version、usage、gpuType、userData、boundingBox、boundingSphere。失败信息仅输出长度和 SHA，避免巨大数组 diff。
2. 同步和增量 API 各覆盖 36 个女性默认案例加 6 个 walking 案例，期望由仓库内 SHA 硬绑定的 07 冻结源码生成。核对全部 buffer、上述属性 metadata、name、长度/字节长度/偏移/元素宽度、updateRanges，以及 userData、box、sphere、groups、drawRange、morph 状态。
3. 36 默认案例为两模板 × 三 LOD ×（standing、kneeling、四个 seated variants）；walking 为两模板 × 三 LOD。断言检查数量、唯一性及默认案例与原 candidate05 清单的对应关系。
4. 增量 API 同时核对每步工作量上限、不泄漏部分几何、各阶段及顶点/三角形/法线/包围体累计量。
5. 06→07 独立对照全 42 女性案例：24 个 seated 案例恰好仅 characterWeight、characterTorsoWeight 两个 buffer 改变；其他所有 buffer 和 metadata/bounds 不变。12 个非坐姿默认案例及 6 个 walking 案例全字节不变。

女性 07 期望来自冻结实现，不是独立美术验收、历史真实性证明，也不是重新生成的 candidate05 oracle。当前生产源码与 07 快照 SHA 相同，这一限制明确保留；后续实现偏移将受硬绑定及字节比较检测。

## 源码与原证据

- 当前 Kit 和 07 快照 SHA256：`cc311f8fdaa912538fdfffebd66b7fa2c5de7f2c7063ffbc5bf462bc3f5edc6c`。
- 06 快照 SHA256：`5128af161cbce30e7da8106b8350ae30455dd16c32e04f00075cb948e85cf15b`。
- 两个 packed oracle 不仅通过 `readFixtureArchive` 的每片、gzip、原始 SHA 与 Git blob 验证，还直接对比原提交 `314751a381bdbf159a3dd5bdb3c92fcbe7240700` 的原文件，确认真字节相同。该 Git 对比只用于本次证据，不是新测试运行依赖。
  - kit-preparation-baseline：4,155,008 原始字节，SHA256 `a488fc0dc5c70a67f7dba584c57f7e068a38dcb91da03e7a789ca4b4511028ce`。
  - female-refinement-baseline：1,216,649 原始字节，SHA256 `32ad4dafae1196806ade1971e8e1b22bae5b081d35acfda92118d708e66932ab`。
- 原 refinement 测试全文与原提交相同，SHA256 `e2450196760cd58743df8ef1bede5828f3909ecb24d9fb50d9c53f7927412cac`。
- 保留的 kit-incremental 测试当前 SHA256 `f0e32a9a43d849abf5bcc85ca2145d39b06dec9bf43865d0274debd2536743ba`；原提交 SHA256 为 `c027764e9913a1945048303ea4c2f8a2e8979775c97b85232525dd6777d644b1`。差异仅是之前已完成的归档读取适配（一个 import、两个 fixture 读取调用），断言未变，本次未修改它。
- 保留的 06 旧日志 17,103 字节，SHA256 `4fa372e7952e78628f43047327742dab091d0731867158650b28094f9b30be25`，与原日志真实字节相同。

## 重现与证据

在仓库根目录、依赖已安装的条件下运行：

```sh
P3C_FINAL07_REPORT=1 node --test --test-reporter=tap tests/p3c-kit-final07.test.mjs
node --test --test-reporter=tap --test-name-pattern='cancellation|validation|independent|intentional' tests/p3c-kit-incremental.test.mjs
node --test --test-reporter=tap --test-name-pattern='female swept scalp|hair has no exposed upper-skull|female noses are closed|female right-lapel' tests/p3c-female-refinement.test.mjs
```

第三条预期退出 1，保留历史红项，不作为通过项。第一条的环境变量只启用可选 JSON 报告；不设置时测试不写文件。测试只引用仓库内相对路径的快照与分片 fixture，不依赖其他 worktree 或临时目录。

- `geometry-final07.tap`：新增专测完整新鲜日志。
- `geometry-original-behavior.tap`：原五项行为测试完整新鲜日志。
- `geometry-legacy-four-probes.tap`：四旧坐标探针完整新鲜失败日志。
- `geometry-final07-results.json`：264 个 API 输出案例的分组统计、全 42 个 06→07 差异边界、全 36 个 candidate05 逐 buffer SHA 差异。
- `geometry-original-archive-verification.json`：两个 oracle 对原提交的直接字节比较及原测试文件归因。
- `geometry-provenance.json`：环境、运行命令、结果、文件 SHA。
- `geometry-preserved-06-light.tap`：原历史日志的原字节副本，内容实际为 Node spec reporter 输出，沿用原文件扩展名。

任务开始时联合树 HEAD 为 `7c13ef19955dbda6873815a1231a9800a580a4e1`；并行预算工作后证据记录时 HEAD 为 `61c2e5e2f60db60f4487541a48119f05dab2c275`。几何源码始终受上述 SHA 硬绑定。本任务未修改生产源码、旧测试、原 oracle、旧图片或用户确认记录，未构建世界或运行全套测试。
