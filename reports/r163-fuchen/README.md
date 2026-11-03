# 抚辰殿 H43/14 本地候选

基线aa978fe65c403c6c2cf74b045072421aabb9be53，独立树r163-fuchen-hall-1133。产品9da5818b96886db4a8238bcc110ce73c6a32d0d4，高位上山花最小修复3f3706f58d967bcfa67de27b675967e9fefb9d6a。FC-737B0B10BA。保留前版与基线，不上传、不改main、不派代理。

## 来源与拟合

独立官方[抚辰殿词条](https://www.dpm.org.cn/lemmas/242226.html)支持三间、卷棚歇山、蓝琉璃瓦绿剪边、前后带廊及后接建福宫的历史院落关系。直接网页读取超时后，通过官方页面搜索索引完整正文核对，不把检索错误当无资料。

亲看[2021官方院刊](https://www.dpm.org.cn/Uploads/File/2021/08/24/u6124c44d8868f.pdf#page=41)文件41/印54页总平面及自南向北俯视，结合词条识别前方蓝瓦抚辰、后方黄瓦建福宫，红柱前廊可辨。全序列建福门→抚辰→建福→惠风→存性门→静怡→慧曜；本轮不补其余对象。未将建福宫四扇三交六椀门、“不为物先”匾或黄瓦形制移用。原PDF/照片不再分发，来源/hash见SOURCE-REVIEW.json。

中心(187.5,428)，朝南，三间宽10.2m/封闭进深3.6m，蓝瓦绿边卷棚歇山总宽11.9m/深8.1m，前后廊各1.8m。实石台11.8×8.4m/.45m，前后各两级.15/.30m踏步接台顶，三次.15m上升。红柱、红绿闭门和左右粗格槛窗、通用梁枋彩画；门扇数量、格纹、颜色、所有尺寸/定位、后台阶、隐面封闭与厚屋面均为工程拟合，不是测绘/全立面复原。没有新匾、内景、房间/传送、未知抄手游廊或新院墙；后廊至建福宫的实际连廊未做。

## 验证结果

- aa978真正无新hook、sourceDirty=false的正常World预检19.2秒，完整候选180..195/416..439及紧凑181.3..193.7/422..434均0旧owner/0可见正面积三角相交。建福门前、两侧与北续同样无旧实体；不据静态框盲放。旧门后z414转x196北行路线保留。
- 抚辰组件/局部最终6/6；包括几何有限/无退化、每可见mesh实际owner、8真实廊柱/屋面支撑、host/重复/冻结/材质及贴图失败原子释放、真实前后廊、闭合两侧高位山花正反4射线。30/60fps步行/跑步20路线、8闭门/侧向不可入室负例，原生接触0。
- 最终受影响组件22/22：抚辰6、静怡6、浴德4、香云6，不是全部历史套测。
- 仅一次最终正常World，67.4秒通过：完整静态生产世界＋outer-west/west-six/garden，严格保留aa978旧1025 mesh/84实例、20009 owners/1385真实可走顶以及被测几何属性/索引/矩阵/材质字段、地图、房间、区域和建筑记录。只省本体私有前缀/实际owner及顶/本体记录，以及另验的outer-west远屋顶；其他旧顶包括浴德、西六宫完整保留。
- 精确远屋顶三角多重集：66568旧（含香云）＋4480实际本体＝71048。合批本体10mesh/8700三角/212真实owners/5真实石顶，无新旧实体正体积交叠。
- 同场84正路线/24闭门及侧向负例通过：自身20、旧建福门z414/x196干道及静怡/敬胜/吉云真实台阶16、浴德20、香云20、原重华中殿真实进出8。中殿仍进入.75m旧室内；30fps每组合1/60fps每组合2帧原历史接触与独立原基线逐帧及owner盒一致，不称零接触。其余按原断言native0。
- 实际合批y5.4高山花4射线命中x183/183.14/192/191.86，两侧内外真实FrontSide厚面；正常前/侧玩家眼位及前后廊四个CPU视点均实地支持、原生净空。范围外旧顶点1mm负控被严格快照拒绝，恢复后重新比对基线。

## CPU、构建与HTTP

当前仅cpu/六张为最终3f3706源：地面正南、地面东南、蓝绿卷棚歇山俯视、真实前廊、真实后廊、建福门/x196环境。sourceHash与全部图片hash已独立复核，见cpu-proof-verified.json。地面近景主要看到檐下；蓝顶在升高/俯视清楚，未称近距正面能看完整上屋面。实际生产几何＋HD贴图CPU z-buffer，不是GPU/PBR验收。

新干净包：/workspace/scratch/02a8023d1a85/r163-fuchen-3f3706f5-clean-1151。

- VITE_BASE=/gugong/，sourceDirty=false，源3f3706；743模块、7.76秒成功，保留既有大包警告/npm环境提示。
- R163-79edd538fa9d，sourceFingerprint 2eb99f2086852f98d928ff737e24015e1229ce919a113e8eeb4bc3151870194a。
- 源码/HTML/JS身份与实际/gugong/匹配；137文件44,401,793bytes本地HTTP逐文件SHA256/长度/MIME一致，根200、缺文件404。不混用旧包，不冒称远端发布。

## 原失败和边界

- red.tap为最初缺builder/hook四项RED。
- cpu-sparse-missing-renderer.log：初轮Python渲染器未检出，ENOENT、0图；补检出已存在受控脚本后再执行，没有绕过权限或改产品。
- cpu-before-upper-gable-fix/为9da旧5图，仅历史。独审指出x±4.5上山花风险，y5.4真实射线RED复现。原x±5.1低坡封板并不能封中央高卷棚；仅新增两块14cm厚山花。首次取交界面最低下表面仍失败，已留upper-gable-first-underside-selection.tap；改取中央卷棚内侧5cm处实际下表面得到正确轮廓。最终单位/合批正反射线均通过。
- 稀疏检出还曾移去已跟踪新测试，造成一次追加测试只有新段、缺import的设置错误；原日志另存，恢复已提交测试后才得到真实高位RED。没有把设置失败冒充产品红测。
- 原始日志无损gzip＋SHA清单保留，旧证据/基线不覆盖。最终World无失败或重试。既存Tiren/Hongyi及B-principal历史差异未重跑/改写，不称全套通过。
- 未验GPU/browser/PBR、移动端、全区流式、动态人群/全部历史套测、远端HTTP/Pages、实际开放、未知内部和整项完成。独立终审由父统筹，本报告仅记录本会话实际验证。

## 复现（串行）

```
node --test --test-concurrency=1 tests/r163-fuchen.test.mjs tests/r163-fuchen/local.test.mjs tests/r163-yude-west.test.mjs tests/r163-xiangyun.test.mjs tests/r163-jingyi.test.mjs
TMPDIR=/workspace/scratch/02a8023d1a85 NODE_OPTIONS=--max-old-space-size=2048 node scripts/r163-fuchen/render.mjs
TMPDIR=/workspace/scratch/02a8023d1a85 NODE_OPTIONS=--max-old-space-size=3072 node --test tests/r163-fuchen/normal.test.mjs
TMPDIR=/workspace/scratch/02a8023d1a85 VITE_BASE=/gugong/ npm run build -- --outDir <新目录>
node tests/r163-fuchen/http-verify.mjs /workspace/scratch/02a8023d1a85/r163-fuchen-3f3706f5-clean-1151
```

固定baseline.json.gz的来源aa978、SHA256 96e9eaefda0ec05a4b7fafa83a6d3c0ec6724258ab19964ed32584facd647a63，不在新增hook后重捕。HTTP检查器固定本次包源3f3706，后续仅证据提交不改变运行源字节；若新建包则另保留来源，不覆盖此包。
