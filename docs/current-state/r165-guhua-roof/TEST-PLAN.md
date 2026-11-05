# 检查清单与统计口径

正式累计保留先前338个不同的有界测试文件，另增10个古华轩有界文件，完整清单见BOUNDED-TEST-FILES.json，共348个不同文件。新增文件共32项，不通过import其他.test文件制造重复计数。正式重型项继续为实际宁寿1项与西六宫1项；见HEAVY-TEST-FILES.json。最终正式项数以完整日志为准，不将定点重复执行加入总计。

本次新测试覆盖：冻结公共基线和真实材质、精确保留承托、连续圆冠/上下山裙/封闭厚度、绿带外侧和顶面的真实首命中、31瓦陇连续可见、逐顶点实际三角插值、全部边界/材质分配失败和重试、几何/材质一次性释放、生产合并和飞行包络、非目标网格/接触漂移真实负控、缺失/重复/变形目标、错误尖冠和承托间隙负控、完整源字节与精确登记叶子。

源码/测试冻结前的定点命令：

```sh
node --test --test-concurrency=1 tests/r165-guhua-roof/*.test.mjs tests/r165-xuhui-gallery/source.test.mjs tests/r165-chongjing-allocation/source.test.mjs
```

COLLIDER-STREAM-FOCUSED-GREEN.log实际38/38通过、0失败/取消/跳过/待办，23.592s。含新增32项及两组既有源码守卫6项。此前修正REVIEW-FIX-FOCUSED-GREEN.log36/36保留为历史。首次冻结FREEZE-GREEN.log34/34保留为历史，不替代最终结果。旧公共源码、旧屋顶以及若干中间方案的预期RED分别记录在FOCUSED-LOG-RECEIPTS.json；最终运行保留同一约束的真实负控。

真实TextureLibrary.load另证HD、SD、manifest失败、HD/SD单band失败、全部图失败、SD normalMap缺失七种合法上下文；完整UV/位置/法线/拓扑保持各自公开ad0捕获结果。共享map/normalMap保持身份，由library独占释放；五类真实UV/法线/位置/整套上下文及输入漂移拒绝。

R42与R139属于额外历史覆盖，不在338原正式文件清单。R139只选Guhua及冻结R138文件校验5/5，R42原组件选择3/3，新增受影响R41混合hash和现行状态选择2/2。旧R41常量不改，仅在完整新顶及精确保留承托验证后重插入冻结旧顶；平台、旧承托UV和新瓦面突变均由负控拒绝。旧六个私有材质完整名/身份分别保留，再单列准确三个新顶私有材质。R42额外完整宁寿前后/侧廊10Hz与60Hz两项应单列，不能再加进正式总计。

额外完整R139曾产生10通过/1失败：Fanhua对R138旧几何哈希不符。该断言在公开ad0同一原测试字节、同一命令也失败；原测试SHA256为232553215361e78b2fffa2904df8bff470a21adb7dfe13daf3efbea1cc9d1632，Fanhua相关源码与公开ad0零差。实际哈希a6a703758cff4163482c5846808f1ceb8423af58f1cd2a79b8d83677eba465e6，旧期望d2da11f7c9fe282aa497ce4471d57b6485e3b85068c5bf5864247bb44ee4c7a9。保留原断言及冻结证据，不为本顶修订Fanhua历史契约。它是额外历史检查的既有红，不是正式累计失败的替代或豁免。

结构检查命令 `node tests/zone-lint.cjs --no-geo`：7区、0错误、9条保留边界警告。锚点 `node tests/anchor-check.cjs`：114条中神武门z方向11m超5m旧容差，另有乾东五所kind不兼容未比较1条。没有放宽容差。
