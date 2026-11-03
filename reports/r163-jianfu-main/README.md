# 建福宫正殿 H43/12 本地候选

基于2c7db7a5705b35324bd88babc39bf9f6df96eb70的独立树r163-jianfu-main-1201。产品源fb1db07fdb3d662108eb58638dcbb41f506d5cbf，FC-255E648E8D。只新增本体及ZoneBase一import/一调用，不改抚辰/旧墙/全局物理，不上传/main/派代理。

## 来源与范围

亲读[官方建福宫页面](https://www.dpm.org.cn/explore/building/236524.html)，明确正殿三间×三间、黄琉璃瓦绿剪边卷棚歇山、檐下斗拱；前后中央各四扇菱花隔扇，前侧槛窗、后侧砖墙。亲看[2021官方院刊文件41/印54页](https://www.dpm.org.cn/Uploads/File/2021/08/24/u6124c44d8868f.pdf#page=41)全景/总平面，与南北顺序交叉识别抚辰后黄色正殿。这是群景＋文字拟合，不是具名完整立面复原，未使用敬胜斋立面或二手五间说法。

中心(187.5,449.5)，朝南，封闭芯10.2×7.8m、三向深度格；前后廊各1.7m，黄/绿厚卷棚屋面11.9×12.3m。实石台11.8×12m/.6m，前后各三级.15/.30/.45m踏步接台顶，四次.15m上升。红柱、简化斗拱、每面中央四叶黑/金闭门及粗三向菱花，前侧槛窗/后侧砖墙。所有坐标尺寸、屋面曲线/厚封口、隐面、斗拱构件数量/简化梁枋、门格/颜色及真实后台阶均为工程拟合，非测绘/原构件清单。

未做“不为物先”室内匾、宝座、炕罩、室内隔扇/家具/纸饰，未新增室外匾、未知两侧游廊/新墙、房间或传送。现实开放未知，闭合芯不可进入，仅外部台阶与前后廊可走；不称内景/连廊/整项完成。

## 已通过

- 真正无新hook的干净2c7正常World预检19.4秒：全候选180..195/441..458、紧凑181.3..193.7/441.2..457.8、x196旧干道/东墙侧道/抚辰后廊回路及北续，均0旧owner与可见正面积三角相交。固定基线SHA256 c7ca87f81d73e991ba2aae2bd7a28c853eec06427ed78ef2f66b06452786c043，不在加hook后重捕。
- 组件/局部5/5；每面四叶、前窗后砖、三间三进深、8柱/简化斗拱/8真实屋面支撑、有限非退化网格/每mesh实际owner、失败原子释放/host/重复守卫及两端y6高位内外射线。原生30/60fps步行/跑步20路线、8闭门/侧墙负例全部native0。
- 受影响组件26/26：建福正殿5、抚辰5、静怡6、浴德4、香云6。不是全部历史套测。
- 首次最终World73.9秒通过：完整静态生产世界＋outer-west/west-six/garden，严格保留2c7旧1035mesh/84实例、20221 owners/1390可走顶，以及被测几何属性/索引/矩阵/材质字段、地图、房间、区域、建筑记录流。仅省本体私有前缀/实际owners与顶/本体记录，以及另验的outer-west远屋顶。
- 精确远屋顶三角多重集：71048旧（含抚辰/香云）＋4480实际本体＝75528；本体合批12mesh/10272三角/344真实owners/7真实石顶，无新旧实体正体积交叠。
- 同场104正路线/32负例：本体20、原门z414/x196干道及静怡/敬胜/吉云真实阶16、抚辰20、浴德20、香云20、原重华中殿实际往返8。中殿.75m旧室内仍可进，30fps每组合1/60fps每组合2帧原历史接触逐帧/owner盒一致，不称零接触；其余按原断言native0。
- 实际合批两端y6高位四射线、前/侧玩家及前后廊四个CPU眼位真实地面/台顶支持与净空通过。范围外旧顶点1mm负控被快照拒绝，恢复后再核原流。原抚辰/浴德/香云源与证据没有覆盖或改写。

## 视觉与干净包

cpu/仅六张当前fb1db07f实际几何＋HD贴图CPU图，已核源码及全部图片hash：地面正南、地面东南、黄/绿卷棚歇山俯视、前廊四叶门、后廊中央门/侧砖、蓝抚辰与x196轴线环境。近地面主要看到檐下，完整屋面由升高图辨读，不冒称GPU/PBR/原立面照片验收。

全新干净包：/workspace/scratch/02a8023d1a85/r163-jianfu-main-fb1db07f-clean-1213。
- 显式base=/gugong/，sourceDirty=false，源fb1db07f，744模块、7.33秒构建成功，保留大包警告/npm环境提示。
- R163-ba3c44613ce4，sourceFingerprint edb2804ac96a5c816db3075b5b628482b96c15f84e7799f1cd148c8f33c98504。
- 当前运行源/HTML/JS/元数据身份一致；137文件44,413,412bytes按/gugong/逐文件本地HTTP SHA256/长度/MIME全对，根200、缺文件404。不混用旧dist，不声称远端发布。

## 历史与未验

原red.tap保留缺失builder/hook四项RED，后续当前组件、CPU、World、构建与HTTP没有新失败或重试；日志无损gzip＋SHA清单保留。抚辰原高封口修复和原设置/失败/历史图完整留在前一基线与原路径，不以本轮成功覆盖。没有运行全套历史测试，既存Tiren/Hongyi失败及B-principal历史差异未改写/未宣称已修复。

未验完整具名立面/精确实测/内部、实际两侧游廊连接、现实开放、GPU/browser/PBR、移动端/全区流式/动态人群、全部历史套测、远端HTTP/Pages与整项验收。独立终审由父统筹；当前报告为本会话验证。

## 串行复现

```
node --test --test-concurrency=1 tests/r163-jianfu-main.test.mjs tests/r163-jianfu-main/local.test.mjs tests/r163-fuchen.test.mjs tests/r163-yude-west.test.mjs tests/r163-xiangyun.test.mjs tests/r163-jingyi.test.mjs
TMPDIR=/workspace/scratch/02a8023d1a85 NODE_OPTIONS=--max-old-space-size=2048 node scripts/r163-jianfu-main/render.mjs
TMPDIR=/workspace/scratch/02a8023d1a85 NODE_OPTIONS=--max-old-space-size=3072 node --test tests/r163-jianfu-main/normal.test.mjs
TMPDIR=/workspace/scratch/02a8023d1a85 VITE_BASE=/gugong/ npm run build -- --outDir <全新目录>
node tests/r163-jianfu-main/http-verify.mjs /workspace/scratch/02a8023d1a85/r163-jianfu-main-fb1db07f-clean-1213
```

固定基线来自2c7。HTTP验证器固定本次包源fb1db07f；仅证据提交不改变运行字节，新建包时应另留其真实源，不覆盖本包元数据。
