# 寿安入口颜色合并受控修复（bdc42fe1之后）
已证实原source 14个彩色实体存在color，finish同材质合并后color=0。用户/父已授权继续修复，免重复设计确认。

选择严格opt-in保留原顶点色：只寿安自有材质固定name+vertexColors+明确私有标记同时成立；每源color三分量、顶点数相等、有限数验证。只有该桶改变normalizeAttributes保留列表，不改变其他桶、几何烘焙、索引展开、镜像、材质、物理/路线/颜色插值；不自动修锡庆/遂初等其他旧彩面。无全局color默认开启。
替代方案：noMerge虽局部，但丢失现有Float32烘焙/原源面精确匹配和合并生命周期，增加14 draw calls；按色切原Box三角会改渐变与物理owner结构，均不选。取舍由实现者基于既有契约作出，不冒称用户指定实现。

执行顺序：
1. 真实finish逐三角位置+颜色配对红测，保留旧缺口诊断。
2. 非目标桶/伪标记/错误color guard及实际父合并器全属性对照。
3. 最小生产实现；独立审查；寿安/慈荫专项、相关真实库/生命周期/源面/全World与完整共享串行回归。
4. 成本与source hashes，实际GPU依旧未验；本地提交，原失败/14脏报告/main不动。

## 完成记录
仅两处生产修改：本入口自有材质加true标记；MergeUtils三重严格资格保留color。整树preflight在任何克隆/释放之前，要求普通非交错BufferAttribute、Float32紧密RGB、非normalized、与position count相等、array长度count×3且全有限。拒绝交错源，不扩改原flipWinding。其它桶仍删除color/其他额外属性，补normal/uv及镜像逻辑完全旧行为。

- color-merge-red.tap / color-scope-red.tap / color-interleaved-red.tap分别保留原丢色、护栏及交错属性反例。
- color-guards-reviewed.tap 6/6，原每三角位置/线性色分量精确配对；旋转/负尺度镜像也保持颜色顶点配对；非目标/部分冒名材料与实际bdc42fe1合并器逐属性/变换相等；坏源提前拒绝且原源0次释放。
- color-zone-parity-final.tap 1/1，整outer-west真实TextureLibrary（CPU惯性纹理/DOM边界，不替换material实现）实际父合并器对照：唯一变化是寿安目标桶的color属性；其余几何、材质参数及完整碰撞/walkable/rooms相等。首跑color-zone-parity.tap因测试DOM缺失而失败，留档，补的是测试DOM而非生产逻辑。
- 初次最终专项在审查指出交错护栏后主动Ctrl-C结束（exit130），color-specialized-interrupted.tap原样保留，不算通过；未启动并发重型重跑。
- 最终 `node --test --test-concurrency=1 --test-reporter=tap tests/major-pilots/shouan-entry/*.test.mjs tests/major-pilots/ciyin/*.test.mjs`，color-specialized-final.tap **52/52**，48.97秒。
- 随后完整原共享组color-shared-final.tap **161/161**，297.25秒；同前一轮记录的完整共享命令，非单项拼接。独立只读终审已核52/52并确认无代码阻断，交错反例由审查提出并红→绿补齐。

成本color-metrics.json：raw109 mesh/51938三角不变；最终仍10 mesh/51938三角，碰撞73、walkable10不变。保留原颜色新增1,661,184字节合并属性（4,986,048→6,647,232）；是实际GPU属性带宽/内存增加，非免费修复。仍没有浏览器/GPU同视角验收。其它旧顶点色对象（锡庆等）不在此修复范围，其历史丢色不顺带改变。

历史color-loss.diagnostic.mjs现在显式git show加载bdc42fe1寿安源，继续稳定复现旧缺口；旧ciyin/shouan-color-loss.json原样不改。现修复由正向color-merge/guards/parity与共享日志证明，不将历史诊断改成假成功。
