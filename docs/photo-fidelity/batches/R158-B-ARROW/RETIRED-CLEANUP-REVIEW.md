# Astra P2 收尾：已提交后的退休几何清理异常

基线 `76fd244a`。独审确认 pre-commit mutation 原子性已关闭，但成功 detach 64 件后直接循环 `dispose()` 的首个监听器抛错会中止循环，余下资源不再被现场或正常 kit teardown 持有。该问题确实存在；新增首/中/末真实 dispose 监听故障测试在旧代码 **3 RED**。

修复复用 `disposalFailures`，对全部64退休几何逐一尝试清理，收集回调错误后再报告。此时 live 图形和 ownership **已经提交，不进行也不声称回滚**。异常类型和可检测契约：

```js
error instanceof AggregateError
error.code === 'ARROW_LATTICE_COMMITTED_CLEANUP_ERROR'
error.committed === true
error.cleanupPhase === 'RETIRED_GEOMETRY_AFTER_COMMIT'
error.result // 原正常结果；8斜棂+8暗衬，64旧网格退休
error.errors // 原始 dispose 回调错误
```

测试证明首/中/末错误下：64件退休几何全部各被调用一次；16新件保持已提交，2私有材质仍由 kit 各拥有一次；物理登记不变；再次调用被 already-installed 前置拒绝，不会误重试生成重复暗衬。随后实际 finish/merged-world 检验与 teardown 正常，新 source/merged geometry、私有材质各处置一次，64旧件不再处置。后续资源错误不是视觉或全对象通过。

最终联合 **51/51**（原48 + 新3）；未改共享入口、牌匾模块或其他亭，不合并、不部署。

```sh
node --test tests/r158-arrow-south-lattice-atomicity.test.mjs \
 tests/r158-arrow-south-nameboard.test.mjs tests/r158-arrow-south-door-lattice.test.mjs \
 tests/r59-arrow-baseline-fixture.test.mjs tests/r59-arrow-south-knees.test.mjs \
 tests/r59-arrow-knees-world-consumer.test.mjs
```
