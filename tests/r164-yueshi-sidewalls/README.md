# 阅是楼四块既有侧墙：有界验证

基线9a3e055fe2e98c21ef1dc4255e9ea35e797dedbd。`../fixtures/r164-yueshi-9a3/RemainingNingshouHalls.source.js`是该提交的原始文件，SHA256 `7fa35e793de9bacc9b65d428bd7b39412da348437763e36cb104b199d770294c`，fixture加载前校验，不从当前分支动态取得“历史基线”。

```
node --test tests/r164-yueshi-sidewalls/component.test.mjs
node --max-old-space-size=1024 --test tests/r164-yueshi-sidewalls/production-zone.test.mjs
```

组件7项；生产测试使用真实ZoneBase/CourtKit/CollisionManager/FirstPerson，纹理像素为CPU夹具，不启动GPU。生产测试约0.8GiB，串行执行，不与其他单区/大构建并行。`baseline.capture.mjs`仅允许9a3干净运行源码且新组件不存在时捕获，现有候选上不得重新生成覆盖基线。

`rawSnapshot`在真实kit.finish之前记录全部网格的顶点属性、索引、材质、变换与阴影；只将精确新私有墙材质的名称/颜色归一为原材质，其余一切保留，空材质占位也作为独立记录保留。实际finish仍完整运行。`dataSnapshot`记录全部碰撞、可行走面、房间、地图、regions与architecture，仅删精确阅是楼新增色材说明字段以匹配原记录。

冻结9a3包含珍妃井。合批前26059网格/566436三角；6822碰撞/213面、7032屋顶三角均精确保留。新增一个材质批次为原4盒48三角。阅是楼40正/12负与珍妃井48正/20负，路线含现有南门阶梯、四边旁路及封闭侧墙/后窗阻挡，步/跑、30/60Hz、往返。采用可控朝向/时钟，转弯前减速，不等于全路线、任意连续冲刺或真实浏览器输入验证。

本体[官图1565](https://img.dpm.org.cn/Uploads/Picture/dc/1565.jpg)支持浅色端墙，`#b8b5a8`与隐藏面延续为拟合，未声称测色或整栋完成。所有几何、门窗、台阶、碰撞和正常渲染逻辑不改。完整World/跨区/人群、GPU/浏览器/手机和温度未验。旧R67硬编码git基线路径不可用不计绿，不替换其旧断言。详见[本轮范围](../../docs/current-state/r164-yueshi-sidewalls/RESULT.md)。
