# R162 延晖阁 FC-7E30C9E212 — 三间、外观两层最低闭壳

基线 `35f23bffd8496eed0492db952e6954e6e2bad477` 已含绛雪、位育、摛藻。仅新增 `YanhuiHall.js`，未改共享 hook/release/任何旧 src/data；整对象验收 NOT_ASSERTED。

## 官文、自身图与拟合
官网 https://www.dpm.org.cn/explore/building/236489.html 明确御花园西北、北墙、南向三间黄歇山，外观两层、内有暗层，明间六扇/次间槛窗，上层周廊。自身图 https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e998976b7450.jpg 已亲看（/tmp/r162-yanhui-own.jpg）：六扇闭门、两侧窗、黄色腰檐、上层栏柱与暗窗大形。前景古树不造、不删；不建匾/细格/彩画/室内暗层或楼梯。

工程fit：中心(31.8,514.5)，三间9.6×3.6，朝南；上黄歇山base7.5/rise1.8/overhang.5。腰檐为四片真实闭合斜板环，不以完整隐藏屋盖穿进上层房间。上廊有真实可见楼板、栏杆/柱和对应三角碰撞，但**不注册上层walkable、不提供上楼路径**。所有尺度、楼层比例、藏侧背和粗色/窗格均拟合，不宣称测绘/现代开放/逐面验收。

完整实际bbox X[26.084549236,37.515450764] Z[511.768338919,517.231661082] Y≈0..9.632399559，锁唯一盒[25.9,37.7]×[511.6,517.4]×[0,9.8]。.2平台10.4×4.2与.1阶2.8×.4各真Box及rescue:false同顶；下层闭面local z=-.9，外部前台可达。

## 唯一正常先验与保全
原件 /tmp/r162-yanhui-1753/scan.mjs、scan.log、scan.json.gz。实际资源，loadAll:false，garden/west-six/axis-courts与global驻留，不称全城/GPU。
- 94,492旧三角（包括实例树matrix），旧可见/owner/top/water交叠0；288 body样本0。扫描Y≥.04，保留原草.012/铺地.028，不称地面柱全空。**无景观裁剪。**
- 钦安旧源北檐z500.63，原平台北边500.28；本轮原布局诊断x17,z507↔515及z509.3,x20↔45均不穿该体，30Hz走跑4/590到达峰0。这是现plan派生，不冒历史QA。
- 必要(31.8,509.3)→(31.8,512.65)返30Hz走跑2/73是建台前地0证据；建台后同输入到达但不要求脚轨迹相同。先验总6/663。

## TDD和有限终态
missing-builder真RED7→组件7+local1=8/8绿。唯一中途QA红是模板数字替换把单殿后墙目标515.5误写519.8，实际向外走；保local-qa-coordinate-red.log/json.gz。仅恢复后墙目标515.5，未改产品或既定正路。单殿前后闭面均拒绝。

116真实owner（114逐mesh三角、2石体Box），2false顶，0contact/room/map/虚坡。完整有限UV、精确三角/Box匹配、前置守卫和geometry/owned各一次dispose已验。
唯一作者候选World1/1绿：旧4/590完整对象含end同正常先验；新10/60走跑4/169完整对象含end同local，峰.1512329464，末态native clear/feet0。前闭门拒绝全对象同local；后墙仅单殿有效，不在原北墙处做无效World移动负控。
旧garden2824mesh/1477collider/98top及rooms/maps/regions完整流前后同；731旧src/data逐Gitblob锁表。两CPU亲看外两层、六叶/腰檐/栏可辨，库fallback平色，非GPU纹理或现代实景。按明确授权不跑全站suite/build，不称整阁或上层通行通过。

## 唯一正常集成
ZoneBase import buildYanhuiHall，所有既有finalizer之后、kit.finish之前调用 `buildYanhuiHall(this.kit,this.kit.root.name)`。其他zone返回false。累计另QA副本改base/output并去全部loader注入import/call及before/after/global捕获，用正常architecture record/116owner/2false顶关口；旧4与新4完整对象照原，必要30Hz只同输入/到达。不要覆盖作者/tmp原件。正常hook/build由唯一集成人关闭，作者不再World。
