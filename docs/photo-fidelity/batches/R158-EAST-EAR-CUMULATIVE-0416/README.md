# R158 内阁东耳房真实入口导航累计

运行 `3011dbc2efa6f81e0e2f746abc7a1c2d993e957f`，父本地 a3802106 / 已回读远端5fb4d3ee。2生产源与4QA逐字等独审26481494；无新hook，不改建筑、门柱、碰撞或通用传送深宽算法。前批近域预载和地图纯地名以及节能模式全部保留。

## 实际问题与最小修复

父真实 Teleport.go 沿建筑中心 x=-182.4，240帧停在可见柱/右门框前，无法直接进入；同控制器经现门轴 x=-184.25 的阳性174帧通行。仅本体map增加structure/entryProfile，原地图中心、轮廓、名称、文字候选身份与未知旗不动；从原FIT/doorX生成门轴和8m外落点。Teleport精确识别并复用原explicit approach逐步碰撞/地面/LOS检查，无绕过和其它门面fallback。

驻留验证限定为OE已加载、唯一精确map/profile/frame、18原owner ID/数量、柱bbox及60三角数量，不宣称每次全面重验所有owner几何。缺本体不能凭地0得到认证。原72mesh/18owner/6168三角完整流保全由已审组件证据支持；本次没有添加实体或历史身份认证。

## 本次正常终态

16专项+原地图名3共19组件，再正常World1，共20/20、无skip。无prototype注入/私自预置阳性落点；实际go到(-184.25,-374.26)，朝门(-184.25,-366.26)，heading=[0,0,1]，approachVerified=true/fallback=false。沿同控制器真实朝向30Hz直入再返152帧全到、脚差0。原中心120帧仍挡，另一偏轴60帧尚在邻体处受阻，**不是耳房闭板的World认证**；闭板/加堵门由专项真实组件负控覆盖。

正常加载axis-courts/outer-east/ningshou（显式Teleport保原邻区加载），不是仅OE。源前后锁同；与作者固定点、落点、heading、到达/拒绝结果及152/120/60帧数相同，真实performance.now微差导致部分坐标不逐字相同，不冒称完整轨迹等字节。作者原World负例标签过宽，最终QA仅两标签改正的绑定保留，不覆盖原红。

662模块clean R158 `/gugong/`构建及verifyBuildSource通过。outDir `/tmp/r158-east-ear-build-0415`；buildId `R158-8a1cbceffc6e`，source `d72c8d33c6c7063f084d232324fa478778f920962a1fae2d6f9af099a72dabac`。没有整World全宫、GPU/手机/Mac温度或FPS实测；没有新ZIP/部署。原文渊.391与文华.444短时冲刺诊断仍保留。

## 可追溯性

作者README命令可直接用于本累计，EVIDENCE_DIR设新路径避免覆盖。VERIFICATION绑定2源/4QA/15保护，EVIDENCE仅登记6本地原件与2前驱原件长度/SHA，不上传raw。/tmp非持久；地图中心/正式名和内部未知身份界限不混淆。用户24B release原文保留，main/branches不写，保全部已回读版本可回滚。
