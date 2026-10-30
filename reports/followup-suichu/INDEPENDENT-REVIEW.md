# 遂初堂双承盆固定候选独审

固定候选：5973f8e2e7c212eed4baee3b12e9ab6443324db0。src/release 对 9e2769b7 无差异。只读产品，未改源码。

亲看官方1533自身照片以及候选 relationship/basin CPU实际几何图。两件浅口厚壁盆、收腰支承、低方座有可见来源，现盆口略高于旧台，认可局部轮廓拟合。原多级台、支承雕花/凸瓣与真实尺寸仍未复原；不得称本堂整体完成、测绘或精雕复刻。

源码仅新增模块/hook及6源ID、2盆scope注册兼容；Collision add/update沿原同owner模式，无全局求解改动。scope后缘local−5.65未覆盖旧台。

独立命令：node --import ./tests/r141-fix/json-hooks.mjs --test --test-concurrency=1 --test-reporter=tap tests/followup-suichu/*.test.mjs

实跑10/10 PASS，102976.118519ms。日志 suichu-5973f8e-independent.tap。包括六闭体与真实三角、原几何/物理保留、有限身份守卫、释放、实际CourtKit.finish合批全部原三角F32保全、原方身落口稳定跳离、局部中央/侧路线及全静态中央往返。

限定：高落每帧oracle核新增6实体，host局部世界；另有全静态中央路线，不等价全场所有旧实体/完整路线验收。CPU图不等价GPU或手机验收。当前有限候选无独审阻断，标准/成熟资源/构建/最终冻结仍待写手完成。
