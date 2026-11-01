# 箭亭南面可见灰蓝分区：独立候选，不是整箭亭验收

基线`8564214293cf7ab028f19668097fc79f8c4b360a`，本树detached；与父级81e/856生产源码口径相同。不创建/更新开发branch，不改main、共享入口或部署。原FC-AF36D75128及所有未完成特征继续保留。

## 源图 → 差异 → 有界实现

[箭亭自身南面官图](https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d4c87b554a.jpg)，来源[建筑页](https://www.dpm.org.cn/explore/building/236578.html)。1425×1068，SHA256 `e7f98442e7236e082d9713e9572d3576c3148314c07cdbd1135304c5309c6225`，拍摄日未注明。本轮亲看全图与仅裁切放大的中央檐下像素；裁切仅供私有观察，未重绘。照片可见中央及两邻间门头/梁面灰蓝底和深蓝有框画域；两端树遮，不推广。

原模型相应门头为整块红面。新`ArrowSouthHeadBands.js`只替换三块南门头及对应南外梁跨度的外向表面：素灰蓝底带/边框、深蓝画域。**不复刻不可清辨旋纹、花瓣、文字、颜料或精确构件尺寸。** 原高2.9m门头等包络是继承工程fit，本次不变形，因此仍有原比例差距，不宣称已与照片完整匹配。

- 三块内门头南面`local z=-6.92`；外梁仅`x∈[-8.25,8.25]`、`z=-8.975`。
- 原四面共8三角被分割；其他五个面原position/normal/UV逐顶点保留。外梁两端红面单独保留。全部素色块同原平面，面积54.45平方米为**模型数值**，不是实测；不加突起/叠皮/假洞。
- 北面、外梢间、全部门叶/已修南次间棂、两肩、柱/屋面/地坪不变。87碰撞、3支撑、1room及regions/map完整hash不变。
- 实际局部合并前262→264 meshes；6462→6524三角（+62）；17→19材质（两个私有不透明无贴图材质）。不是GPU draw call/帧率或内存测量。

## 终结器与精确集成边界

调用`finishArrowSouthHeadBands(kit,zoneJson)`：只消费真实outer-east的具名hall声明（同名region不是第二实体），匹配唯一直属已完成frame。无目标区no-op；错误/重复声明、缺失/重复host、错源几何或资源共用拒绝。原子离线分配→提交；退休资源回调异常标`committed=true`并继续清理四件原几何，不假称回滚。

唯一集成人使用`PROPOSED-SHARED-HOOKS.patch`：ZoneBase加一import、在现有专属finalizers之后/`kit.finish()`之前调用一行；**本树未应用该patch**。

不建议在EnclosedPavilions构造中加hook：旧before fixture会有意剥离旧门棂/牌hook，新功能应在完整源注册后独立收尾，不能污染历史before或放松guard。没有修改任何旧fixture/断言。

## 验证

新14项＋既有54项共**68/68**。命令：

```sh
node --test tests/r158-arrow-south-head-bands.test.mjs \
 tests/r158-arrow-south-door-lattice.test.mjs \
 tests/r158-arrow-south-nameboard.test.mjs \
 tests/r158-arrow-south-lattice-atomicity.test.mjs \
 tests/r59-arrow-baseline-fixture.test.mjs \
 tests/r59-arrow-south-knees.test.mjs \
 tests/r59-arrow-knees-world-consumer.test.mjs
```

覆盖实际表面面积/法线/视点射线、灰蓝画域移除/移动负控、非目标逐对象保留、共享Line几何拒绝、冻结/继承setter、离线分配失败、挂接后异常回滚和退休异常；10/60Hz正倒走南北门及双侧廊真实控制器通路保留。普通完整outer-east通过正常ZoneBase生产构造；QA只在正常finish边界预演这个新终结器，验证真实合批2新材质与原全部物理登记相同，不冒称本树已安装生产hook。

RED原件保留：缺功能10红；缺末端函数红；伪造声明未拒绝红；真实outer-east的同名region被误计为第二hall导致1红。末项经`kind==='hall'`过滤修正，未删region/断言；最新68项全绿。完整日志只在私有兄弟证据目录，不上传原始测试报告。

实际当前局部生产几何＋项目albedo/UV/atlas，同相机宽/近两视点before/after共4图已看；`CPU-PROOF.json`绑定本次源字节、相机、几何与图片hash。CPU不是WebGL/PBR/真实照明/手机验收。未重试已知浏览器socket权限阻塞。复现：

```sh
node scripts/photo-fidelity/batches/r158-arrow-head/cpu-diagnostic.mjs /tmp/r158-arrow-head-cpu
```

本树未跑全仓current-state/World/三基址build，以独立轻量检查交唯一集成人合批。新模块浏览器ESM打包与语法检查另见EVIDENCE.json；不能用它们声称整站build/GPU通过。

## 不覆盖的范围

精确彩画、横披透空/细格、门头与门叶比例、侧后面、树遮梢间、牌/设施、台基/栏杆、室内及现代展陈、原对象整体接受状态均未关闭。仅实现有据可见色类/分区，不修改原41项分母，不以本包冒充R158完成。
