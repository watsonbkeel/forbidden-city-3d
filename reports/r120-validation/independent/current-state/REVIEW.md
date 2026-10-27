# R120 大版 current-state：新增 7 失败独立判读

2026-10-27 05:08 UTC。只读已终态 raw／具体 stack／断言源，不重跑 world、不改 expected。

**核对成立：R119 1,101 pass／188 fail → R120 1,094 pass／195 fail。新增恰好 7、移除 0。七项都是已批准艺术改动撞上旧源码完整字节／epoch 锁，没有新增运行 TypeError；仍按 FAIL 保留，不能称 major 全绿。**

| 新失败（简写） | 真正失败位置 | 判读 |
|---|---|---|
| Ceiling follow-through 七 hunk | `r32-followthrough-source-retention.test.mjs:79` | 先断言整文件 SHA；旧 `5aeedc…`，当前 `d70696…`。本轮加入 276 格浅口改变源字节。没有进入构建。 |
| CentralArt frieze 三 hunk | `r32-frieze-source-retention.test.mjs:80` | 整文件 SHA 锁：旧 `80fdf1…`，当前 `e19d40…`。 |
| frieze changed epochs | 同 test `:151` → helper `:32` | restore 严格入口拒绝未知当前 SHA，不是运行时错误。 |
| CentralArt screen 五 hunk | `r32-screen-source-retention.test.mjs:78` | 条件历史还原器对未知字节不作变换，再遇旧 `087020…` SHA 锁。 |
| screen changed epochs | 同 test `:148` → helper `:30` | 同类严格 restore SHA 拒绝。 |
| CentralArt exact R32→R31 | `r32-source-retention.test.mjs:89` | 旧 `189ea5…` 整文件 SHA 锁，不允许把任意新源当旧 epoch。 |
| Ceiling added fixed identity | 同 test `:123` | 完整字节数 `4067 !== 2875`，未进入运行构建。 |

CentralArt 实际 R119→R120 diff **仅**两处同一牌字横向比例 `1.25/3.8 → 1.30/4.5`（一行），匹配获批 A 组牌面尺寸。既有文字顺序／图集色块／paint 加载均未改。Ceiling diff **仅**已审 C 组浅口的 9 行构造；原格数／高度／厚域／far／paint 保留。完整 diff 原件附 `two-approved-art-source.diff`。

独立脚本验证全部 112 current-state 测试对 R119 字节不变；四套相关 test/helper/fixture 字节也不变，无 expected 放宽或新历史例外。全部七 stack 的类型是 `ERR_ASSERTION / AssertionError`；不是 TypeError。`seven-added-failures.tap` 保留完整七段 raw，`failure-review.json` 绑定两份整 TAP SHA、源 SHA、门文件 SHA。

这只解释新 7 项的确定原因，不消除 188 项继承失败，也不把同名旧失败推断为内部原因全部相同，更不证明任意运行路径永不 TypeError。全表必须继续呈现 1,094／195 的真实终态。
