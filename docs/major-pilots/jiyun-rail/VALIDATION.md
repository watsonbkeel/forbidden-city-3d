# 慈宁花园吉云楼上廊前栏垂饰验证

基线 `38cfafe26e522c2ff2a5ae92f10e258f551ea7de`，本地开发分支。官方[236483](https://www.dpm.org.cn/explore/building/236483.html)与[正面照片](https://img.dpm.org.cn/Uploads/Picture/2024/06/18/s6670e8aa8f637.jpg)已实际查看；1428×1131，摄影日期未知。不是建福宫同名楼。图像支持绿色宽头、浅色收尖体及金蓝分色的关系，尺寸、厚度、曲线与45次重复依旧模型拟合，非逐件测绘；不认定纹样名、木种或工艺。下部彩绘板、端栏精雕与整楼关系未复原。

## 实作与保留

47根原前栏直棍保留；45内部位置各增4件，共180真实闭合挤出几何。柱边两端不外扩。所有彩色件都经双向射线证明与原直棍共享实际内部点，不是悬浮贴图。上栏、下栏、端栏、柱、两层门窗、屋顶、平台、室内与完整g对象均保持；无新楼梯、自动上层目的地或walkable。每个新几何独立对应最终合并Float32源面，逐件闭流形、非退化、数量/连续source索引全覆盖，每owner面在实际合并render中精确匹配。原AABB全部保留，不称它们突然变成逐面精确代理。

初版triangleSupport的`feet+1e-8`路径让60Hz退出产生约4.99e-9正侵入，明显大于3.91e-12舍入上界；失败证据保留，未提高Oracle容差或裁身体掩盖。最终180个源面owner使用既有XiqingRoofSurface严格算法；新分派仅吉云栏区、仅显式PLAYER feet>=3。原台基锚点与唯一live原上层4.8楼板来源强绑定，支持查询受maxTop约束；原薄楼板proxy顶4.65不能抢占登记4.8。无新隐形面、没有修改共享SAT/扫掠/容差算法；普通NPC与下层仍原solver。限定域及半径扩张范围在完整World中做所有高度邻居清点，未发现不支持的triangleSupport/overhead；不通过过滤或box化忽略邻居。

## 验证证据

专项最终：`node --test --test-concurrency=1 --test-reporter=tap tests/major-pilots/jiyun-rail/*.test.mjs`，**16/16**（specialized-final.tap）。
- 完整World 10/60Hz顶帽/尖体/重叠高落、走/跑/跳、两侧退出到原上廊；每帧完整脚到头AABB对所有新实际三角做独立正侵入Oracle，没有脚部缩减。
- 真外侧x273.67，3±ULP、2.9999/3.0001、10m起落，速度-30/+6.7，共24场：仍落原.6平台，不被吸到4.8；落稳点第一可见向下射线复核。
- 仅PLAYER权威脚高触发、域角与高速横跨分派、缺失/重复/错位live楼板拒绝；重复注册、锚点变更/降级、按tag卸载重载。
- 旧栏顶约5.78与原4.8楼板各做站/坐NPC、10/60Hz落体；不得伪落地/重置跳跃，姿态变更立即生效，移除后落真实支撑并退出至4.8。
- 原物体与导航保留、慈荫/宝相共享builder开关隔离、180源几何与最终合并geometry和4材质卸载平衡。

独立审查先运行轻量8/8；随后复核新增动态人物、源面反向数量/索引和实体连接证明，解除原门禁，无新增代码阻断。专项日志不是像素或GPU验收。

## 诚实边界

完整方脚使local z=-6.36高落接到原栏，而旧圆脚支持未接到；此处向内退出到4.8楼板，不强迫降到.6或放宽射线验收。真正外落另由24场证明。原下层内侧已有可见overlay .62与物理datum .6差异，父版复现记录保留，未修复；不可把本次新垂饰安全结论写成整楼物理验收。

旧脏报告14份保持，不纳入提交；无完整构建、资源打包、截图复制、推送、部署或main修改。CPU几何计数见metrics.json；未做浏览器同视角before/after或GPU性能，`VERIFY_PENDING`、`acceptedWholeObject=false`。

共享串行回归 **127/127**（shared-regressions.tap）：r100-xishang-movement、r100-xishang-stone-rails、r104-roof-surface、r104-roof-prefix-equivalence、r104-roof-integration、r104-xiqing-motion、r65-pedestrian-controls、r91-terrain-vertical，以及major-pilots/xishang、jingqi、changyin全部*.test.mjs。命令使用`node --test --test-concurrency=1 --test-reporter=tap`，174秒，无取消/跳过；未重跑全current-state或全major-pilots。源码node --check及限定源/测试/docs/scripts的git diff --check通过。

`node scripts/major-pilots/jiyun-rail/metrics.mjs`：原211 collider不删除，新180，合计391；walkable3不变。raw mesh2374→2554，merged mesh12→16，三角32872→44212（新增11340）。记录6个生产源文件SHA256；这是CPU结构成本，不是GPU性能验收。新源、测试、脚本、文档与日志总量约200KiB，未产生大构建产物。
