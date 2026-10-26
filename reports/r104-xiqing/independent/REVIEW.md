# R104 锡庆三门独立审核

## 绑定范围与状态
最终clean checkpoint `2c7beb40da20c31d61107497ea165c5ce6ccd76f`。几何/完整运动矩阵源 `d96913ebe44c3d9763484523ea256c9a2397f3ff`；后继仅FurnitureMotion单次去重d0eb按独立逐值等价复用，**144矩阵未伪称在d0eb重跑**。最终7个runtime/data SHA见 `source-final.sha256`（已逐文件读回核对）；独审未修改产品。最终累计/构建/发布由 parent 与 auditor 另审，本文不代替它们。

原 `1eac1a1` 的新侧垛空降卡死、六门叶埋垛与普通玩家穿屋面已明确拒绝，原始FAIL和中间报告完整保留。后继先复用局部 box 适配，再添加仅三门的真实开放曲面；没有缩玩家、抬步高、伪造平盒地板、变更 Duixiu 闭体 parity 或全园控制器算法。

## 形体、可见源与保留
- 亲看官方近图：支持三座分立、中央稍高、黄瓦庑殿顶/随墙形制；尺寸、背部安装和当前陈列日期未测。±7m侧距、体宽18.8m、开门停靠等是工程拟合，不称逐纹样/测绘复原。原图不进发布。
- 中央3.6m、侧各2.8m三实际净口；墙切三个独立接口，间墙保留，完整真实头顶墙盒到7m。齐平glaze为原实体面分区而非新薄凸台。6打开叶片移到垛后，独立实际bbox无正体积埋入主盒。
- `comparison.json`：全宁寿44对象中42个非目标对象逐属性/矩阵/材料/碰撞/支撑精确，敛禧/R99梵华与房间信息不误改；仅门与目标墙41改变。map稳定ID/center/rot保留，宽6.4→18.8，不冒称地图全未变。
- `teleport-comparison.json`：实际采样landing整个对象与R103逐值相同，x=-223.79999999999998,z=135.5；lookAt原中心、distance8/lateral0同值。不是拿新helper尺寸猜落点。
- `geometry-fb77035.json`：24实体/门叶owner的世界bbox逐值等实际mesh，闭合/正体积/非退化UV通过。实际前/斜/后CPU图可见三独立门与6背停叶；图片明确没有纹理、浏览器/GPU/实时光影，不以浅色门板声称实机材质。
- **最终真实生产同源**：`production-source-d969.json`，3×1008=3024源三角全部逐点存在于真正CourtKit.finish合批Float32 render；每屋988正面/20严格零过滤，保原source映射。原可见roof所有属性/变换与fb原snapshot精确相同。先前premerge double同源结论不足，已保留并纠正，不能套给生产量化后版本。

## 数值与生命周期
- 原语独立1200随机triangle/body裁剪、200连续sweep碰前/后裁剪与方脚角落/双向薄面/精确切触门4/4；无开放面parity虚体。
- 发现实际面2123个接触中685个foot下舍入自挡，用独立Python Fraction精确裁剪全部source面证明。修后909点精确最高Y和最小binary64上界逐值全等独立golden；几何有理witness与可表示feet明确分开，不是EPS放行。
- 另抓出1个严格SAT舍入假自挡，原source顶点的有理轴证明真实分离；定向interval证明/不确定精确SAT修后，2123点仅224真实其他面遮挡，均由独立clip证实。这些blockedPose没有被过滤成不存在的floor。
- source每template私有finegrid/WeakMap，仅本地候选面；实际shape严格白名单，未知身份/混合owner拒绝。`scope-fb77035-v2.tap`5/5含held clone、同数更新/移除、108clone共索引/一次失效、固定ID拒绝。`lifecycle-d969-held.tap`证明新roof注册深复制/冻结、同数替换live可见、旧面不残留、非法更新原子拒绝、remove后清空。

## 最终实际运动
所有“18m下降”均为清晰无初始穿入的压力状态，**不是已证明可从飞机下机或地面走到屋顶**。
- `drop-d969-final.json`：9点×8方向×10/60Hz，共144条。真实4秒下降后2秒移动/1秒settle；逐帧真实盒与独立三角裁剪oracle。0屋面正内部穿入，所有18组有5–8方向可退出，0全方向困住。
- 保留16条未grounded：同一[-231.4,133]的真实竖檐口上沿，normal.y=0，airborne=true/vy=0。它不是虚构up-face floor；parent明确接受这一个压力限制，不宣称0未稳。
- `roof/escape-head-d969.json`：该点10/30/60各8向，**每帧率5/8方向可横移后在真实面/地面grounded；所有这5方向都能再次跳起**，高度增加1.32–1.495m。其余3方向受阻，无全困。24条均无独立穿面/盒穿入。
- `roof/head-near-d969.json`与`head-impact-source-d969.json`：普通header外1cm的18个合法檐下初态，10/30/60真实向上压力均命中对应roof source面并截断；侧feet最高3.295245933、中3.695246029，低于同输入自由峰4/4.1867/4.236。撞顶vy0仍airborne，不伪落地，最终全落地0，0穿面。较外侧第一批未实际碰面也保留，未冒充head-hit通过。
- 3条域外旧墙正交叠没有隐藏：`handoff-replay-d969.json`从每条首次穿入前真实clear状态，R103/候选各重播4帧；pose/feet/ground/airborne/vy/深度全部逐值相同（`handoff-d969-summary.json`）。墙盒因新洞截短，接触局部面仍相同；不是仅凭“域外”而豁免。
- `routes-three-d969-final.json`：最终roof组合三门地面18趟2718帧全通、0穿入，整轨迹逐值等fb；中央593帧继续逐值等R103。

## 成本与限制
读取writer隔离原始成本，不把功能矩阵耗时当性能基准：三门单组build+finish+dispose五组中位的中位2.964→14.144ms（约+11.179ms，**不含邻墙/全世界**）；可见三角1258→3998、合批10→10、合批属性120768→383808B。roof source/精确数值计算另有CPU缓存代价。
普通门口五轮p95中位约.0156→.0327ms，域外.1110→.1154ms；中心roof首次接触3.05–5.59ms、各轮最大4.37–7.08ms，near-contact p95约1.48–1.86ms。首次轴/index成本没有藏入warmup。**后补竖檐上沿病态尾路径**（writer原始记录现归档为 `roof-perch-before-prefix.json.gz`）：静止p95 42.789/36.693ms、向西受阻42.014/42.953ms、max76.958ms，向东退出后<.2ms。这是已拒绝旧阶段的严重成本退化，不能用中心样本外推；后继唯一单次同步prefix去重及其等价门/残余成本见下一节，负数字不删除，不再表示当前仍在等待去重决策。
GPU/手机/真实用户设备帧率未验；真实正常路线到7m墙顶/檐面可达性未知；无全世界零穿入承诺，原域外旧控制器缺陷明确保留。

## 单次前缀去重增量
FurnitureMotion SHA `d0eb81aa18433a75bf716a4e5598f66807d1e697136635ebc74e49a3957e50f2`：仅surface vertical一次同步调用内部memo重复binary64目标feet的静态查询，保留全部48轮算术；动态parts/世界边界每probe仍执行，source世代改变清缓存，±0区分。`roof/prefix-equivalence-d0eb.json`独立225组完整返回逐值等d969，包括实际15状态×3fps×静态增/移、动态增/删；query1698→852。几何和其余机制未改，故已完成最终安全矩阵按此精确行为等价复用，不重新无差别扫全园。已独立读回writer before/after原始gzip，2×720逐帧除ms外完整相同（perch-cost-independent-readback.json）。尾成本复测：静止perch p95 5.692/4.970ms，受阻西6.535/5.440ms，全run最大13.722ms；旧37–43ms/max77ms负数据保留。**仍不是所有屋面<2ms、不是全面性能提升**；按parent已作出的取舍保留候选并披露该尾代价（writer于13:10转达），不是把原预算改写为通过。

## 结论
已完成的限定安全/图证门未发现剩余新增穿面或全困；竖檐上沿非grounded限制符合parent明确取舍。最终地面增量及单次去重行为等价已过。限定几何/功能门可通过；剩余尾CPU代价按parent取舍明确披露，新累计/构建/包/远端门由auditor和parent处理，本文不冒称全套发布审核完成。

归档说明：旧fb域清单误被最终routes脚本同名覆盖，已立即把新结果移为domain-d969.json并留domain-fb77035-SUPERSEDED-NOTE.md，旧数值/计数仍在当时报告但不声称原JSON保留。最终域31owner（28ordinary+3roof）分类有actual生产source exactbbox证明；旧FAIL和所有运动原始日志未覆盖。
