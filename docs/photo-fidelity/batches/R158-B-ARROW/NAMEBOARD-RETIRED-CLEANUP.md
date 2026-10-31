# 独审补项：牌匾两件退休资源的提交后清理异常

基线 `dcd25459`。独立负控确认 `fg.dispose();bg.dispose()` 在面板清理监听器抛错时会漏掉边框，且边框自身抛错时也没有明确已提交语义。针对 fg/bg/同时抛错新增3项，旧代码3 RED；修复后联合 **54/54**。

现对两件退休几何全部尝试一次，再聚合报告错误。此时面板/边框已 detach、atlas 条目已移除、marker 已置位；**这是提交后清理异常，不是事务失败回滚**。

```js
error instanceof AggregateError
error.code === 'ARROW_NAMEBOARD_COMMITTED_CLEANUP_ERROR'
error.committed === true
error.cleanupPhase === 'RETIRED_GEOMETRY_AFTER_COMMIT'
error.result // 正常移除结果：2 mesh / 14 triangles / 1 atlas 条目
error.errors // fg、bg 产生的原始回调错误，两个都错则长度2
```

真实测试覆盖：两件退休几何均恰好调用一次；重试在 already-removed 阶段拒绝，不重复移除/处置；kit gold 仍由原owner持有、当次不处置，最终 teardown 恰好处置一次；另一真实牌匾的对象、atlas 登记和几何保持，finish 后仍生成其 atlas 并正常处置。先前 mutation-phase partial detach/atlas splice 回滚和全部门棂验证均继续通过。

不改几何、文字目标、照片时期、入口、视觉边界或其他亭；没有增加资源。浏览器和全对象验收仍待完成。

```sh
node --test tests/r158-arrow-south-lattice-atomicity.test.mjs \
 tests/r158-arrow-south-nameboard.test.mjs tests/r158-arrow-south-door-lattice.test.mjs \
 tests/r59-arrow-baseline-fixture.test.mjs tests/r59-arrow-south-knees.test.mjs \
 tests/r59-arrow-knees-world-consumer.test.mjs
```
