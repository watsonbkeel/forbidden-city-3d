# R90 验证记录

基线：R89 `de4f61e4e2569393477ca2a295bb2e7692ddef14`。源代码和历史主文档保留；不移动整面北墙。

- 串行相关回归 `affected-serial.tap`：74/74，通过 R89 时间/皇帝/独立世界/乾清/水域、R77 墙体、R84 世界/堆秀、R90 门体/地图/路线/源码边界。
- 独立审查边界测试移植后：1/1，通过三次加载、实际传送落点、近门框倒退跑步 10/60Hz、实体接缝阻挡。
- 24 组实际控制器往返覆盖三门、神武三门洞和北横街，10/30/60Hz、走/跑、无抬升；地图只有一个顺贞门身份。
- 中门牌匾遗漏已用失败测试复现并修正：保留单个北向牌匾，无侧门虚构。原始 RED/GREEN 证据保留。
- 早期并发相关测试 117/125：两项无断言文件级失败在串行重跑通过，初次中止原因未证实；HTTP/包测试当时未有构建输入，不算验收。另两项午门旧断言已见于原始基线；神武历史 R32 精确源码身份测试在未改动的 ZoneBase 身份校验处失败。旧断言不放宽。
- 真实 GPU/浏览器/手机视觉与性能验收未进行；四张图片为实际几何 CPU 平涂诊断。官方照片未入仓库。

## 最终全量、构建与包

- 完整 R90 测试 `R90_PACKAGE=… node --test --test-concurrency=1 tests/r90-*.test.mjs`：16/16，含独立边界、地图、真实路线、拓扑、源码保留、双 base HTTP 与包启动。

- 最终 raw `npm run test:current-state`：1290 项，1127 通过 / 163 失败 / 0 取消，与变更前 R89 基线失败名称多重集完全相同（新增 0 / 消失 0）。不是全绿；未通过修改旧 fixture 隐藏失败。见 `raw-comparison.json` 和两份原始日志。
- 双 base Vite 构建 `/` 与 `/gugong/` 均退出 0，保留原有 chunk >500KB 提醒；两份 `build-info.json` 均 `sourceDirty:false`。
- HTTP 两个 base + 本地生产包启动：3/3。139 个清单文件逐一 SHA-256/字节数验证，ZIP 140 项 CRC 通过。
- 构建源码提交：`131690a16c5473135d57524a4dc8c203b1cbefeb`；最终证据提交不改变运行时输入指纹。
- 指纹：`a94d556b6091fcd0c64790ab5d11706ac712a5f04e78af636c57b8005cecb733`。
- build ID：`R90-60a44a91820f`（根），`R90-c3ca0ba9ca23`（子路径）。
- ZIP SHA-256：`23c45df2fd53ca7e24d259fa9f81f7d4efaf9647da2020800019be5ef67f5f59`。
- manifest SHA-256：`8af20aac392952458849eebb6146700af93fb05089dd3933b400f9a66c56de59`。

证据目录 `reports/r90-north-connections/`：`affected-serial.tap`、`independent-review/`、`world-routes.json`、`unchanged-source.json`、`raw-comparison.json`、`dual-base-identity.json`、`package-verification.json`。历史测试会写旧报告的副作用输出已另存到本版 `historical-test-side-effects/`，旧报告恢复原字节。生产包及 ZIP 在仓库外保存，不将二进制包或官方照片上传到源码分支。
