# 整亭、真实表面和原路连续
既有授权直接持续原文整区，沿用Three.js/原生Node，不新增依赖、无需再设计确认。
选独立东井亭整亭：四柱方框、方转八方承梁、开放中央天井的八瓣闭合屋壳、覆石盖井口、低台与白石栏，独立私有淡蓝绿枋心颜色为简化拟合；真实开放孔不补看不见的整片顶/隐形面。1.94m柱轴间距取官方，其余比例依照片拟合，精雕/花画/隐蔽栏面/井盖形态不称精确复刻，不挖无证地下井。
拒绝：只补一块牌或彩画；无依据按young透视地图直接定位；以通用八角攒尖亭代替方四柱/八方盝顶；同时镜像西井亭；用新碰撞重排全园树。
构建放在garden独立profile钩子，保留全部原items/静态树采样。局部地面裁床并补双侧环行铺地，保留其余地形。所有新增可见盒体从最终F32顶点注册；曲面/八瓣顶各以真实三角面注册，保留中央通天空孔。只加本体严格域和真实Environment地面witness，必要共享改动限显式kind路由，不改运动算法。必须做all-height邻域调查，不能纳入邻亭不兼容shape后再放宽校验。
范围验收为本井亭完整工程构件和局部路口；精雕、全景完整内视、地下结构、当前开放政策以及GPU/性能未验。地图和定位标明确PHOTO/MAP_FIT，不称整个御花园或整物历史验收完成。

## Audited implementation refinements
- Exact additional column dimensions .28m diameter / 2.43m height come from official 黄希明 page24. Original span stays1.94m.
- Four diagonal beams now center on four actual columns; four more beams hang outside the column square to close the load-bearing octagon. Beam depth/roof heights remain photo fit. Red soffit is separate from yellow exterior, no new material-array/vertex-color merge policy.
- Plain square covered-well slab is an explicitly unverified neutral outline; no water/depth. Four-side low rail is conservative enclosure with hidden entrance unknown, not proof of historical closure. Coarse vase/leaf-profile rods only, NO exact dragon/lotus/floral reproduction claimed. Current beam paint is a subdued color field, not authenticated detailed floral panels.
- Garden ground and runtime profile are one atomic source change. Disabling only the JSON flag is NOT the supported rollback; revert the whole commit to restore old beds and remove all new physics. All34 trees and original2034 GardenBuilder colliders remain exact.
- Ground physical paving is built by EastWellPavilion from visible solid boxes; no separate GardenBuilder paving owner or invisible rescue plane. Ground helper clips bed renders only and preserves texture phase on retained edge faces.
