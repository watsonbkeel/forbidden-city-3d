# 慈荫楼：完整正立面及安全入口接口
基线 `39f79c3b`，区域 `FC-930B046FD0` / outer-west (258.5,128.1)。本次只局部模块及唯一profile绑定，无数据身份/主轴/屋顶/台基/后墙/楼梯/室内陈设改造，无共享扫掠/SAT/容差算法修改，无上传/部署/main操作。原中央错误入口改为正面照片支持的两梢入口；真实全身路线保留东梢侧室、西梢、西梯、上层中央门及五湾整条前廊。

## 证据与表达边界
官方楼页 https://www.dpm.org.cn/explore/building/236574.html ：两层各五间、东梢前后门与西墙连室口、西梢楼梯。官方父图集 https://www.dpm.org.cn/explore/building/236536.html 及已实际查看的正立面 https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efee59ec132b.jpg 、牌匾 https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efee59ebf97e.jpg 。原8034图树挡重，不单凭它复原。URL日期非拍摄日期。
新下层两梢门/中三槛窗，上层中门/四窗；40扇叶身、10湾横披/边框、额枋、上栏低彩板与36处分段垂饰、端门8级可见台阶和牌匾整体关系。细雕/龙纹/满文不声称精确；红金门窗为共面程序彩色拟合，非镂空照片贴图；垂饰为逐块有实体的阶梯轮廓拟合。中文建筑名仅识别，不是历史书法复制。照片门姿与现代游客可达性未验。

## 验证
- `final.tap`：`node --test --test-concurrency=1 --test-reporter=tap tests/major-pilots/ciyin/*.test.mjs`，26/26，20.97秒。含真实TextureLibrary/牌匾图集、全部新增Float32源面到实际merge、封闭实物owner包络/零面积面、彩色材质值和真实重叠点depth层序、注册失效/卸载/dispose、父源码保留、NPC站坐、generic kinematic、真实World两端门/侧室/西梯/整上廊、10/60Hz走跑跳、高落/短落、完整半径身体Oracle、有限域与北界交接及邻域全高特殊形状清查。
- `legacy-navigation-first.tap` 11/13保留；台阶中心导航错误（旧完整身体已触阶而中心仍宣称0），修正为真实接触前后离散点且实际Environment绑定，原判据不放宽。`legacy-navigation-final.tap`全组六楼入口13/13，19.01秒。
- `handoff-final.tap` 9/9：0.3/0.5身体、±ULP/.01/.25北界、10/60Hz、原三片4.8楼板、下层不顶升、NPC阻挡不假落地。`upper-handoff-red.tap`证实初版上层witness超范围，最终空间限同有限handoff。
- `paint-depth-red.tap`保留同深度失败。`paint-layer-final.tap`3/3，最终实际合并材质及同一叶/横披红格叠黑底、金纹叠蓝/绿底。颜色次序通过局部材质depth bias分层；源顶点不移动、不添加隐形面或代理；不是GPU照片验收。
- `fall-first.tap`/`fall-start-diagnostic.tap`保存测试起姿误入新匾额/梁的失败，改到真实合法栏上净空，不移生产梁匾。`fall-final.tap`1/1：两端阶外12m下落与栏上短落，无隧穿且落于真实盒顶。不宣传房顶任意高落完整验收。
- `rear-gap.test.mjs`是明确的KNOWN UNRESOLVED旧缺口复现，不是北出口通过：父/新同被原台基北缘阻挡。World往返只到133.4后门前，不越界宣称到北地面。

## 成本、回滚与未验
`metrics.json`比较实际父构建器与候选完整慈荫楼（同含保留屋顶/台基/楼梯），冻结8个源码哈希：raw meshes585→858；merge meshes14→25；三角11116→23196（+12080）；merge属性/索引字节1067136→1945296；碰撞244→506；walkable11→19。数量增长是实际CPU接触/GPU成本，合并少不代表性能合格。无完整bundle、浏览器同视角、GPU/设备帧率验收，`acceptedWholeObject=false` / `VERIFY_PENDING`。本地commit可整体回滚；没有半开关假回滚，旧源码/旧导航用git show直接加载保留对照。
旧floor装饰.62与物理.6、原台基约.05内缩、后口北地面失败明确未修。另本轮实证寿安旧彩面vertexColors在merge丢失，详见其VALIDATION追加及本报告目录`shouan-color-loss.json`；该缺口不被旧19/19和161/161覆盖。慈荫局部修正不改共享MergeUtils，寿安仍待专门修复。14份原脏报告保留不纳入提交；未生成截图或大包。

共享整组结果与终审待最后补记，不以单项重跑冒充全组。

独立只读终审（2026-10-29 05:11）：已核26/26及5/5配色/运动，无本范围剩余阻断；指出DESIGN后门测试终点旧写134.3，现统一133.4。审查识别并推动上层4.8拦截、有限floor witness及最终共面配色层序修正；非作者自评。9个相关生产/fixture源文件`node --check`通过，`git diff --check`无空白错误，均不替代浏览器验收。

完整原共享命令（与寿安最终复跑同组、全部串行）已完成：`shared-final.tap` **161/161**，293.97秒。覆盖禊赏/景祺/畅音/吉云栏与低彩板、r100运动石栏、r104屋面/前缀等价/整合/锡庆运动、r65控制及r91垂直。不是单项拼接；此前各次红测保留。最终专项26/26完成后才启动此共享组，无重型并发。

追加旧楼梯消费者整组：`legacy-stairs-first.tap`8/16，慈荫8种模式仍硬编码旧中央假门；迁移到照片西梢门→原楼梯路由并绑定真实Environment，宝相原路线不动。`legacy-stairs-final.tap`仍8/16，剩余是支撑oracle只查旧0.3半径，实际新严格完整身体0.5半径在z120.548已触0.24真实台阶（中心尚未在台阶上）。只对慈荫使用实际0.5半径足迹，仍要求原精确可见面射线证据，不加生产容差、不放松可见支持标准；其他对象仍0.3。`legacy-stairs-body-final.tap` **16/16**，5.53秒，包含宝相/慈荫10/60Hz步行/跑步、正向/后退完整上下往返。这不是简单跳过旧失败或改成单项测试。

旧楼梯消费者迁移经独立只读复核认可，16/16日志已核。源码/测试diff无空白错误；原始红测TAP保留Node诊断自带空白行，因此包含这些原始日志的全量git diff --check会报空白，未改写历史诊断以掩盖此输出。
