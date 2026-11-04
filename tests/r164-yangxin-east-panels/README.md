# 东暖阁北分隔CPU检查

```
node --test --test-concurrency=1 tests/r164-yangxin-east-panels/{component,lifecycle,production-zone}.test.mjs
```

共17项。生产单区约0.45GiB，串行，不是World。fixture使用真实当前GLB和@napi-rs/canvas；BeforeLoader取受版本控制的精确9e原加载器并校验SHA256。JSON import适配仅用于Node测试，生产加载器/注册表不绕过认证。

baseline.json保留初始实际GLB哈希与5个原目标记录，不从改后状态重录。组件对照同一真实加载前对象全部原属性；只允许目标材质声明字段和UV改变。生产比较完整B+S物理以及全S原属性和非目标材质，另有篡改负控。

所有故障清理、重载、取消和资源释放断言使用实际InteriorLoader。初始缺实现、测试JSON配置错误及内部copy分配后异常的红测均保留为本轮证据。生成纹理是CPU像素，不是GPU截图；[来源/结果/成本/未验边界](../../docs/current-state/r164-yangxin-east-panels/RESULT.md)。
