# 西暖北小门CPU回归

```
node --test tests/r164-yangxin-west-door/component.test.mjs
node --max-old-space-size=1024 --test tests/r164-yangxin-west-door/production-zone.test.mjs
```

12组件及1真实west-six B+S单区。单区约0.53GiB，串行，不是World。baseline.capture只允许干净fb0且新组件不存在时采集，已捕获后不能从当前修改状态重录。冻结宿主取精确fb0并验证SHA256；非目标源网格/全部物理/UI与屋顶另有摘要及负控。

目标原3盒全部36三角保留，只2盒饰面/UV变化。源比较保留除UV外每个原属性，窗面始终实体。几何射线从明确给定明间视点出发，不声称是用户实际相机。所有控制器路线使用脚本航向及转弯减速。S由真实GLTFLoader/InteriorLoader加载和卸载，B永久表面不归S销毁。

[来源、拟合、成本、历史测试及未验边界](../../docs/current-state/r164-yangxin-west-door/RESULT.md)。
