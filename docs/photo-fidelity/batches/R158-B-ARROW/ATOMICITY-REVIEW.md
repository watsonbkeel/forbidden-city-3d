# Astra P2：门棂提交异常原子性修复

基线 `de1090c8`。初版仅保护离线构造，`owned.push`、`frame.add`、旧网格 `removeFromParent` 位于 catch 外；实际注入会泄漏资源或留下新旧混合现场。此项是初版真实缺陷，原 36 项正常路径测试未覆盖，不将该结果重写成已覆盖异常。

## 先复现

新增 `tests/r158-arrow-south-lattice-atomicity.test.mjs`，八个 commit 故障点在旧代码均 RED：
- ownership push 前、写入首材质后、两材质写入后；
- add 前、真实第一 mesh 挂入后、全部 mesh 挂入后；
- 第一、最后一个旧件的真实 `removed` event 抛错。

每个点直接检查原 `children` 和 `owned` 数组对象/内容/顺序、旧 parent、实际几何字节和物理登记。并非只检查最终节点数。

## 修复边界

1. 全部16个 mesh、16件最终几何与2件私有材质仍离线 staging，不先触碰现场；冻结数组在分配前拒绝。
2. ownership、挂载、全部64旧件 detach 是一个受保护的 live commit；它们**全部成功以前不处置任何保留旧几何**。
3. mutation 抛错时避开可能正在抛错的 add/remove/监听器，恢复原数组身份/顺序、旧 parent 与 owner，彻底脱离全部 staged mesh，然后逐一处置私有资源。
4. 清理回调若也抛错，仍尝试清理其他资源，以 AggregateError 保留原始 commit 错误和次级清理错误。
5. 同样关闭临时斜棂清理漏洞：一个临时 strip 的 dispose 通知抛错时，仍处置其余 strip 及尚未返回给上层的 merged geometry；该场景也先 RED 后 GREEN。

成功后几何/材质/拟合参数未改变，不改门棂范围、照片状态或全对象验收。共享入口和其他亭无改动。

## 真实所有权与重试证据

八个 commit 失败均观察16个真实 staged mesh，分别持有16件最终几何和2件共享私有材质；失败后每件 dispose 一次、owner 队列不持有、无 parent；64旧件 dispose 次数均为0。解除故障后立即在同一真实 host 重试，只有8斜棂+8暗衬，无重复暗衬；成功后64旧几何各 dispose 一次，retry 的 source geometry、merged geometry、私有材质在真实 finish/dispose 生命周期各处置一次，kit gold 不提前处置。

另测两种 frozen 数组、清理监听器二次异常、临时 strip dispose 异常。新12项与原36项联合 **48/48**；没有并跑全仓或构造额外全世界。

```sh
node --test tests/r158-arrow-south-lattice-atomicity.test.mjs \
 tests/r158-arrow-south-nameboard.test.mjs tests/r158-arrow-south-door-lattice.test.mjs \
 tests/r59-arrow-baseline-fixture.test.mjs tests/r59-arrow-south-knees.test.mjs \
 tests/r59-arrow-knees-world-consumer.test.mjs
```

CPU 输出的 before/after 几何 payload SHA 与先前修正完全一致：before `09c082c79b3bb5d5a87d920430436d26c9e2964a22640ba180811f66c3d96f87`，after `f175bf2b571550b91231c067f5990394d62a05f11846ddb51f2a9be6e5e8eb48`。仅异常控制流/所有权改动，不是新的外观修订；浏览器仍 VERIFY_PENDING、整项 false。
