# R160 景仁宫后殿西配殿：官图拓扑推断的最低闭壳

基线 `fe2662368c8adb1e072b966d8615632c3741b486`。原项 `FC-C61F02E5E9`。只新增 `src/scene/palace/special/JingrenRearWestWing.js`；尚无正常 hook/build。唯一集成人在 `ZoneBase.build` 的 `this.kit.finish()` 前调用 `buildJingrenRearWestWing(this.kit,this.kit.root.name)`，仅 east-six 返回实体。不替换现 item5 前西配，不触 item2/3 两正殿。

## 自身证据与拟合
- 官网 https://www.dpm.org.cn/explore/building/236509.html 正文明确后院五间正殿、东西各三间黄琉璃硬山配殿，明间开门。
- 自身图 https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d16b8c46ab.jpg ：后殿南向正面及画面左侧后配。方位由南向后殿/院落拓扑推出地理西，不是读取专名匾或独立 vp。图 `s5e9d16b8c7345.jpg` 为后殿正面相互定位。
- 左配可见红闭门、红上格/浅下窗、低灰台短阶。屋盖局部与裁切部分、背侧、所有尺寸/坐标、叶数/粗色分格均工程拟合。不做井亭/小匾/展陈/室内；不宣称现今开放、现场测绘、完整现状验收。
- 中心(-76,343)、面向院心-X，三间7.2×3.6；灰台.2、真实前阶.1。硬山roof width7.2/depth3.6/base3.5/height1.5/overhang.5。完整可见盒 X[-79.250000012,-73.422326565] Z[339,347] Y[≈0,5.332399845]，在唯一预留盒 X[-79.4,-73.2] Z[338.9,347.1] Y[0,5.5] 内。
- 50逐可见mesh三角owner+2真实台阶Box，2真实顶rescue:false；0新contact/虚坡/room/map。保全旧殿墙和全部旧支持/物理。

## 有据放宽的是非通行区域测试，不是几何穿插
初次正常先验 `scan.log/json.gz` 真 exit1：221半米身体采样有20红，3在南端身体伸向旧前殿台缘，17在背端身体伸向院墙；所有旧可见三角/owner/support/water交叠仍0。父13:04:32明确非玩家通行背缝不必全盒半米body绿，改验真实院前路线。原20红保留，不称body全盒净空，不缩盒、不挪旧物。
执行前静态纠正曾提及的(-82,343)（它在旧后殿平台上），从未执行该点路线。固定合理路线是(-82,340.5)→(-79.7,340.5)→(-79.7,343)原返，非为遮候选失败事后调点。`scan-route-authorized` 正常World：旧街4/3315+固定折线2/111全部到、峰0，起点global body clear。97765三角检查，完整盒旧交叠0。背缝及南缝不是新增通路。
有限上方柱 XZ同盒/Y5.5..30有128旧三角，整个被计三角最小顶点Y≥6.700000003，相比新完整最高5.332399845保守垂距≥1.367600158；不声称无限高度净空。

## 必要验证
- `node --test tests/r160-jingren-rear-west/component.test.mjs`：7个missing-builder真RED→7绿，身份/全包络/真实owner/两顶/UV/注册前置守卫/资源各一次。不是late-publish回滚验证。
- `node --test tests/r160-jingren-rear-west/routes.test.mjs`：local1绿，10/60Hz走跑(-79.7,343)→(-78.6,343)原返4/78帧，峰.0972777785；闭门/后墙2拒绝（后者仅单殿实墙负控，不是背缝global路线）。
- `node --test tests/r160-jingren-rear-west/world.test.mjs`：作者loader注入，不是正常hook；loadAll:false，明确驻留east-six/ningshou/garden/axis-courts+global。旧6完整对象/3426帧与正常先验逐字同，所有旧3898mesh/2429collider/120top及room/map/region流同。
- 新4 recorded frames、driver/crossings、arrived等指标逐字=local；不冒称完整返回对象相同。首World `world-local-end-mismatch` 真exit1，是extra end比较失败：原driver在平面穿越到达后另无输入settle2秒、不入frames，World原旧物挡止使end约-80.1496，而独立单殿约-80.2523。只修QA边界，产品/输入点/物理不动。最终World1绿，逐帧及crossing硬同；实际World end保留，native checkCollision=false/feet0。额外终点距返目标<.6仅有界coast检查，**不是把原driver的.6横偏容差当纵向到达规则**。不宣称旧.45低台的可见边缘绝对无擦脚。
- 两CPU是实际几何+资源fallback粗色，亲看大轮廓；不是GPU/HD截图，不追精雕。sourceTriangles1444含QA地面12，生产1432。
- 没跑全站suite/build，没动main/branches/shared hook。

## 原件与累计
原件仅 `/tmp/r160-jingren-rear-west-1302/`，SHA在manifest；官页/两官图也仅/tmp。原红均保留。脚本默认写固定raw路径，不可直接重跑覆盖；集成人复制脚本到独立/tmp，更换base/output并去掉作者注入，正常hook后须硬核真实record/52owners/2false顶及原6与新4 **World** 完整数组。此处新4不能要求与local的额外end全等。normal/build由唯一集成人关闭。
