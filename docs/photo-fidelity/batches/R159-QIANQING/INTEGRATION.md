# 乾清宫九兽：生产 owner 接线（候选未应用）

源码基线 `493a13c7`。本分支不修改 `src/scene/PalaceBuilder.js`。

在 `buildHall` 的唯一 `buildRoof(this.library, {...})` 参数中，保和殿专用选项后加入：

```js
...(data.name === '乾清宫' ? { walkingBeastProfile: 'qianqing' } : {}),
```

不要改通用 roof 默认数量，不要把九兽选项传给其他建筑。原有 `roof.userData.walkingBeasts` → `g.userData.hallWalkingBeasts` 已负责收集元数据，无需第二个 installer；最终合批沿用旧流程。原屋顶高度、宽深、材质、内饰、路径、碰撞均不改。

`tests/r159/qianqing-hook.test.mjs` 在内存排演这个精确接线：对真实 `buildHall` 比较屋顶之外所有网格属性、全部 collider/walkable、既有元数据；实际屋顶产生72兽/8仙人。测试兼容owner尚未接线或已按上述一行接线，不往生产文件写临时补丁。

集成后复跑：

```sh
node --test --test-concurrency=1 tests/r159/qianqing-contact-review.test.mjs tests/r159/qianqing-roof.test.mjs tests/r159/qianqing-hook.test.mjs
```

父任务须另做整批运行/部署身份验证和 Astra 独审。旧历史屋顶测试有已知父候选一致失败，见 RESULT，不用改掉历史快照来冒称绿。
