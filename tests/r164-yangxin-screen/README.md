# 木照壁饰面局部回归

```
node --test tests/r164-yangxin-screen/component.test.mjs
node --max-old-space-size=1024 --test tests/r164-yangxin-screen/production-zone.test.mjs
```

生产单区串行运行，不是World。baseline.json在bc3完整树且新增组件不存在时生成，capture脚本只用于该精确历史状态，不能从当前代码重录金样。fixtures/r164-yangxin-bc3中的门楼文件直接取自bc3并验证SHA256，imports仅为本地测试重定位。

组件使用@napi-rs/canvas检查真实纹理像素，生产组件/真实材质合批/物理控制器仍是CPU，无浏览器/GPU结论。原36三角表面精确守恒；rawSnapshot排除且只排除3个原木屏目标与新增对应面，dataSnapshot只去除新增饰面元数据，其他全部摘要不变。门楼前脸釉面、内室、地图与传送均在保护范围。

测试脚本采用可控相机航向与转弯减速，不把线路到达当任意奔跑/触屏验收。葆中原5路线×2帧率×2速度为20条，不是24。保留错误汇总原日志并按真实枚举纠正。

[来源、成本、历史测试失败与未验边界](../../docs/current-state/r164-yangxin-screen/RESULT.md)。
