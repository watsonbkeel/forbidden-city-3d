# R162 摛藻堂 FC-35C163B4E4 — 独立最低五间闭壳

基线 `e16d9fe25b35a3464573c4fd40f3b17c330b3bfc`，已含位育与绛雪。仅新增 `ChizaoHall.js`；没有改共享 hook、release、旧路径、景观、门墙或全局控制器。整对象验收 NOT_ASSERTED。

## 自身证据（不是位育身份镜像）
官网 https://www.dpm.org.cn/explore/building/236432.html 明确堆秀山东侧、依墙面南、五间黄硬山、前廊、明间门和次梢槛窗；西墙小门通耳房本轮不建。官网浮碧页236498另确认亭北正对摛藻堂。
自身图 https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e980a146322f.jpg 已亲看，/tmp/r162-chizao-own.jpg：四扇红闭门及上部透光区、上下窗分区、灰低台、黄色屋盖明确。**近景大柱梁/天花和石栏属于浮碧亭**，不纳入新殿；书店招、精匾、寿字细雕、器物和室内不造。

工程拟合：中心(-58.8,514.5)、宽14/深3.6，0朝南；真实hard-gable roof base3.5/rise1.5/overhang.5。相对浮碧亭偏东与紧凑进深为保护既有街路，非测绘。未见侧背/细格/比例/色纹均fit；不宣称现代开放或逐面真实性。独立四叶闭面不借位育中央整块遮板；两者只复用几何方法。
完整实际bbox X[-66.200000095,-51.399999905] Z[511.922326565,517.077673435] Y≈0..5.332399845，锁唯一盒[-66.3,-51.3]×[511.8,517.2]×[0,5.5]。闭面local z=-.9留真正可站前廊；.2平台14.8×4.2、.1阶2.8×.4均真实Box与同顶rescue:false。

## 正常先验 / 保全
`scan.mjs` 与原件仅/tmp/r162-chizao-1738。实际资源、正常World garden+west-six+axis-courts+global，loadAll:false，不是全城流式或GPU验收。
- 93,484实际旧三角（含每树实例矩阵）；owner/support/水/可见交叠0，341 body样本0。**几何检查Y≥.04**，原全园地/草.012及铺装.028保持，不把地坪柱说空。没有任何新树/床裁剪授权或修改。
- 原x=-48,z507↔515、北横z509.3,x=-65↔-45两条本轮现plan派生诊断，各30Hz走跑，4/506全到峰0；不是引用历史QA。北横终点不越进堆秀山，不挪旧路。
- 必要接近(-58.8,509.3)→(-58.8,512.65)返30Hz走跑2/73是建台前地0先验，合计6/579。建台后只保相同输入/到达，不要求也不宣称这2条脚轨迹不变。

## TDD / 有限实证
- 真 missing-builder RED 7项→本体7+单殿路线1合计8/8绿；唯一作者候选World1/1，无再调点/尺寸/容差。
- 新48真实owner（46逐可见mesh三角、2石体Box），2false顶、0contact/0虚坡/0room/0map。注册前置守卫、全有限UV、资源各一次释放通过。
- 旧4/506完整对象含end同先验；新10/60Hz走跑4/169完整对象含end同local，峰.151232947，最终native body clear/feet0。30Hz必要接近同输入/到达，真实新台脚差单列于summary。
- World只测有效前闭门拒绝，完整对象同local。新后墙有效拒绝仅在单殿，不复用靠原北墙的517.5点作为World移动负控。
- 作者loader在ZoneBase.finish前注入构造和before/after捕获；尚未安装正常hook。旧garden2776mesh/1429owner/96top及rooms/maps/regions前后精确同；全部旧src/data逐Gitblob锁在protected-source。
- 两CPU实际几何粗形已亲看：四叶、窗区与黄硬山可辨；库fallback平色，不是GPU/纹理实机证明。未跑作者全站suite/build，按授权有界测试，不称整宫/全平台验收。

## 唯一正常集成
ZoneBase import `buildChizaoHall`，在所有已存在finalizer后、`this.group = this.kit.finish()`前调用 `buildChizaoHall(this.kit,this.kit.root.name)`。源其余zone返回false。
累计QA另副本改base/output，不覆盖/tmp作者raw；去**全部注入import/call和before/after/global捕获**，用正常架构record/48owner/2false顶替capture gate；旧4/新4完整对象照原，30Hz必要2条到达条件保留。唯一正常World+build由集成人关闭。无需作者重测。
