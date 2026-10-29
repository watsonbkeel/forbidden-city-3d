# 寿康门整体入口与高位围墙接口（CPU闭环，GPU 未验）
基线 `36426e4f5481f9e08717a4419d6a6ca55b2d81bb`。原文FC-27190A9FB6/第769行、官方236448及两张实际查看照片见RECON。本轮不称完整寿康院、门背或精细琉璃雕饰已复原。

## 实做与明确拟合
整中央单门、两低肩墙、白石门墩、两独立石几、红底绿金花饰分格及单一开口的连续低南墙。原锚(288.6,193.9)、外框6.4m与净3.6m、中央屋顶原参数及完整几何保留。低墙4.4m、肩墙宽4m、简化团花/角花都是照片关系约束下的模型拟合，不是测绘；门叶打开为观看姿态。石几低多边形台柱轮廓不冒充精雕。门神、满文、门背、未绑定侧门/广场房屋、徽音右门不臆造。

真实阈石顶F32(.1)可踏，所有实体为真实闭合盒或完整真实三角面；没有隐形ramp/墙端挡板。四个scope（入口+三条窄周边）均绑定对应可见闭合源，仅真实Environment供地面证据。

## 原三墙：几何保留、物理明确增强
低南墙顶能站立后，原6.5m高墙仅3m旧代理出现实测穿入：保留原东/西/北完整渲染与旧代理，补6完整闭合墙身/砖基F32盒、3整帽瓦源各76正面积面。长面32m上限例外仅三个固定ID、准确F32边界/76面；共享碰撞数学、公差与其他ID上限不变。三条窄域不覆盖院内，世界全高度+1.25m邻居census无不受支持overhead/triangleSupport代理。旧前殿与其他对象完整图不变。

11完整表面、全部闭合盒逐面映射/有向闭合边检验及最终merge源一致；真实TextureLibrary的5种实际使用私有彩材及每三角面/深度偏置保留，不套寿安vertex-color私标或改变共享wall材。

## 验证证据
- `legacy-navigation-stairs-neighbors.tap`: 完整旧导航/梯/邻居 **32/32**, 32.62s，无跳过/取消。
- `shared-final.tap`: 完整共享 **161/161**, 307.63s，无跳过/取消。
- `specialized-final.tap`: 完整寿康28 + 延寿24 + 慈宁24 + 寿安26 + 慈荫26 = **128/128**, 136.36s，无跳过/取消。先前102组遗漏慈荫目录，日志另存`specialized-102-without-ciyin.tap`，未将其冒充完整组；已重新一次跑齐128。
- 父版本实际ZoneBase+原JSON，对当前排除仅寿康门与明确增强的唯一院墙对象后完整渲染、collider元数据、architecture/nav、walkables、rooms、map/regions相同；非目标render SHA256 `80466c8775584025f05f6f8e23d0ede81d464f1e26043efed481746f2f701e64`。
- 原中央顶与三面完整墙几何逐项同父；原三墙proxy保留。这个结论不意味着三墙物理未变。
- 实World原寿康门→寿康前殿往返10/60Hz走跑跳；院内两侧/北边、院外两侧/北边原地面路线双向通过；所有新增源全身oracle。
- 全长帽顶回路包括两北角双向、限制过冲/侧偏、每角停稳且实际帽源支持；12m高落各真实屋顶/帽瓦及两侧实际地面；石几在保留原屋檐下，使用已验净空1.75m-feet短落而非虚称12m会越过屋顶落至石几。
- standing/seated/moving NPC不变成平台，不误重置跳跃；generic .3/.5身体、见证外缘和真正dispatch边±ULP双向、10/60Hz控制器；4锚/11面duplicate、downgrade、移动/错域/ground注入、实际Environment变更/移除/卸载/reload。
- 慈宁及延寿历史whole-graph retention在新增寿康profile后按预期红测：只冻结历史接受输入分别9a246a96/36426e4f，继续运行当前production builder及全部旧断言；其他motion/source等仍读当前输入。新增寿康当前全图对照补齐本轮非目标保护，没有更新golden或删断言来掩盖回归。
- `zone-lint.log`: 实跑 `npm run test:zones` **exit 2**，仍在reachFrom报既有 `Unsupported furniture-domain shape`；与父延寿zone-lint.log对照，除合理的28 collider/1 walkable增量、时长和源码行号外，既有门净空警告/错误与异常一致。未称geometry lint通过。
- schema实跑7区0error/9旧warning；源码语法与diff检查通过。无默认npm test脚本，无大bundle/GPU截图。

## 原始反例与测试纠正
完整保留所有red TAP：旧generic形缺profile；白石墩净口3.5m→各向外.05后实际>=3.6；金色实心背景盖绿红→真正边框/环；generic阈石支撑穿入→有界真实源strict；低帽顶进入原高墙→完整原墙真源；独立复核发现Environment patch少外侧.25m→只扩验源缓存x[266.63,311.77]，不扩dispatch。

部分失败是fixture错误，明确不冒充生产修复：初筛BoxGeometry.parameters找不到已转BufferGeometry的墙；重复测试误用已归一scope；NPC初feet2.8穿入4.4门楣改为净空2.5；ULP外向判定修正后另加真正跨域；材质测试在atlas尚未构建前读null，及误猜6种实际只有5种材质，改精确5名与final全材质非空检查；12m石几落体先落原顶/3m初态撞檐，按实际净空修正短落。原日志原样留存。

## 成本、未验与回滚
真实整门+四墙，而非局部开关：合并meshes **10→14**、triangles **1758→7192**、属性/索引bytes **168768→623856**；raw meshes41→70/bytes167780→610948；colliders7→35，walkables0→1，rooms保持0。metrics.json含源码hash。CPU规模增加明确，不等同GPU帧率/显存或移动端性能；GPU视觉与性能未验。

精细雕绘、真实背面、广场完整建筑、历史细部和当前开放状态未验。旧慈荫东梢北出口、各原区域未闭细部及既有geometry lint失败继续保留。本轮可整提交回退至36426e4f；不推送/部署/改main，14份旧脏报告原样保留。磁盘约1709MiB，增量小文件，不生成大产物。

共享命令使用 `node --import ./scripts/major-pilots/shoukang-entry/preserve-r104-reports.mjs --test --test-concurrency=1 --test-reporter=tap`，覆盖r100两组/r104四组/r65/r91及xishang、jingqi、changyin、jiyun-rail、jiyun-lower-panels所有test。preload只把4个固定R104旧脏报告输出移至本轮shared-r104，原测试和断言不改；命令返回0，四份新输出均存在，14旧报告SHA256全部不变（preserved-dirty-before/after.json）。

最终旧32组已通过；原始门净空lint旧错误仍保留。本轮源/测试/日志约0.5MiB，磁盘约1709MiB。

独立只读终审：未见实质阻断；高墙物理扩大、Environment见证红→绿、真实跨域/帽顶停稳支持、历史输入迁移、输出重定位及旧报告保留已核。细节/GPU未验和旧lint失败继续保留。
