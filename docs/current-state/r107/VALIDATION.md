# R107 开发阶段：有界离区资源复用

这是 R110 累计大版本中的开发小阶段，不是独立合并 main / 部署建议；运行 release 仍 R105。基底为 R106 local f7766260 / remote 29078a34，用户已合并并部署的 main 为 1d264afe（R105）。旧分支由用户删除不重建；旧提交仍在历史中。

## 范围与实际收益对象
仅 main 显式启用 ZoneManager 的短期 inactive 资源复用。离区依旧移除 scene、碰撞 tag、shadow/灯与 onUnload；保存尚未释放的成品，再进入时正常注册一次。最多2个闲置区、32MiB已知几何 backing + 自有 RGBA8/mip 估算、120秒 TTL。未知纹理储存/源身份不匹配/过期/超限均拒绝或释放；待进入区先取回，然后按原活动区集合卸载，不为缓存减少活动邻区。

质量策略承接 R106：已加载建筑不热重建；离区旧档 east-six 不缓存，未加载/闲置旧档失效。宁寿、其他区不因质量字段改变而误销毁。普通 held navigation 原数组快照合同不改；局部 furniture/terrain/roof live owner 跨卸载注销、重入复建，新导航取当前源。

**不是首次加载优化，也没有解决 Garden 常驻构建。** 7区启动原先仍全预建；Garden 主世界常驻，不参与此闲置缓存。历史 Garden 约+182ms人工重建退化继续列欠项。首进预建区与释放后重返必须分开读。

## 已发现并修正的问题
- 待进入目标须先从 cache 租出，再处理旧活动区，否则同预算下可发生东/西互踢。未增加预算。
- LRU 按实际访问时间，不按同帧 unload 遍历顺序；录取先规划完整 victims，拒绝 incoming 不会半途丢掉仍有用的旧 entry。
- `f735a759` 原五对遗漏已合批但被 `builder.kit.root` 与牌匾记录强持的原构建几何数组：低档 east 额外7,139,844B、west7,620,156B。计时保留，但**原预算通过结论撤回**，目录 `paired-f735-incomplete-accounting` 不作为最终资源门。
- 最终仅缓存录取前调用 ZoneBase 专用 `releaseConstructionReferences`，清已完成构建图/牌匾构建记录，不再次 dispose，不清成品、owned、材质监听、noMerge/LOD、architecture 或物理/地图。初始预建/活动区原引用仍保留并完整计账。
- 计量覆盖成品、残余 source root/plaques、owned 材质贴图；geometry 按唯一完整 ArrayBuffer 而非 subarray 视图长度。32MiB是有界资源估算，不是完整 JS heap 或实测显存。未知储存数量另列，已知总量不是全部显存上界。

## 功能与独审
真实 east/west ZoneBase + CollisionManager 实际 update、TTL、质量切换、注册/注销/metadata/独立 silhouette/ShadowLOD 全过。宁寿完整模型实际因未知自有纹理保守拒绝缓存（其几何本身也超过32MiB）；三个屋面 held live owner 卸载归零/重建准确。普通旧 held colliders 与 R106 快照语义一致，不冒称全部即时更新。

源图释放独审：成品全部属性/矩阵/visibility/userData/architecture、物理/rooms/map 精确，真实延禧 LOD 保留，重复释放引用零 dispose，最终 live geometry 各释放一次。高档 source 可达数组减少 east7,682,628B/west7,620,156B；不同于低档 probe 数字。

真实养心 S GLB / InteriorLoader 最小生命周期：加载S→west离场cache只移B tag→卸S资源/tag/灯归零→west同实例复活仅B碰撞→最终scene/CM归零。这是显式生命周期压力，不是连续步行或GPU证明。

## 另一次已拒绝阶段：背景预载年龄错误
预算修正后的 bd80 五对：30次重返 median1449.720→1047.468ms，但p95 1973.387→2094.433ms、max2096.025→2380.754ms，首返东4/5更慢。root不接受只报中位改善。逐行buildCounts证明首返东仍重建，cache却保留未访问outer-east：后台加载完成时刻被错误当实际访问，预算不容两者时挤掉east。三分区RED保留并修为只实际current/进入更新年龄，未访问后台为0，既有真实访问年龄保留。没有增budget或改变活动区。

该旧五对归档 `paired-bd80-first-return-miss`，最终新五对必须包括全部首返与尾峰，若仍退化则拒绝，不继续参数优化。

## 最终性能
最终源 `aba575100aa7b7542fba8e3160b9fe0709c38136` 对 R106 `f7766260`，完整五对已完成，所有位置/脚高/loaded集合精确相同、最终scene/CM/cache归零。原阶段数值不得替代。协议为十个独立 Node 进程、同low、七区真实初始化与生产 Teleport.go；TELEPORT_SETUP，不是连续地面步行，不含常驻 Palace/Enclosure/Garden 整世界。每版均用同一完整资源计量器。TTL人工推进是压力，不是用户真实等待。

|同一协议指标|R106 → 最终R107（ms）|
|---|---|
|30次重返 median|1474.068 → 987.164|
|30次重返 p95 / max|2115.798 / 2184.977 → 1358.822 / 1432.334|
|首次返东5次 median / max|1897.545 / 2184.977 → 1304.626 / 1432.334，5对均快|
|7区初始化5次 median / max|4304.113 / 4505.462 → 4221.905 / 4548.429，**不称首载改善**|
|首次进入预建区10次 median|20.212 → 20.407，**不称更快**|

五对各自重返中位均下降；首次返东真实east buildCount从2→1，不是只看预算或字段。未缓存的axis、宁寿或outer-west仍有实际同步重建，所以依然约一秒且有1.43秒样本，不是无卡顿。全部原始10进程/30重返见 `reports/r107-lifecycle/paired-final`，统计脚本给各轮与最近秩p95/p99/max。

最终 inactive 最大29,048,756B，低于32MiB。两版完整初始/活动/闲置统计峰值均有 geometry backing199,456,918B与已知纹理估计63,713,328B，另1项未知储存；原预建占用没有消失。该总数按每entry去重后加总，跨区共享模块纹理可能重复保守计入，未知项未计，**不是完整实测显存或统一heap上限**。进程heap/ArrayBuffers全样本另存，不以GC后数值波动宣称泄漏修复。

root已接受这一限定重返收益及残余卡顿/首载限制，停止新优化。运行输入只4路径：main.js、ZoneManager.js、InactiveZoneCache.js、ZoneBase.js。Garden与任何碰撞/人物算法未改。

## 未解与未验
启动全预建/常驻Garden、其他过大或未知储存区重返仍需重建；不能承诺无卡顿。GPU、手机、真实Node20 NOT_RUN。GC后heap仍含lib/manager元数据等活引用，异常样本全部保留，不把其高低当泄漏修复证明。R110统一累计测试/三base/包与独立大版本发布说明；本阶段仅相关功能/性能/一次根生产编译 smoke。

## 收口身份
最终定向 **14/14**，独审最终四源 `source-aba575.sha256` 与候选一致；独审全文与原始小JSON/TAP已归档 `reports/r107-lifecycle/independent/`。只做一次最终根路径生产编译 smoke：source5219f43e/sourceDirty=false、4.50s，build R105-d2c49c7fa90d/fingerprint7b8510ae…，真实日志入Git；原75c阶段smoke外部留存不混最终。R110才做统一三base/包及累计184/全量，不用本次smoke冒充部署/设备通过。
