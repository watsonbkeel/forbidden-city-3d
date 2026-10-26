# R107：有界离区资源复用，不冒称首次加载优化

依据：R106累计f776；首次实测Garden常驻首建810ms、五次人工重建479–599ms，登记2.5–4ms；ZoneManager 7区启动预建3898ms、其几何约109MiB未加载仍保留；东六宫首次预建进入0.69ms，释放后重入547.6ms。单次诊断不当稳定性能均值。

## 决策与范围
只尝试解决**已访问区离开后短期重返重复构建**。Garden没有日常分区卸载，本版不缓存其已dispose GPU对象，不改山体/首建/通行。7区现有初始预建仍保留，首载阻塞未解决。总内存报告同时统计loaded、原prebuilt、复用inactive；不能仅讲新cache有界。

- 同一ZoneManager/library内，最多2个inactive区，**32MiB几何数组+自有纹理RGBA/mip估算合计上限**；这是工程上限，不是实测GPU总显存。对象/碰撞/JS overhead另记且不伪称全heap严格32MiB。
- 自有纹理必须计尺寸和mip；未知尺寸/未证明资源所有权不缓存。共享library材质/贴图不dispose、不复制；跨manager/不同library永不共享缓存。
- 距离卸载照旧onUnload、scene移除、CM removeByTag、silhouette显示；只将尚未dispose的builder/data保存，非缓存已dispose对象。
- 120秒inactive有效期，按最后离区时刻；每次update及访问cache时清理到期（直接命中prebuilt等路径最多到下一update）；无后台定时器。超预算或超数按LRU驱逐。已在当前buildQueue等待激活的缓存优先保留；若没有可驱逐项则拒绝新离区entry（立即dispose），不临时超预算。
- loadZone按旧prebuilt→未过期/匹配config身份与buildingQuality的inactive→新build顺序，同步注册一次；从cache取出即脱离其预算，绝不重复注册rooms/map。
- 仅east-six受R106低几何质量影响；质量不匹配即释放该inactive和旧prebuilt。其他区不因切档重建。当前loaded不动，离区后若其构建质量已过期则不缓存。
- 既有source所有权：zone配置实例身份不同则拒绝旧cache；运行没有热改同一config内部的API，不新增泛化源热更。
- dispose先正常卸载且不入cache，再释放prebuilt与inactive各一次；重入不得看已释放几何。保持onLoad/onUnload/ShadowLOD/人物导航与夜灯的原事件顺序。

## 安全与性能门
纯预算/LRU/TTL/未知尺寸拒绝、重复dispose与共享归属RED。真实ZoneManager两区+实际CM：scene/tag移除、重新注册数量/geometry/物理/metadata精确、held nav的局部furniture/terrain/roof live source跨卸载/重入无ghost；普通held数组快照与R106原语义精确差分，新建导航使用当前source、质量切换/队列无旧代复活。实际高低两档，S内景独立生命周期不被cache挂住。实际update地面位置驱动重返与必驱逐场景都测，不只直接loadZone造命中。

同协议R106↔候选5对：完整启动、首次进区、离区、重返、强制驱逐后重建；全部样本p95/p99/max和资源上限/GC后heap变化。不得声称首次/Garden+182ms解决；若收益不可信或内存取舍不获接受则拒绝，保留负证据转R108，不增加更大cache追数字。

## 实施接口取舍
`new ZoneManager({reuseInactive:true})` 由 main 显式启用；默认关闭保留既有独立调用者/原质量测试的释放合同，不悄然改变所有工具。新增 main 一行是批准生命周期接入，不触碰 Garden/physics。
在 `onEnterZone` 仅真正的新当前区有有效缓存时先同步正常loadZone；之后原update卸载规则不变。此时 onLoad(目标) 可早于 onUnload(离开区)，是有意的同帧所有权交接，最终scene/CM必须精确；目标暂时与原活动区同在的峰值资源单列。邻区活动集合不为cache删减，原无cache路径完全不变。

42ed05cf：全7区实际Teleport功能诊断发现同帧多区卸载的迭代顺序可反转真实最近访问顺序。新增lastUsedAt只在实际load/当前区访问更新，cache按真实last-use驱逐，拒绝较旧incoming挤掉较新entry；离区TTL时钟仍单独记录。没有增预算或改变实体。

### 收口发现：合批构建源引用与预算（2026-10-26 15:04 UTC）
- 原 `f735a759` 五对计时真实，但资源计量只遍历成品 group，漏了 builder.kit.root/plaques 强持的已 dispose 源几何数组。实测 east 额外 7,139,844 B，west 7,620,156 B；旧32MiB合格声明撤回，原样本作为阶段证据保留。
- 仅已卸 scene/tag、准备进入 inactive 的完成 ZoneBase 调 `releaseConstructionReferences()`；清构建 root.children 与 plaques，不调用 dispose，不改变成品、noMerge/LOD、owned/ownedTextures、architecture 或物理/导航/地图。初始 prebuilt/active 不改，未知 Builder 不强清。
- 计量包括成品及尚存构建图/牌匾、owned 材质贴图；CPU geometry 按唯一 ArrayBuffer.byteLength 计（保留完整 backing 而非视图长度），texture 为 RGBA8/mip 存储估计，不声称实测显存。未知仍拒绝。32MiB、2区、120s不增。
- 原五对不作修后成本依据；修后重跑同协议五对，明确启动仍保留源图以及完整总资源口径。

15:15 唯一性能诊断修复：bd80完整预算后五对重返median下降但首返东4/5更慢、p95/max退化，root拒绝直接纳入。原始逐行buildCounts确认首返东仍miss：后加载的outer-east预载被赋新lastUsedAt，挤走真正访问过的east-six。新增三区域RED先复现；仅current实际load/onEnter才赋访问年龄，未访问后台load为0，既有实际访问年龄重取时保留。预算/TTL/加载集合不变。原五对保存 `paired-bd80-first-return-miss`；修后须完整5对含首返/尾峰，不只宣称命中。如果仍不能达到目标则拒绝本模块，不追加预算/第三轮参数。
