# R158 近域流式加载与地图纯地名累计

运行 `3657bf5fe43e742165e0772c5e3aba208e39c045`；基bf6705/已回读远端5a086。用户地图显示修复与非地图实际性能更新合批，不单发地图。仅ZoneManager和Minimap两生产路径，精确等已审作者7c916a89/0912ab5；无新hook、建筑、碰撞或接触面改动。

## 近域调度

真实main `reuseInactive:true` 下，协和往返回外东路曾因拓扑neighbor无距离入队而重建400多米外宁寿。此CPU库cache拒留为unknown-texture-size/Infinity（不是浏览器纹理结论）；原几何54,327,360B也独立大于32MiB闲置预算。修正只限init初始邻区≤40m排队、onEnter保current/cache接回，近区交紧接的原update全区40m预载。显式ensureLoadedAt全邻区同步、loadAll、60m卸载/已加载邻区保留、8ms队列循环、silhouette与生命周期保持。

启动仍构造7个prebuilt，未激活远区可能保留更久，不能说启动变快/总内存降低；32MiB不是总内存。未修CPU库未知纹理识别，也未增缓存。

## 地图与交互

Minimap只用原it.name显示，不后加（旧址）/（外观）。原字符串有意义括号、targetName/mode/placeId、历史标记/详情/导航可用性不变。储秀门/长春门旧址原本仍可作为导航点，不能误说本次禁止传送；延禧宫仍外观地面观览，不开内部路线。独立资料说明、飞行虚拟停靠功能名未删除。三旧QA只更新用户新需求的文字/实际行数期望，其余断言保留。

## 本次正常终态

27组件（近域新6+旧cache/reuse/quality13+地图4+原净名4），旧marker限定1，正常动态World1，共29/29，无skip。marker文件其余测试未执行；完整钦安/旧R49字高全套本轮未跑，不包装全仓绿。

两次独立冷场，从OE(-145,-300.3)经协和到(-80,-300.3)再回，30Hz走跑2/1119帧全到、峰脚差0.13104596276716074、最高2.62、回地0，axis原真实坡台入坡前注册，OE→axis→OE有效。不是预加载静态回放：每帧原controls.update后原ZoneManager.update(camera.position)，manager真实时钟，仅controls.prevTime控制约30Hz。旁观包装build/take仅计数并原样调用/恢复，不替换调度或注入几何。

每场仅原7初建，宁寿等远区未激活/重造，仍保原silhouette。正确父重建次数8→当前7；当前回OE CPU update两样本约0.146/0.120ms，父约2403/2527ms。当前必要axis首帧仍约43/50ms，不能称所有帧无尖峰。真实计时微差使运动坐标不要求逐字相等；固定输入点/到达/脚差/注册硬门保持。初次误用reuseInactive:false数据保留在作者资料，最终比较只用true父样本。

这些是CPU功能/计时样本，不是Mac实机温度、耗电、GPU/浏览器FPS或真30FPS性能验收。保原节能UI/RAF后台暂停四源、前四用户修复、治牲导航和双扇，以及原文渊.391/文华.444冲刺诊断。

662模块clean R158 `/gugong/`构建、verifyBuildSource通过；outDir `/tmp/r158-streaming-map-build-0353`，buildId `R158-5e91e93aa62a`，指纹 `50eb5718b1c90b725f9705cdebd0258483012ea3bf310d83108da52ca0506e44`。无新ZIP/Pages部署。

## 原件与复核

命令见两作者README；正常World用BASELINE_REPORT=/tmp/r158-xiehe-streaming-main-0338/world.json.gz及新的EVIDENCE_DIR，不覆盖作者raw。地图保护QA读取本地bf6705历史Gitblob，净树远端不保证该本地祖先可达，不能声称远端clone直接可跑全部历史对照。EVIDENCE只登本地原件SHA/长度，/tmp非持久；不上传raw/研究原图。本后继2源/6QA/16保护精确pin，main03:52只读仍87ca，用户release24B原文保持，main/branches不写，保旧开发回滚版本。
