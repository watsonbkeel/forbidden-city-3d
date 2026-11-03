# 惠风亭 H43/15 可走敞亭候选

基于ea7b3b44930c5be42aae53d86790d8ca33b1e7cc，产品06e83326afe914ea6aa20c361e30691427ddace6，独立树r163-huifeng-1222，FC-E548FCFDBA。仅新增本体和ZoneBase单hook，不改旧墙/实体/全局物理，不上传/main/派代理。

## 来源与拟合

亲读[惠风亭官方词条](https://www.dpm.org.cn/lemmas/242224.html)：方形各面三间、重檐攒尖、紫琉璃瓦/孔雀蓝边、白石须弥座和石栏云纹望柱。亲看[官方2010学刊文件11/印203图十三“惠风亭”](https://www.dpm.org.cn/Uploads/File/2019/12/15/u5df5f0c30fe12.pdf#page=11)：单层敞亭、中央通视、风化深木柱/彩画、两重四角飞檐/小宝顶、正中石阶及两侧白栏。[2021官方文件41/印54群景/总平面](https://www.dpm.org.cn/Uploads/File/2021/08/24/u6124c44d8868f.pdf#page=41)仅交叉核轴线位置，不混后左黄顶积翠亭。

中心(187.5,466.8)，6.6m三间方柱网/12外柱，下檐9.2m、上檐5.6m，单层敞开空间、深色风化木色与低饱和梁枋、紫瓦孔雀蓝双檐、小宝顶。白石三层须弥座概括，顶高.6m、白栏板/12望柱/简化云纹；南北各三道.55m长小踏步接台面，四次.15m上升。南阶有图，北阶是游戏连接拟合；没有东、西阶，不声称四面原有阶。

全部定位/尺寸/柱与石栏数量、色彩、屋面曲线/厚度/接缝/高木鼓/隐面、须弥轮廓/云纹及阶数均为工程拟合，非测绘/精确雕刻。高木鼓及高天花是屋面封闭支承，不是第二层楼或新增房间。未做未知赏石安位、腐朽木座、家具、匾/文字、未知游廊/新墙、上楼/传送；现实开放未知，不称内景/整项完成。

## 主体与实际通行

- 真正无新hook的干净ea7正常World预检19.2秒，最大拟合包络181.3..193.7/460.6..473及旧x196、建福后阶、静怡z474.2转入/原前阶范围无旧owner/可见正面积三角交叠。preflight原候选名含“四阶”是早期最大空间探针，不是最终设四面阶的证据。固定baseline SHA256 2b4a3e246e5adeafdb721847d59596abacd785dc8255145890da7d82f6558052，不在加hook后重捕。
- 组件/功能局部5/5，受影响30/30（非全历史）。真实厚屋面、每mesh实际owner、12下支撑/4上支柱接实际下表面、中央人高视线通透、host/重复/冻结/材质及贴图失败原子释放。真实7石顶均rescue=false。
- 自身30/60fps步行/跑步20路线全到达、无卡住；8石栏/柱负例均从真实支持/原生净空起步且阻挡。仅单层地面平台可正常南北贯穿，所有接触记录保留，不为零接触修改实体或物理。
- 原始“所有native接触必须0”局部断言发现快跑脚缘接触；加长踏面.7m未消失，已经还原.55m踏面/原占地。逐owner完整矩阵确认只有须弥腰和台顶边。按通行优先保原实体，不另改碰撞类型或加隐形支撑。
- 本体四个快跑组合分别1/3/2/6帧，共12帧原生脚缘接触；局部与完整World的每帧/owner盒精确一致。脚高范围0..0.6m、最大单帧变化0.12166m，小于.15m阶高；原生实际身体下界相交深度最大0.07985m。脚高插值与支持高度最大绝对差0.45028m（含快速离阶时的高度滞后），不能说脚点每帧完全贴地或零接触。没有为得到成功隐藏这些数据。详native-contact-parity.json与原始轨迹。
- 当前断言仅容许已逐owner确认的轴线腰部/台顶脚缘条件（实际身体边深<.1m），仍拒绝其他柱/栏接触、卡住、负脚高/大高度变化；栏杆/柱负例仍要求阻挡且native0。历史零接触断言副本及原失败保留，诊断中错误ground-gap/owner假设也另留日志。

## 最终正常World与资源失败

首轮normal-world-first-process-exit.tap在52.9秒仅文件级exit1，没有断言堆栈、normal-world.json或finally卸载，不能据此称脚高断言失败，也无法确认核杀/OOM。first-world-test-original.mjs保存当轮测试源码。

检查发现QA逐owner隔离临时替换colliders后丢弃原空间网格，可能造成反复重建。仅修正QA保存/恢复同一原网格，未改产品、实体、碰撞算法或旧范围断言。增加阶段/内存落盘，以2GB堆和显式TAP一次受控复验：90.9秒通过，阶段RSS约2.15..2.23GB；首轮失败仍留账，不宣称已确证资源杀因。

- 严格保留ea7旧1047mesh/84实例、20565 owners/1397顶及被测几何属性/索引/矩阵/材质字段、地图、房间、区域、建筑记录。只省新增本体私有材质/实际owners与顶/记录，以及另验outer-west远屋顶。
- 远屋顶精确多重集：75528旧＋2102实际新顶＝77630。本体合批11mesh/9608三角/130真实owners/7真实石顶，无新旧实体正体积交叠。范围外旧顶点1mm负控能检出，恢复后重核旧流。
- 124正路线/40负例全部通过：新亭20、原门z414/x196及静怡/敬胜/吉云真阶16、建福正殿20、抚辰20、浴德20、香云20、原中殿真实进出8。建福后阶z459.5回路、静怡z474.2横向转入/原阶保持；原中殿历史1/2帧接触逐帧及owner盒保留，不冒称零接触。
- 实际合批南北人高通视两射线无阻；四个正常CPU眼位真实地面/台顶支持、原生净空。没有修改历史候选基线或以新成功覆盖旧失败。

## CPU与干净包

cpu/六图均为06e83326源的实际生产几何/HD贴图CPU：正常正南、东南、双攒尖/小宝顶俯视、台内中央通视、白栏/云纹概括、建福—静怡环境。源码和图片hash核对通过，非GPU/PBR/现实开放验收。

全新包/workspace/scratch/02a8023d1a85/r163-huifeng-06e83326-clean-1254，统一base=/gugong/、sourceDirty=false、745模块/8.06秒成功，保留既有大包警告与npm环境提示。R163-ea3d6e062b83；sourceFingerprint 455badc1e37771406b40bcaaa7102e0e438d7f6eb473937dd19102164eba50ae。当前源/HTML/JS身份及137文件44,425,202bytes本地HTTP SHA256/长度/MIME全对，根200/缺404。不是远端发布，不混旧包。

## 未验与复现

原日志无损gzip＋SHA清单保留。未验GPU/browser/PBR、移动端/全区流式/动态人群、全部历史套测、远端HTTP/Pages、精确现状/未知陈设及真实开放/整项；既存Tiren/Hongyi及B-principal历史问题没有被改写或宣称已修复。原RGB印刷页与嵌入JPEG色彩解释不同，以RGB页理解构形、词条核瓦色，非校准色样。原官图/PDF不再分发。

串行复现：
```
node --test --test-concurrency=1 tests/r163-huifeng.test.mjs tests/r163-huifeng/local.test.mjs tests/r163-jianfu-main.test.mjs tests/r163-fuchen.test.mjs tests/r163-yude-west.test.mjs tests/r163-xiangyun.test.mjs tests/r163-jingyi.test.mjs
TMPDIR=/workspace/scratch/02a8023d1a85 NODE_OPTIONS=--max-old-space-size=2048 node scripts/r163-huifeng/render.mjs
TMPDIR=/workspace/scratch/02a8023d1a85 node --expose-gc --max-old-space-size=2048 --test --test-reporter=tap tests/r163-huifeng/normal.test.mjs
TMPDIR=/workspace/scratch/02a8023d1a85 VITE_BASE=/gugong/ npm run build -- --outDir <新目录>
node tests/r163-huifeng/http-verify.mjs /workspace/scratch/02a8023d1a85/r163-huifeng-06e83326-clean-1254
```
HTTP验证器固定本次包源06e83326；仅证据提交不改变运行字节。诊断原零接触runner是保留原断言的参考副本，相对导入保留原位置语义，不当作当前验收入口。
