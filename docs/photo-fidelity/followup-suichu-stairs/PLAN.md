# 遂初堂南中轴阶梯和双斜帮 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL superpowers:executing-plans，当前唯一写手执行，资料/最终审查只读。

**Goal:** 在原.5m台高不变条件下，补源1533可证的中轴多级直阶和左右斜帮，替换现有入口直接跨.5的模型关系。
**Architecture:** 专用SuichuSouthSteps模块，模型参数单处定义用于实体和入口approach。7个模型细分踏步是真盒体/逐台实际顶面；2斜帮为真闭体斜面、限ID精确来源。仅新局部scope和两源注册，不改全局求解。
**Tech Stack:** 现有Three/CourtKit/FurnitureMotion/Xiqing接口和原身体控制器。
**Spec:** MASTER-PROMPT.md；官方本堂1533，原对象FC-E604D58704；父任务已确认可做MODEL_FIT且不改main。源0/1为同一图，不伪装双视角。

## Global Constraints
保台高.5、堂体/门/承盆/所有既有物理及R146-fix不变。7级、宽4m、run1.4m、双斜帮宽.4为模型拟合而非照片精确完整阶数/测绘。源底阶裁切，精确全阶数仍未知。只南中轴，不复制北阶/改整台。

## Review Focus
- 源阶数未明：必须持续标MODEL_SUBDIVISION、原比例不等测量；台仍低于源，不宣整台验收。
- 入口approach必须从真实阶前开始、真实落到原台；不保旧穿阶初态假绿。
- 7个实际面顶使用源F32高度；无隐形坡/救援/新平台，双帮closed有真支撑。
- 原承盆scope与新阶scope相邻/部分区域相交，需原盆落稳退出和新阶侧路实测，不能靠删既有物理避免。
- 局部脚踏/斜帮10/60Hz走跑正倒、空中落稳走离逐帧原身体oracle；若要新广域求解才能过，撤候选保红。

## Task 1
- [ ] 先写红：南阶metadata缺失、旧front approach不跨实阶。
- [ ] 新SuichuSouthSteps.js：一次定义width/run/n/edge；build+profile approach；精确profile/frame校验。
- [ ] RemainingNingshouHalls只suichu hook及front approach；Xiqing2ID和FurnitureMotion单scope兼容。
- [ ] 真7盒/2斜帮与来源面验证，原非目标geometry/physics字节保留，实际整区生产合批可见。
- [ ] 原身体入/出/空落/走离与原承盆回归，完整世界中央路线，不放宽容差。
- [ ] 同镜CPU图与来源图审，GPU缺口如实保留；必要标准/资源/构建和固定远端回读。父4b6f015894a8a4830007e53a4a6c8dce7ea433ea。

## 已观察红证与修正
- 首先无结构时测试红，随后首3接触/结构门通过。
- 增加保留性门发现新阶放在旧承盆前会改变承盆 source mesh index（几何本身未变）；已改为所有旧构件完成后追加新阶，使旧几何与原物理 JSON 均逐字节相同。不是忽略源索引变化。
- 测试首次误读 walkable.y/height；实际接口是 walkable.box.max.y，已改用真实字段，保留初始失败日志。
- 新旧有限scope有交叠，专门增加全15实体原方身跨域/落稳/跳跃退出门；不凭独立中心路线推断交叠正确。
