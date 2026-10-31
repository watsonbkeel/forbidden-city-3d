# 左近叶 World 终态只读补记

2026-10-31 15:32 UTC，`/root/review_chunked_qa`。补充 `QA-MIGRATION-1530.md`，不改写该稿的历史截止点。

**作者两份真实 World 原命令均已 exit 0；独立只读核终态、路线组合、原日志及冻结。没有另跑 World。**

| 实际测试 | 原 TAP | 独立复算路线清单 |
|---|---:|---|
| `left-world-40-1530` | 1/1，31.05 秒 | 五门 × 双向 × 走跑 × 10/60Hz，40 唯一组合全部到达，8222 帧 |
| `width-world-24-1530` | 1/1，28.98 秒 | 三模式 × 双侧 × 走跑 × 10/60Hz，24 唯一组合；16 到达、8 新轴预期阻挡，1188 帧 |
| 两既有 CPU 全面 exporter | 2/2，17.83 秒 | 仍完整比较 57984 面的顶点／法线／颜色／side，不只是改 count |

两 World 的 resource 原命令均是普通 `node --expose-gc --max-old-space-size=1024 --test …`，没有历史 loader 或 installer 注入。新 left World 实际运行 1529 已补强 canonical merged 签名及原逐点 buffer、隐藏／顶点负控，唯一 64 帽身份；参考来自已认证组件，不是照片黄金。

原物理 manager 仍 **30882 collider / 1365 support**；实际比较保留既有 88 width 映回、6 Jiaotai 排除与 Wuying55 完整旧物理 hash 链。路线使用 raw `W` 与 `W.cm`，不是比较视图。原测试逐帧断言全身体无穿透及脚高，结束再次核物理指纹不变；本次只读复算输出路线的笛卡尔组合／帧数和终态，不冒称独立重放全部 9410 帧。

15:32 再独立遍历真实文件集合和 SHA：

- `source-final-1527.json` **592/592** 全同；manifest SHA `07f0da6a6b846915e647ebdb82d3dbc502e9b8492be59c6fad88469c46fdc2bf`。
- `qa-final-1529.json` **4368/4368** 全同；manifest SHA `685222aefa4d7079ae31b50a3cfa243e82866d7f1b2ccc01b11f685b0ff008f2`。

独立原件绑定、精确命令及复算 JSON：`world40-terminal-check-1532.json`、`world24-cpu-freeze-terminal-check-1532.json`。其中 left 原 TAP SHA `fa3eebdfd22872c33405c31c0f3a8ea99748fca489090c8856a820d921c7b24b`，width 原 TAP SHA `813b218065d1c3bad5a7169beaa4e4d1f0635b990baf89b6d387301e151aac1a`。

**限定结论：本次 592 历史闭包／比较迁移及已列实际 World 目标、40+24 路线有通过证据。** 原三片 full、105 文件 batch、三基址 build 才启动，结果尚未知，不能提前写整版或完整 batch 通过；原缺史 P1、未验 GPU／远端、本体整项未完成继续保留。
