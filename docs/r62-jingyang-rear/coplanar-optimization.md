# R62-E 御书房格条面片无损合并后继

基准为已冻结 f1c71d4387ec95a47313001e9342f37cdcc6718e。旧 before/after 图片、几何 hash、local-contract 和初始测试报告均未改写。

## 实际改变

只修改 JingyangRearFacade.js 中 stripUnion 的发面阶段。输入矩形、原网格坐标、占据判定、所有窗/格条控制值、数量、厚度、轮廓、材料和 UV 均保留。

- 正面和反面：将相邻占据网格合成互不重叠的共面矩形，再每矩形发两三角。
- 外侧及框内口：只合并同一平面、同方向法线上的连续边界长面。没有删除背面或内口。
- 每窗 2924 → 624 三角；四窗 11696 → 2496，减少 9200（78.6594%）。
- 局部整殿 13656 → 4456 三角，减少 67.37%。51→57 的 mesh 关系不再变化，仍57。
- 所有非格条实际 mesh 属性/矩阵/材料/元数据 hash 保留，碰撞体、walkables、rooms、map、FIT 控制元数据也保留。

## 独立实际三角证据

tests/fixtures/r62-jingyang-rear/f1-actual-surfaces.json.gz 由固定 f1 commit 的 helper 导出，不读取当前 helper 来重写旧基准。它包含旧四窗实际 position/normal/uv 三角及其余实际 mesh 签名。

旧 helper SHA-256：2a1a0e1d1fb842d029606228d02b0e16455453b08edfe0f1bea9f8cc7c1886cc。
旧实际表面 fixture 解压 SHA-256：8dd94f214875075fb0b7d30f6ae88fbfe823dda22604d1d30de2d892e130115e。

独立测试从前后真实三角构建共同坐标划分，逐三角裁剪并计算每个有向平面原子面片的覆盖面积，要求每格恰好一次完整覆盖。四窗各1462个有向表面单元完全一致；面积约28.27553平方米/窗（模型拟合面积，非测绘值）。这个检查包含前后面、外周和每个孔口内侧，不是只比较 AABB 或总面积。

按全部实际表面单元的方向边抵消验证几何闭合，零剩余开口；验证每个实际三角非退化、绕序与法线同向、UV仍为相同仿射映射。此处“闭合”指实际几何表面，不声称 unindexed BufferGeometry 已焊接为拓扑流形。

每窗六方向各80条确定性射线，共1920条，比较所有穿越点距离与对应法线，不只最近可见正面。新增反例明确删除所有背面，测试必须因开口/表面差异失败，避免仅靠正视照片掩盖背面删除。

完整数值：reports/r62-jingyang-rear/optimization/surface-comparison.json。

## 三视像素覆盖

已实际查看优化后三视和旧基准新增斜视，全部使用真实生产三角及 HD albedo/UV 的局部 CPU renderer：

- 正面全景
- 南窗近景
- 窗框内口斜向近景

每视1200×900，共324万像素。三个视角前后均0变化像素、0最大通道差，PNG SHA-256也分别完全相同。前两视与 f1 原 after 图片 SHA 相同，原文件未覆盖。第三视补充近距离深度/框内口，基准从固定 f1 helper 新导出。

优化图：reports/r62-jingyang-rear/optimized/。
固定 f1 三视参照：reports/r62-jingyang-rear/f1-reference/。
像素报告：reports/r62-jingyang-rear/optimization/pixel-comparison.json。

这不是 browser/GPU 验收，也不提升原 partial 的史实认证等级。

## 已接 hook 后旧基线测试修复

原 fixture(false) 调 buildHall，在 owner 接入新 hook 后把“旧模型”也构建成五间，使原16柱断言变成12。保留16期望，已新增模拟已接 hook 的红测试并修正所有 before 路径，改为明确调用 buildHallBaseline。

tests/lib/r62-jingyang-rear-baseline.mjs 先验证 R61 的基线方法原始 UTF-8 字节，才调用它；局部测试再对原旧殿全部实际几何/导航签名核验。冻结来源为 R61 6b396800b6a03582aebf513fcef4966e9f5d0db3：

- 完整原 ZoneBase.js SHA-256：509e784a584139e976a929789734446a5a3fb6de0e3b448910d2315285bd9819。
- 原 buildHallBaseline 方法 SHA-256：a1cccce9b9a24fedb2ead4cb77e4bd1137e31a41bde4f8105402503886d85252。
- methodSource、字节数、原item、完整旧殿几何/导航签名均在 tests/fixtures/r62-jingyang-rear/r61-baseline.json。
- 红记录 baseline-hook-red.txt 保留“12 !== 16”；修正后模拟新 hook 仍生成16柱。
- render/report 的 before 也绕开 dispatch；新局部报告写 optimized/local-contract.json，不覆盖 f1 旧报告。

## 重跑

```sh
node --test tests/r62-jingyang-rear-facade.test.mjs tests/r62-jingyang-rear-optimization.test.mjs
node tests/r62-jingyang-rear-optimization-report.mjs
node tests/r62-jingyang-rear-report.mjs
python tests/r62-jingyang-rear-pixel-compare.py
node --check src/scene/palace/special/JingyangRearFacade.js
```

11项 focused tests 通过；原10/60Hz实际控制器路线及生产merge断言仍通过。未运行 fullworld、browser 或全量套件；本后继无共享/数据变动，无上传。
