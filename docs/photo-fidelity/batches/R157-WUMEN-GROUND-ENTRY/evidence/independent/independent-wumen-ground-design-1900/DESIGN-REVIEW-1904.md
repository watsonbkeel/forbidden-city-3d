# 真实试验地面与两个授权子区域：设计只读审查

**结论：1902修订方案及1903计划可进入有界TDD，但本报告不证明实现或路线已通过。** 这里“真实地面”仅指已有可见封闭test-ground组件的实际几何/物理顶面，不是实际Environment、历史午门地坪或测绘标高。实际World安装、建筑接缝和release-to-air仍不批准。

所读并比较的最终设计：`GROUND-ENTRY-DESIGN-1902.md`，SHA256 `3afc46a1d4337b12b9647fa7495937e7fd1f8c3a477b272ba7b8ef75b576ae8a`；计划 `GROUND-ENTRY-PLAN-1903.md`，SHA256 `ba00067b6cfc73672719c177c2a69ef21a259e423bde19a283739f81b948633c`。原1856文档保留，其零物理增量歧义已由1902明确更正。本审独立几何结果在同目录`patch-geometry-audit.json`；没有新provider实现、控制器运行或World。

## 真实源与平面口径

原 `test-ground.mjs` 创建220×.25×80封闭BoxGeometry，范围X[-110,110]、Y[-.25,0]、Z[-40,40]；24位置顶点、36索引。ordinary collider来自实际geometry bounds；flat box支承范围Y=[0,0]，rescue=false，其Box3并非empty，符合CM实际addWalkable登记口径。

对两个独立entry，拟授权其北边外2米真实顶面子区域：

| 区域 | X范围 | Z范围 | 高程 / 与entry共享宽 |
|---|---|---|---|
| east | [-70.1574503311,-63.6011589404] | [17.8642384106,19.8642384106] | 0 / 6.5562913907m |
| west | [63.4687086093,70.2899006623] | [17.5993377483,19.5993377483] | 0 / 6.8211920530m |

两子区域均在真实ground顶面内，彼此不叠，且与原14坡体没有正面积覆盖；与各entry实际北边连续、端点高度严格0。原北起点maxZ+1的完整.5足迹可放在对应区域内。2米长度是授权窗口工程选择，绝不是照片/地图量得的历史平台尺寸。

## 必须区分“复用已有源码”与“物理输入不变”

现有内部16 driver只创建rig，没有实例化或登记test-ground。下一ground-entry fixture首次加入地面时，相对旧内部rig应如实记为 **+1可见ground mesh、+1ordinary collider、+1box walkable**，即复用已有模块产生的新实际实验输入。

所谓“两个patch不新增物理”只能指：这两个authority区域共享同一个已认证ground witness，不应各造一个隐藏mesh/box/ramp/walkable。不能据此声称整个下一轮物理与旧内部16完全不变。1902已准确补上这一分母，后续实现/报告应继续保留。

## 为什么不把整ground顶面加入高处coverage

本审对东西neck和receiver分别删去一件，在其中心用完整.5足迹计算：
- 其余原坡体加**两个限定patch**，四个高处缺口均不能被覆盖；
- 不加高度资格的whole ground XZ矩形，却会覆盖这四处（高约12.1/12.3m）投影。

这是几何反例，不是新Motion已正确实现的证明。实现时只允许实际共同边和匹配高程连通；不可把整块ground、隐式getGroundHeight=0、普通底部box或“最大可用高度”偷加入高处缺面的足迹证据。已有CM内ground实际存在，不等于其整个顶面都被授权参加该局部provider的图。

## 实施前硬约束

1. **认证whole witness，不只认证patch bbox。** actual Mesh/索引/全部attributes/groups/drawRange、普通渲染通道、材质模板、祖先成员/矩阵/可见性，以及实际ground collider和cloned flat支承行的完整字段/唯一身份/tag均锁定。真实可见顶面、ordinary body和rescue=false支承需三者一致。
2. **一物理owner、两固定authority区域。** 区域从已锁fit推导，不接受调用者任意边界；禁止隐藏增行、借别的world floor或通过复制ground行伪造两个owner。认证/查询不改变源mesh或CM数组。
3. **域不随缺失缩小。** 对已经opt-in的binding，其地面被移除/隐藏/换行后，预期区域仍固定，域内必须INVALID/诊断失败，不能缩成OUTSIDE后回旧零地面。既有无ground的调用合同仍应保持；无注册默认旧行为与“已注册后来源失效”要明确区分。stale token跨撤销/重注册仍检查代际。
4. **负控必须包含低层诱饵。** whole ground仍存在时，删neck/receiver或抬高/下沉/错owner，不得接受高处静止与穿越，也不得仅因下面有Y=0地面便松开高处约束。新序列应同时测真实北边双向、ground缺失、部分足迹、薄障碍及错代际。
5. **窗口边不是墙。** 北/侧授权边只是实验范围，不能加看不见的挡墙；尚不支持跨窗边、空气/跳跃/失足释放时应明确诊断失败，不包装成真实防坠或实际地面不可走。
6. **新真实FP输入仍须可追溯。** 起于地面真实top0，走/跑×10/60Hz×双侧双向，完整footprint、raw body、ground/feet/onSupport/airborne/竖速、实际输入与最后1秒停止全记录。只能初始化一次，禁止逐帧改位置/速度、时钟或共享半径。保留全部旧严格0/16与内部/停止轮，另立新ground-entry分母。
7. **门禁不得继承。** 索引1900修订需先闭合并冻结；新ground功能要重新执行相关auth/motion/handoff负控、非目标920行A/B及旧55控制测试。它们仍不是全World、原full/batch或真实门楼完成。

## 1903实施计划的额外审查边界

计划将普通Mesh/祖先/材质检查提取为共同helper，这不是纯固定数据步骤。应先保原owner12+index5基线与历史反例，再单独审核提取后的原ramp严格合同；ground可使用indexed Box，不意味着ramp从此允许index、其他drawRange或更多渲染通道。两种canonical几何验证须各自保持完整。Task1数据通过不授权Task2/3；每阶段新source/freeze都不能继承1900认证结论。设计开头提到1854只是早轮身份，当前索引有限批准以独立1900报告为准。

## Task1固定数据小层（不含Task2认证）

随后只读核 `ground-entry-1904/task1-freeze-1904.json` 四路径，SHA全匹配；独跑ground-witness **2/2、exit0、189.929809ms**。新的WumenJointGround.js仅导出深冻结常量，未被运行source引用；两patch/共边/地面包含关系及实际fixture **544→545 collider、14→15 walkable、14→15 mesh**保全断言通过。这里的“visible”是实际Mesh可见属性/完整原地面几何，不是World场景或GPU显示证明。仅固定数据/fixture计数可进入下一阶段；ground权限未实现，Task2共同surface提取/认证不在本结论。

## 分级

P0：设计静审未见必须取消此有限实验的结构矛盾。
P1：上述认证、来源失效、低层补洞负控和真实路线尚未实现/实测；未通过前不能升级安装或建筑验收。
P2：2米窗口和工程ground范围非实测；需准确说明新增地面实例的物理分母、两个patch本身无新增物理，以及人工边界的诊断性质。
