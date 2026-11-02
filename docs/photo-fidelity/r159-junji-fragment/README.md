# R159 军机处值房：12m局部南向外廊

独立基线 `c19329fe4199758b89e7eba906413362af17aa51`。只新增专属模块，旧src/data字节不变，无共享hook修改。不是军机处全部建筑/房间或现存完整库存验收。

## 自身图证与限定
官网制度页：https://www.dpm.org.cn/court/system/236360.html
本体外观：https://img.dpm.org.cn/Uploads/Picture/2021/11/25/s619f1e0d6209d.jpg
`/tmp/r159-junji-0804/own.jpg` 81000B，SHA `473c9d42834e2356fb6214c65491275d3f507a275b0b16088dcf41c138c92881`。作者与集成人重新亲看并核它确在官页内：黄瓦连续檐、红圆柱外廊、红闭门、暗格窗和下灰墙、灰台及分处短石阶。不是借上书房格数/陈设图，也不使用2044/2045旧室内家具图。
官网隆宗门正文 https://www.dpm.org.cn/explore/building/236496.html 确认门内北侧为军机处值房；乾清门西北隅/内右门以西及当前anchor仅用于相对区域，不当精测坐标。
照片日期、全东西端、完整间数、现代完整库存未知。4个显示分格、两处短阶、尺寸/后端/屋顶端部皆明确工程拟合；不猜匾额细文，不添家具/室内房间/重复map。

## 范围及物理
只替 `axis-courts/items/23` x[82.6,94.6] 局部。旧墙可见7m+帽，普通碰撞实际y0..3。
新段后背墙仍沿z203.85、南向闭门窗与外柱廊；包含屋檐/短阶最大预留 x[82,95.2],z[197,204.5],y[0,7.4]。
原resolved内右门gap从正常gate返回/resolveGaps传入并与实际map gate宽核同（本基线6.4m），不得靠新模块猜宽。原左尾及含门缺口的中间保留段、右尾均由原wall按原gaps加这一个12m切口生成。规范化参考比较覆盖**所有保留段**，不是只核右尾。

新低灰台.3m；两处各2道.1/.2m短阶与真台顶衔接。五个可见Box各配真实top、全部rescue:false；其余每个实际mesh有自己的非退化三角owner。廊中真实空，闭门/后墙实际拒绝，不留旧横墙穿过廊中，不造虚坡/接触例外。

## 真实失败与结果
- 初2条missing-builder真RED。
- 第一次模块将多组门窗/柱/屋面合成一个triangle owner，4新路3到；10Hz跑在折返时卡z199.613。静态CM在199.5/199.7出现不连续包含判断。保留 `/tmp/r159-junji-0804/aggregate-owner-red-source.js`、`local-first.json.gz` 和日志。
- 最窄修只把真实mesh分开登记owner，**可见形状/路线/全局控制器没改、没删真实面**。原台/阶从始至终为真实Box与顶；没有扩认证。
- 最终局部3/3：原声明与gap守卫、所有保留墙分段几何/UV/矩阵/材质严格同、缺口/冻结守卫；原生4路217帧到达，峰.202000006；闭门与北背墙2路线拒绝。
- 最终独立保全1/1：整个axis非目标10649网格attribute/index/世界矩阵/材质名/颜色及非目标colliders/walkables/rooms/maps/regions前后同。仅随机UUID规范化，非空间/材质省略；目标23保留段另行严格比较。
- 正常World候选：真实ZoneBase+actual-library+原生controls，QA仅在buildWall解析原gaps后注入此item替换。已加载axis-courts+global，非全分区。旧内右门、隆宗门中央、南缘z195三路线×10走/60跑=**6/755帧全数组同**；新两短阶入口×10走/60跑=**4/176帧到达、峰.202000006**。rescue:false从最初就存在，无末尾flag差异。
- 2CPU亲看屋面、红柱、灰窗下墙、两短阶及原墙收口。真实网格+库fallback色块，非GPU/实际贴图截图；不精雕格纹。

## 接入
唯一集成人在 `ZoneBase.buildWall` 内、原 `const gaps=...` 已解析后、默认kit.wall前：
```
if(buildJunjiSouthPorchFragment(this.kit,item,this.zoneJson.id,this.zoneJson.items.indexOf(item),gaps))return;
```
仅axis23返回实体，其余false。必须build-time替换，不能原墙建完后叠加；不改原gap表达式/内右门或隆宗门实体。作者无正常hook、无build、无Pages发布。

`world.test.mjs`写死独立树并做QA注入；累计副本替base/输出并移除注入，不重复注册。所有QA默认raw位于`/tmp/r159-junji-0804`，累计勿覆盖。source/QA/2CPU/summary/rawSHA见manifest。正常接线/必要累计构建/最终审核仍由唯一集成人闭合。
