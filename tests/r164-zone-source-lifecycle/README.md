# 真实源证书的缓存生命周期

基线a7a215cb。轻量入口：

```
node --test tests/r164-zone-source-lifecycle/{atomic-load,retention,dispose,source-boundary}.test.mjs
node --max-old-space-size=1024 --test tests/r164-zone-source-lifecycle/production-zone.test.mjs
QUALITY=low node --max-old-space-size=1024 --test tests/r164-zone-source-lifecycle/production-zone.test.mjs
node --expose-gc --max-old-space-size=1280 --test tests/r164-zone-source-lifecycle/teleport-neighbors.test.mjs
```

其他单区以 `ZONE_ID=garden|outer-east|outer-west` 运行production-zone，逐个串行。outer-west峰值约1.58GiB，不与单区/构建并发，也不把它当World。east-six使用生产32MiB预算；其他单区在夹具内提高缓存预算以强制验证保留路径，生产配置不变。过预算的真实运行路径仍会dispose并重新构建，旧R107覆盖预算/质量/TTL及普通区释放。

真实ZoneBase、ZoneManager、CollisionManager、Teleport，Canvas/纹理使用CPU替身，不能验证GPU颜色或真实触控。跨区测试只注册east-six与其真实garden邻区，其他未注册邻区无构建，明确不是全世界流式验收。传送失败的控制台日志为故障注入预期，断言检查错误、旧相机不动、其他区保留、残留清零及重试。

source-boundary.json冻结12原模块a7文件SHA。只剥离明确新增的保留登记import/call后必须逐字节相同，确保原判据/移动代码不变。保留API只负责对象生命周期，不是新的接触授权。新增源绑定的认证将来必须在成功认证后登记实际原始分支；不可用重挂parent、公开字段或宽松认证替代。

`LEGACY_DISPOSE=1`仅为人工旧方法故障负控：从精确a7 git对象取原dispose方法，预期失败；正常自动测试不依赖旧git对象。原始红测、旧夹具错误、首次正常通知顺序回归失败均留存，后者已恢复原行为。

[范围、结果和历史失败](../../docs/current-state/r164-zone-source-lifecycle/RESULT.md)。本轮不改落点、几何/材质、地图目标或正常物理，不保证所有其它卡死症状已解决。
