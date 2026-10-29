# 延寿堂后房—天井—穿廊 CPU 闭环（GPU 未验）
基线 `9a246a9637d9a7a749c9ee69544ab8a7a313c304`。原文 FC-F6D065A79B/第768行，官方236545文字与实际查看8365侧图，见RECON。没有可确认室内照片；本轮不宣称整院历史细部全部复原或现状开放。

## 实做边界
保留原三卷前房屋顶、柱、南门/窗、台基/地面及原主入口路径，给三层原后墙（墙体/勒脚/纸护墙）同步开东次间接廊口。补三间一进深后房、真实露天天井、东次间穿廊、可见下庭院阶、后房东侧闭花窗及简化砖窗罩。没有把原单厅硬压缩成整院；模型拟合后房94.5..98.5、庭院90.5..94.5，方位与官方一致，尺寸未测。既有西花园墙原样，不另加来源不足的平行墙。

屋顶为实际灰瓦卷棚源面（两组完整表面），所有新闭合盒按最终Float32源绑定；新增地板的支撑来自对应可见实体，不向露天天井铺隐藏平台。新源全部避开其他对象实体，并保留东侧x274纵向绕行、北侧z100横穿及原揽胜→咸若馆路线；原西园墙阻挡仍在，不强凑西域出口。

## 运行与保护契约
严格后部域只为已复现generic入源实体反例：x274.6..285.4,z89.1..99.8，唯一真实接廊地板锚定。新地板顶Math.fround(.4)=.4000000059604645，旧前房datum.4保留；不调共享step/sweep/SAT/tolerance。补充楼地面见证仅唯一live旧前房floor/实际live Environment，新增源实体正常提供支持。重复、降级、移动锚、假地面/变更地面、删除/卸载、reload均有测试。

前房room保留南口并新增真实东次间后口；真实穿廊注册前/后/庭院侧三口；后房注册连接口；露天天井不注册成室内。地图包络覆盖新后部；UNKNOWN室内物件政策保留，room安全spawn依真实支持检测。其他对象由实际父RemainingOuterHalls与父ZoneBase（非仅切开关）全区排除本目标后逐项比对：渲染、完整collider元数据、architecture/nav、rooms、walkables、map/regions相同。

## 证据
- `shared-final.tap`: 完整共享 **161/161**，310.06s，无跳过/取消。
- `legacy-navigation-stairs-neighbors.tap`: 完整旧导航/梯/邻居 **32/32**，32.54s。不是单项重跑代替整组。
- `zone-lint.log`: 实跑 `npm run test:zones` **exit 2**，仍在reachFrom报既有 `Unsupported furniture-domain shape`；相同基线异常已保存在父版本cining-gate/zone-lint-baseline.log，不称全区lint通过。`zone-schema.log`: 7区0错误/9既有边界警告。
- `specialized-final.tap`: 延寿24 + 慈宁24 + 寿安26 + 慈荫26 = **100/100**，89.64s，无跳过/取消。
- `world-first.tap` 3/3为早期实World路线；最终组覆盖其后room修复及新增西墙堵挡/World门验证。
- `retention-first.tap` 2/2；`neighbors-first.tap` 1/1；`owners-handoff-retention.tap` 8/8；实际两屋顶/天井12m高落10/60Hz、NPC站坐/变姿/移开、.3/.5generic、可达边ULP/.01/.25双向及10/60Hz均在最终组。
- `source-first.tap` 及最终组：每闭合盒12向外三角及流形边计数；两屋顶实际每mesh每triangle双向源映射、遗漏0、最终merge同源；真实TextureLibrary私有材料、灰瓦色、共享材料不变，无复用寿安私有顶点色标记。
- 11源/脚本语法检查通过；源码diff检查通过。无默认 `npm test` 脚本；未生成大bundle/GPU截图。

## 原始反例保留
`geometry-red`缺复合院；`floor-source-red`地板底Float32负尾改为源顶点ground clamp；`contact-first`接界旧.4对新F32顶的实际全身穿入→有限域；`contact-scoped`测试把后房起脚仍设旧.4而落入新源内，fixture修为actualF32，不改solver；`prune-red`原后墙顶点/材质漂移无保护→先验证后拆；`metadata-red`地图/旧front-only声明；`room-doors-red`审查发现前房room门口缺失→同步真实开口并World核验。所有失败日志原样保留。

## 成本和未验
`metrics.json`/metrics脚本是真实父整延寿前房 vs 当前整复合院：合并meshes **12→13**，triangles **8890→14370**，属性/索引字节 **853440→1379520**；raw meshes125→186/raw bytes309068→486844；colliders25→60，walkables1→5，rooms1→3。只是CPU几何规模，不等于GPU帧率/显存或手机性能；GPU视觉/性能仍未验。

后房不可见正面采取明确简化墙/接廊接口，不称其精确闭窗现状；花窗只表达闭窗与砖罩关系，未造未知细花。步步锦纹样、内檐落地罩/圆光罩/炕罩与完整银花纸样未复原；原前房纸面仍旧文字类型拟合。前房旧屋顶/柱全部逐面物理未验，新源验证不能替代它。含清斋后部/揽胜门冲突留待独立核查，不顺手镜像扩建。慈荫旧东梢北地面出口、全区geometry lint既有Unsupported furniture-domain shape及其他旧失败均未抹掉。

本地独立提交可回退到9a246a96；无推送/部署/main修改，14份原脏报告不改。源码hash见metrics。

独立只读最终复核：无剩余实质代码阻断；room门口缺口已红→绿并在World验证；未闭细部、不可穿西墙和GPU未验均继续保留。最终磁盘约1723MiB，增量源/测试/日志小于1MiB，未生成大产物。
