# 隆宗门有界梁面/两梢窗验证
父版 `3951b93`，范围见 RECON/DESIGN；不升级整门/全宫接受。

## 已完成
- `geometry-red.tap`：缺少整层构件的真实红测；`retention-layer-red.tap`：绿心被更近的黑盘遮挡的真实红测（另含已纠正的测试候选筛选错误）。绿色内盘现用独立私有材质层 -3.5，黑轮廓 -3、浅色花瓣 -4、金点 -5；不是靠创建顺序。真实TextureLibrary射线样本与最终合并层级相同，仅CPU验证。
- 专用helper仅绑定原运行锚点/朝向；非该实例直接不启用。源36条窗格、11梁面拥有者逐项核原box顶点、位置、旋转/缩放与原库材质；全部通过后才替换。共面值来自真实F32 owner面，不外加厚度、隐形面或新物理域。
- 其他三实际门及四朝向非原锚点泛用实例，所有原网格/物理/metadata与实际父SideGate一致。实际隆宗门除明确替换的36前窗格外，全部保留网格（含索引、UV/法线、材质、位置）与父版完全相同；colliders/walkables/map/structure相同。
- `verified-target.tap`：**73/81**（前次target-complete为71/79；后补两项生命周期/最终F32测试）。新专项与原门结构/通路、双坡及隆宗剔面/合并测试通过；实World三口、两坡接地、10/60Hz、走/跑/跳、双向全部到达并落地。不是GPU穿模验收。
- `parent-render.tap`：未修改原测试文本、仅以只读loader加载父 `3951b93` SideGate，**19/27，8失败**。候选完整组保留同8失败：协和/熙和旧source计数、旋转计数、siblings/ownership依赖计数，以及两项因前序evidence缺失的Object.assign失败。未改旧门预期计数、未隐藏这8项。
- 原剔面测试观察点现在位于本门构件替换之后、原共享剔面之前；去掉已被替换的已卸载盒体引用。隆宗实际source11994、剔除1334、注册box236、source mesh1024、合并bucket19；泛用旋转fixture仍原4014。窗条断言明确原后36，细节射线额外覆盖112新窗条，未降低射线门槛或其他断言。

## 成本与未验
`metrics.json` 对整个实际门而非单饰件：13→19合并mesh，3538→10660 triangles，339648→1023360 geometry bytes；colliders86→86，walkables3→3。CPU源对象1024，资源成本明显增加，未称性能优化。手机/GPU帧率、阴影、实际照片同视点视觉比对未做；不得由CPU材质/射线推导GPU验收。
完整反面、精细旋花/龙纹/雕刻、全部屋顶/斗栱、满文/书法/箭镞不在本轮接受；原主文全范围缺口不抹除。绘画与网格密度为原创简化拟合，不是历史测绘。

## 完整闭环结果
- `shared.tap`：完整共享组 **161/161**，302.30秒；R104四个原脏输出仅harness重定向到本轮shared-r104，所有断言原样执行。
- `legacy.tap`：外西导航/楼梯/邻居 **32/32**，32.14秒。
- `verified-target.tap`：73/81，30.42秒。新增几何生命周期和实际owner→最终合并流逐顶点F32严格共面均通过。初版生命周期测试误向CPU简化库读取不存在的materials cache（final-target.tap已保留）；改用真实TextureLibrary后整组重跑，并非只重跑单项。
- `parent-render-repro.tap`：冻结父SideGate与父测试文本重新实跑19/27，8.27秒；`legacy-failure-parity.json`逐项证明候选仅同8项旧失败。
- `zones.log`：`npm run test:zones` **exit2**，原Unsupported furniture-domain shape/reachFrom仍在；与寿康提交日志diff仅耗时/末尾exit标注，不新增几何警告，碰撞29487/支持1339均相同。武英/寿安等旧门净空失败保留。
- 36被删几何、全部live源和最终合并几何均恰释放一次，库材质不释放；私有6材质释放一次。
- 独立只读复审确认范围/测试迁移合理，未见新生产阻断；其F32/生命周期补测建议已完成。旧14报告前后哈希全一致。本轮所有source/tests/docs/reports增量小于1MiB，磁盘约1694MiB。
- 本地提交为本轮交付；不推送/部署、不动main，GPU/手机/原范围未接受边界照旧。

## 回滚
本轮为单一局部helper、SideGate窄hook及测试/说明。回滚本轮提交即可回到3951b93；不修改数据、共享算法或main。旧脏报告保留，不清理，不推送/部署。
