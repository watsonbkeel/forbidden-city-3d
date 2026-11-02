# R162 养性斋 FC-2C00D09F2A — 连续凹形两层最低外壳

基32d0107900094b73421e29c16686dffd83aca832。新增YangxingZhai.js与YangxingLandscapeFit.js，仅对GardenBuilder.js作经批准的精确景观让位接线；未改共享ZoneBase/release、原殿墙路、全局物理。御花园养性斋不是宁寿养性殿，亦不是长春乐志轩；wholeObjectAcceptance=NOT_ASSERTED。

## 本体证据/工程拟合
官文 https://www.dpm.org.cn/explore/building/236468.html：御花园西南，坐西面东，原7间、两端向前各接3间，凹形两层、转角庑殿，上层前廊、下层明间门与支摘窗。自身图 https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e997a9a7ab57.jpg 已亲看，明确两层转角黄盖/上廊/红柱窗；下部被真实叠石古树遮挡。不新造叠石/古树/器物/匾/内陈，也不把已拆曲流馆复建。

中心约(62,443)、坐西面东game-X、主7间14×3.6与两端3间前伸，为米制工程fit。完整屋盖是单一U联合足迹上的连续四坡粗形：base7.2/rise≤1.4、.12真厚度，闭合顶/底/边，无三段内向重叠顶冒转角。坡面/比例/窗色和未见低层闭门侧背均fit，不是实测；上廊仅可见实体，不注册上层walkable或楼梯，室内不开放。

唯一盒[53.3,64.9]×[434.9,451.1]Y9.1；最终实际bbox X[53.499999997,64.300003052] Z[435.5,450.5] Y≈0..8.600000381。实际57owner（55逐mesh三角+2低台阶Box）/2false顶，0contact/虚坡/room/map。.2平台9×14.8、.1阶.4×2.4真实同面。

## 条件授权与精确景观范围
第一次正常capture是**有景观占用**而非空盒：两草层+两内树owner、0其他主体/灯/顶/水；4/710现布局派生旁路到达峰0（x48,z433↔453、z429.7,x30↔50，各30走跑）。完整33发布树66部件逐矩阵/position/index同原34样本，既有绛雪pine停发不变。

父明确条件批准：完整新体与盒外oldCypress7真三角无交后，才让占地内两株已确认程序树及足迹床顶让位；随后另批窄接近条和程序石边开口。所有原件在/tmp/r162-yangxingzhai-capture-1820。
- 只停发cypress seed37，F32锚(58.7137031555,448.896270752)，及tallCypress seed53，锚(61.2389068604,437.110839844)。完整F32matrix/躯干树冠count/FNV在helper硬认证；全34随机采样和消费后才continue，原pine例外另计；最终31发布，其他31完整matrix/geometry/index逐项相同。
- 原程序oldCypress7锚(53.222427368,452.361694336)在盒外，89躯干+36冠三角实际碰reserve但不等碰新楼。连续壳初静算及补齐上廊后真交0；最终**8282可见三角**含真实窗面，71 broad pairs→SAT真交0。更北cypress锚(58.209938049,455.998718262)同保；其owner不在原盒，新体完全入盒。无删枝/移树。初shell-only-draft不冒完整终态，已留存。
- 床顶只裁实际足迹并集：[53.9,62.9]×[435.6,450.4]平台、[60.2,63.9]×[435.9,450.1]主闭壳足、[53.5,53.9]×[441.8,444.2]阶，以及另批[49.8,53.5]×[441.8,444.2]接近条。保.012底草，裁.29高床草；不泛裁reserve。
- 仅原程序西边[50.6,50.9]×[441.8,444.2]开口。实际正常GardenBuilder源几何（不是第二World）核条内仅底草1tri/床顶2tri/边6tri，0owner/top，完整66树AABB均不交，无独立灯/主体。原x48甬路边49.8原样。其余border分段保UV相位。
- 实际buildGround父/候选对照：原74/new75，72非目标mesh含几何UV/matrix逐字同，只1高床顶变、1边变2段。paths/beds数组相同；未将完整合并marble/grass流伪称全同。固定父GardenBuilder源由protected-source中的Gitblob与patch锁；不能在累计改源后直接借同路径当旧对照。

## TDD/实际通路/CPU
本体7缺件RED→7绿；景观2真RED（missing helper/66而非62部件）→2绿，中途stats旧公式报33红已保，只修减精确两树计数；ground1/tree-clearance1/local1绿，共12个有限轻项。唯一候选World1绿。World原log标题有继承Ningxiang字样，终QA只纠正文案为YangxingZhai，逻辑/产品/原件未改，不重跑World。

新路径(48,443)→(58.8,443)返，10/60走跑4/463，峰.1836666682；两闭面拒绝、最终native clear/feet0。候选World新4含end完整对象同local，旧4/710完整对象同capture；不是上层/室内访问。旧garden kit流前后完全相同仅加入新楼，**全球景观改变由上述单独授权/保护证据负责**，不冒全global物理字节同。

两CPU粗形已亲看。初CPU忽略产品已有polygonOffset，使共面窗红背遮挡，保初图/raw；最终仅CPU读取material.polygonOffset/factor作1e-4级近似bias，不按名称画窗、不改产品坐标或碰撞。单位/斜率并非GPU精确depth映射，图注显式CPU近似；不是GPU/现代实景验收。作者未全站suite/build，遵照有限授权；只正常累计build待关闭。

## 唯一正常集成
摘取3src：GardenBuilder精确补丁、YangxingLandscapeFit、YangxingZhai。所有旧finalizer后/finish前 `buildYangxingZhai(this.kit,this.kit.root.name)`；不动B/Collision/FP。
累计World副本改base/output，去全部loader注入及before/after/global捕获，以正常record/57owner/2false顶关口；原4/新4/两负控完整对象照作者。保31发布树及两精确停发/原pine例外。ground-preservation.test原父绝对路径目前固定32d，累计执行必须锁32d Gitblob原source，不可把已改累计当旧；可静承接其原件不重复。所有/tmp raw原图留本地，勿覆/上传。
