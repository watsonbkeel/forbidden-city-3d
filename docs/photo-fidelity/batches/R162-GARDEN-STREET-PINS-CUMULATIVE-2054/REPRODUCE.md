# 四门正常 World 的可移植重跑基线

独立复审指出原测试固定依赖未入库 `/tmp`。本次仅把既有程序生成基线原字节封存，不改产品/测试或清洗原失败诊断；SHA256 与早期 EVIDENCE 的原本地基线一致。此文件不含官方照片。原样准备测试约定目录后即可在完整 checkout 重跑四门 30 项（需 Node 24 与 npm ci）；输出仍是测试原约定目录：

```sh
mkdir -p /tmp/garden-street-pins-cumulative-2045
cp docs/photo-fidelity/batches/R162-GARDEN-STREET-PINS-CUMULATIVE-2054/baseline-with-near-starts.json.gz /tmp/garden-street-pins-cumulative-2045/
node --test --test-concurrency=1 tests/r162-garden-street-pins/component.test.mjs tests/r162-garden-street-pins-cumulative-2045/world.test.mjs
```

已有原输出需保留时先备份，或用恢复报告所述仅重定向 writeFileSync 的加载hook；不能改变基线、断言或生产源码来通过。邻香亭单项仍依赖其历史作者本地raw，未声称其跨机器独立复现。本次基线归档是新增例外；旧README的“/tmp raw仅hash索引”仍描述当时封存阶段，不再覆盖现在已明确归档的这一份基线。
