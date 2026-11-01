# 两阁正脊端吻：仅补可辨轮廓

基线 `196384b027e930209145cde19050d6754554e97f`，隔离候选。体仁阁、弘义阁各补两端简化正吻，复用现有 RoofBuilder 剖面挤出体与小剑把；单体 1.25 m 为照片比例工程拟合，不是测绘或细雕。官方整景可辨上翘端吻；来源、原图 SHA 在 EVIDENCE.json，未复制官方照片。

## 范围

- `SurveyedPavilion` 唯一具名启用 `pavilionChiwen:tiren/hongyi`；无该选项时默认不变。校验拒绝其它名字、非庑殿/非单层。
- 保持 low，不启用全局 high，不增加走兽排。每阁只增加 176 三角形。
- 两阁旧屋面每个三角形保留；非屋面网格与碰撞、支承、房间、地图、regions 逐项 hash 同基线。其它四种屋顶各 low/high 输出也同基线。
- 中央正脊顶标高、瓦面与檐高保留；新增端吻最高点由既有 finalize 包围盒如实记录，不把测量“中央脊顶”改成新吻顶。

## 验证与诚实保留

- 新 3 项先真实 RED，再 GREEN。首轮拟合测试将吻体根部误限在脊顶下 .5 m，因正常嵌入脊帽失败；改为以实际瓦峰 -.2 m 为根部限制，并保留原红日志。所有旧屋面三角形全等的严格断言始终不变。
- 当前相关 **26/26**：现有 surveyed-pavilions 15、新端吻 3、既有侧接组件/接触 7、新原生路线 1。
- 两阁原前门与四 U 侧接，10/60 Hz ×走跑，**24/24 往返、7286 帧**，峰脚地差 **.222666667 m**。这是实际局部组件＋原生 FirstPerson，不是全 World 重跑。
- 旧 current-state 两项只因“吻兽省略”的状态断言过时而红；按新授权更新文字状态，并新增本阁 profile、两端 count 断言，其余实测/通路断言未放宽。
- `npm run build` 通过；已有大 chunk 警告。`npm test` 没有脚本，不能称全套绿。
- `r58-courtyard-window-frames.test.mjs` 在测试加载时 `git show 88c71e26...:src/scene/palace/special/SideGate.js` 找不到旧历史路径；在 196384 原基线独立复现同失败，未修/跳过此旧测试以制造绿。
- 四张同镜头前后图已亲看：端吻从屋顶两端形成清楚、简洁上翘轮廓，无新浮空。CPU 平色，不是真贴图/GPU/手机验收。
- Astra 独审：无阻断；独跑新 3/3、旧侧接 7/7，确认默认输出、碰撞支承与生命周期不变；每阁 4/4 合并几何资源正常释放。独审日志 `/tmp/pavilion-chiwen-independent-related.log`。

## 复跑

```
node --test tests/current-state/surveyed-pavilions.test.mjs tests/r157-pavilion-chiwen/*.test.mjs tests/r157-pavilion-side/component.test.mjs tests/r157-pavilion-side/contact.test.mjs
EVIDENCE_OUT=/tmp/pavilion-chiwen-routes.json node --test tests/r157-pavilion-chiwen/routes.test.mjs
node tests/r157-pavilion-chiwen/export-cpu.mjs /tmp/pavilion-chiwen-views
python3 tests/r157-pavilion-chiwen/render-cpu.py /tmp/pavilion-chiwen-views/after-hongyi.json.gz /tmp/pavilion-chiwen-views/after-hongyi.png
npm run build
```

交唯一集成人；没有推送、改 main 或共享生产树。回滚只撤本候选提交，不回滚此前门台/侧接/午门跳跃。
