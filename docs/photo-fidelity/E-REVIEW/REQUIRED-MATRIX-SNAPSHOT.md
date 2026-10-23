# R62-E 全61对象 /854细项可执行性审查

## 结论

- 61个对象、488项外观、366项室内，完整保留854个原细项。0项宣称验收完成。
- 本次纳入景仁、承乾、钟粹及静态图片的实看记录，并分别标明可见范围、未覆盖范围、空间定位与浏览器验收缺口。
- 图像观察来自证据审阅者，本矩阵编写者未重复查看像素；官方文字、图像观察、代码差异与视觉验收不混为一项。
- 承乾正殿窗口分区、承乾后殿槛窗、钟粹后殿槛窗/前廊新增为有源工程项。钟粹后殿匾额只记“可见、字待核”。
- 已有专属成果保留，已指定的四个实现范围不重复；未知家具不补造，有证差异不一律归入缺源。

代码差异依据原审查快照 fea982dd79ecd64c69724bc23984cbf7a6dd191b。本次只更新证据覆盖，不自动认证后续代码提交或替代浏览器对照。

## 本次实看证据覆盖

|对象/图片|可支持|不能推出|
|---|---|---|
|景仁01/04、02、05/06、07、08|正殿四窗、外匾、后殿高槛分区窗、井亭、翼角局部|不能覆盖全院、背侧、全部屋角或室内库存|
|承乾01/04/05|正殿四高槛窗中宽方格、两侧窄菱格|不能用统一菱格替代；后檐未覆盖|
|承乾03|五间后殿、高槛大矩格玻璃窗|不能照搬正殿窗样或认证室内|
|钟粹04|前殿旁井亭与玉兰|具体定位/尺度和植栽年代仍待核|
|钟粹05|后殿上步纹下玻璃、中央门、前檐廊架、可见外匾|匾字未可靠转写；前廊深度、后侧、室内未覆盖|
|螽斯、麟趾、苍震静态图|螽斯单开墙门/小屋顶/近匾、麟趾背面墙门、苍震琉璃门|运行实体及空间坐标仍需绑定，不授权放到泛用锚点|
|天穹静态图|入口门口|不能代表五间主殿；独立院落不得挂成景阳子殿|
|乾东静态图|仅敬事房匾|不能覆盖五所各三进或未定位的任一子殿|
|毓庆两张外图、味余8350|外匾、一院斜角、味余局部室内|不能覆盖毓庆四进总院、前后殿全室或其它子殿|
|斋宫两张静态图|匾额及院角现状，含现代玩具鹿/展览banner|不能当清代原状物件；父院/正殿边界仍待定位|
|诚肃静态图|树遮前院局部|不能称完整外观；被遮门窗及室内继续开放|
|奉先正面图|前殿可见部分|本次不计匾额近景实看；不覆盖后殿/穿堂/室内|

钟粹图05官网title/alt仅为“钟粹宫”，正文未提供该现匾转写。历史改名也不是今匾证据。参见[钟粹宫官方页](https://www.dpm.org.cn/explore/building/236484.html)。

## 优先下3个有源范围

1. 奉先后殿15→9间单檐精确profile；非前殿重做
- 依据与差异：官网明确后殿九间、单檐庑殿。 /items/54: w=51.6、未设bays，kit按宽度生成15间。
- 限定修改：只在现有后殿精确profile改9间；单檐、坐标包络保留。前殿已已有独立实现不重复。
- 验证：20根前后檐柱、中央洞/碰撞、单檐、既有路线；后殿家具、穿堂和全部室内仍未验收。
- 来源：https://www.dpm.org.cn/explore/building/236430.html
2. 景仁后殿高槛/玻璃下扇/上步纹，已有实看记录
- 依据与差异：证据审阅者实际观察官图05/06：后殿高槛、玻璃下扇和上部步纹可辨。 /items/3保留R39五间硬山，但门窗仍由KIT默认整高lattice_doors生成。
- 限定修改：在既有后殿精确profile改正面槛墙与上下分区窗；保留R39硬山/柱网，不拿正殿后檐玻璃方案代替后殿正面。
- 验证：五间柱网/齐平屋端不变；四个非中间窗口上下分区、中央入口/COL、材质释放及同视角浏览器；米数为局部图拟合。
- 来源：https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d16b8c46ab.jpg；https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d16b8c7345.jpg
3. 景仁/钟粹实际low路径补5走兽；不全局切high
- 依据与差异：两个本体官页均明确檐角走兽5个。 CourtKit.roof默认detail=low，addHip在!ctx.hd直接return，实际省略全部走兽。只有未启用的high分支才按W给4，不能当实际结果。
- 限定修改：为这两处确切屋顶增加有界、低开销5兽/角实现，仙人另计；不能只改未执行的计数或全局切high，保留其它殿与R58三大殿profile。
- 验证：实际生产low路径四角各5兽+独立仙人；脚底接真实脊面、无重叠；不产生整屋高分段开销，检查合并、材质释放/邻殿签名与浏览器。
- 来源：https://www.dpm.org.cn/explore/building/236509.html；https://www.dpm.org.cn/explore/building/236484.html

## 其它有源工程差异与范围修复

### E-D02 · ASSIGNED_BY_OWNER_DO_NOT_DUPLICATE
- 依据：官网明确前檐次、梢间为槛墙/槛窗。
- 快照差异：EAST.windowBuilder 对景仁 side<0 return false，南面4个非中间格仍走整高 lattice_doors。
- 应做：给南面4窗建立本殿专属槛墙+上部窗框；北檐R40矩形玻璃与前后中央通路保持；精细菱花另核图。
- 验证：实际生成4个南面槛窗、旧整高面删除、中央门不变；保留北檐签名/屋顶/宝座层策略；匹配照片后再视觉验收。
- 来源：https://www.dpm.org.cn/explore/building/236509.html
### E-D04 · AFTER_LOCATION_CONFIRMATION
- 依据：各宫正文确认前院侧殿三间硬山。
- 快照差异：10个侧殿默认3间恰合，但hardGableEnd未启用；kit传roof width=w+.5，RoofBuilder端部另加.3，瓦端相对山墙中心线外挑约.55m、相对0.7m厚墙外面约.20m。
- 应做：先完成既有前院候选绑定，再精确启用齐平硬山端和显式3间。不得改全部gable、后院新增壳或既有R39后殿。
- 验证：每个精确instance实际屋端顶点/山墙齐平、3间柱网；侧向rot后仍正确；家具不随修顶通过。
- 来源：https://www.dpm.org.cn/explore/building/236509.html；https://www.dpm.org.cn/explore/building/236438.html；https://www.dpm.org.cn/explore/building/236484.html；https://www.dpm.org.cn/explore/building/236518.html；https://www.dpm.org.cn/explore/building/236511.html
### E-D05 · P0_CORRECT_PROVENANCE_AND_DEFAULT_LAYER
- 依据：任务要求现状层不把未知陈设以通用宝座代替；R39/R48明确这些座具未核。
- 快照差异：5座各4块retained-throne-component。throne=false但保留A:palace-front会生成三层台、宝座、屏风、八角藻井、香亭仙鹤等更大模板。
- 应做：可逆地把未核座具隔离出当前现状展示，保留历史占位可回滚；同时禁用fallback预设。精确兼容EAST的throne===true guard，不改全局默认，不添加假展柜。
- 验证：对象级0个未核宝座/备用预设物体及对应碰撞；专属窗/天花/匾、门、房间spawn/寻宝、人物开关保持。未知不等于历史空殿。
- 来源：主需求未知家具/现状层规则与已有实现的未核声明。
### E-D06 · P0_CORRECT_PROVENANCE_AND_DEFAULT_LAYER
- 依据：没有对应房间库存和位置图，不可用通用寝居/厅堂布局代替。
- 快照差异：24个现有附属/未定壳仍自动furnish hall或room：长案/椅/柜/凳，或炕床/方桌/柜；含1931库房与奉先后殿。
- 应做：对象级隔离未核预设并保留rollback；不会因此认定房内现实无物。STORE内部重新调kit.hall，单改zone interior字段无效且被guard拒绝。
- 验证：每个命中frame的可见物体与COL同步去除；未知库存状态明确，支持面/入口/专属外立面不变；不能误杀有来源固定装修。
- 来源：主需求未知家具/现状层规则与已有实现的未核声明。
### E-D07 · P0_QUEUE_RELATIONS
- 依据：斋宫为两进院，诚肃为后寝；毓庆为四进，前后工字殿及各门/小室有自身边界。
- 快照差异：canonical两父项仍单体候选且requiredChildIds均空；诚肃parentCandidates空；毓庆父项室内source直接指味余局部。
- 应做：修复aggregate/正殿双义边界和依赖关系，保留旧ID；母项只汇总子空间证据。继德堂不另造第二个后殿；味余图不认证毓庆前殿。
- 验证：不存在父子实体重复计数、遗漏子项导致的提前完成、图片scope自动传播；新增子ID保留迁移链。
- 来源：https://www.dpm.org.cn/explore/building/236463.html；https://www.dpm.org.cn/explore/building/236570.html
### E-D08 · P0_QUEUE_RELATIONS
- 依据：官网写西邻景阳宫，独立院落，非景阳宫子殿。
- 快照差异：canonical parentCandidates=[景阳宫]，属邻接词误当父院。
- 应做：把邻接与父属关系分开，保留E区任务与稳定ID；入口门图不绑定正殿。
- 验证：天穹不受景阳父院验收汇总；其天穹门/配殿/群房仍单独展开。
- 来源：https://www.dpm.org.cn/explore/building/236542.html
### E-D09 · TEXT_TYPE_AVAILABLE_IMAGE_FIT_PENDING
- 依据：官文分别给出二龙戏珠天花/赞德宫闱与淑慎温和内匾。
- 快照差异：景仁/钟粹无相应内匾实现；景仁仍默认通体彩画平面天花。
- 应做：建立明确缺失固定装修细项，可做文本确定的类型/文字示意；图案原作、网格密度/匾尺寸需本体图，不伪称精确复刻。
- 验证：外部殿名匾与内部匾分开；不借承乾双凤/景阳双鹤；加入前后截图后仍仅局部通过。
- 来源：https://www.dpm.org.cn/explore/building/236509.html；https://www.dpm.org.cn/explore/building/236484.html
### E-D11 · SOURCED_NEXT_CANDIDATE
- 依据：图库01/04/05显示四个高槛窗，各窗中部宽方格区与两侧窄菱格区。
- 快照差异：R48为统一double-cross-four-diamond纹理与三等分竖梃；没有中宽/侧窄的异型分区。
- 应做：仅在承乾正殿精确profile细分四个正面槛窗，中部矩格与两侧菱格分别实现；不全局更改R48共用窗型，不猜背面。
- 验证：四窗与中央门/通路保留；窗宽比例为可回滚照片拟合，不写成实测；避免纹理平铺跨越分区，检查碰撞、相机同视角、邻殿不变。
- 来源：https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e980b05e328d.jpg；https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e980b05dbe20.jpg；https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efeddd7e7f80.jpg
### E-D12 · SOURCED_NEXT_CANDIDATE
- 依据：图库03显示五间后殿、高槛大矩格玻璃窗。
- 快照差异：R39五间硬山壳已有，窗仍为默认整高格扇。
- 应做：保留R39壳、柱网和中央入口，只在本后殿精确profile补槛墙及大矩格玻璃窗；不套正殿菱格。
- 验证：非中央窗数量与分区逐图拟合；玻璃透明度不作历史材料定量结论；保留屋顶齐平端、通路/COL与已登记房间。
- 来源：https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e980b05e64ad.jpg
### E-D13 · SOURCED_NEXT_CANDIDATE
- 依据：图库05显示上步纹、下玻璃扇、中央门和前檐廊架；匾额可见但字待核。
- 快照差异：R39五间硬山后殿仍为默认整高格扇；独立前廊空间/窗墙退进关系未按此图建立。
- 应做：先按本殿照片改上下分区高槛窗，再独立核定前廊与围护退进、柱列及屋檐连续关系；不直接复制正殿2m廊深。匾字保留未定。
- 验证：窗/中央门有源可做；廊深、接檐与碰撞须在保留壳的约束下拟合并标非测绘；照片不覆盖后立面/室内；不得以历史名或不可靠猜读生成匾字。
- 来源：https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e99850656e11.jpg

## 身份与陈设边界

- 斋宫与毓庆的父院/正殿双义未分清，两个父项必需子项为空；诚肃父属斋宫缺链。应修依赖而非另加通用宫殿。
- 继德堂不能再造为第二个后殿；味余局部内景不能向毓庆其它房间传播。官文“东耳房”与同页术语“东次间”冲突保留。
- 天穹是景阳东邻的独立院落，不是景阳子殿；入口图不认证主殿。
- 10个后院配殿不能借用10个前院侧殿；乾东5个同排候选壳不是5组三进院落。
- 原快照5主殿通用宝座与24个附属/未定壳通用家具没有本房库存证明。仅设置throne=false可能激活更大palace-front模板，必须同时防止回退并保留可回滚分层。后续实现须另核。

## 完整854项分类矩阵

标志可叠加：R 已有待逐图对照；D 具体工程/范围差异；U 仍有必要图像或视角未覆盖；N 输入尚无确认本体/室内图；L 实体或房间定位缺口；B 浏览器对照待验；A 父组依赖；W 已指定/已实现范围，不重复；C 来源冲突；O 已继承明确实看记录（非编写者独立观察）。每格均有B，表中仅省略显示。O不等于通过，U+O表示已看局部但必要视角仍缺。

E1平面院落，E2屋顶，E3柱梁彩画，E4门窗，E5台阶栏杆，E6附属连接，E7外匾，E8院设施；I1分间层高地面，I2顶与固定装修，I3家具，I4陈设关系，I5用途，I6缺失/无证物。JSON逐格保留原featureId、发现、下一步、来源、代码和局部覆盖。

|对象ID/名称|E1|E2|E3|E4|E5|E6|E7|E8|I1|I2|I3|I4|I5|I6|
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
|FC-6AF6DCFC02 景仁宫|RU|DO|RU|DWO|RU|RU|RO|LO|RUL|DUL|DUL|DUL|DUL|DUL|
|FC-921CB4CE37 景仁门|RU|RU|RU|RU|RU|RU|RU|RU|RN|RN|RN|RN|RN|RN|
|FC-2E5B97AD6F 景仁宫后殿|RU|RU|RU|DO|RU|RU|RU|RU|RN|RN|DN|RN|DN|DN|
|FC-D4E740DED3 景仁宫东配殿|RUL|DUL|DUL|RUL|RUL|RUL|LU|RUL|RNL|RNL|DNL|RNL|DNL|DNL|
|FC-1B734F5453 景仁宫西配殿|RUL|DUL|DUL|RUL|RUL|RUL|LU|RUL|RNL|RNL|DNL|RNL|DNL|DNL|
|FC-808DBF510F 景仁宫后殿东配殿|LU|LU|LU|LU|LU|LU|LU|LU|LN|LN|LN|LN|LN|LN|
|FC-C61F02E5E9 景仁宫后殿西配殿|LU|LU|LU|LU|LU|LU|LU|LU|LN|LN|LN|LN|LN|LN|
|FC-42D58B9B0D 承乾宫|RU|RU|RU|RDO|RU|RU|RU|RU|RN|RN|DNL|RN|DNL|DNL|
|FC-7668331735 承乾门|RU|RU|RU|RU|RU|RU|RU|RU|RN|RN|RN|RN|RN|RN|
|FC-FCDFE021DF 承乾宫后殿|RU|RU|RO|RDO|RU|RU|RU|RU|RN|RN|DN|RN|DN|DN|
|FC-27581842CA 承乾宫东配殿|RUL|DUL|DUL|RUL|RUL|RUL|LU|RUL|RNL|RNL|DNL|RNL|DNL|DNL|
|FC-E2BBEF5EA0 承乾宫西配殿|RUL|DUL|DUL|RUL|RUL|RUL|LU|RUL|RNL|RNL|DNL|RNL|DNL|DNL|
|FC-53A9B689A3 承乾宫后殿东配殿|LU|LU|LU|LU|LU|LU|LU|LU|LN|LN|LN|LN|LN|LN|
|FC-7A11F91B5D 承乾宫后殿西配殿|LU|LU|LU|LU|LU|LU|LU|LU|LN|LN|LN|LN|LN|LN|
|FC-479353AF2C 钟粹宫|RU|DU|RU|RU|RU|RLU|RU|LO|RUL|RUL|DUL|DUL|DUL|DUL|
|FC-818A015688 钟粹门|RU|RU|RU|RU|RU|RU|RU|RU|RN|RN|RN|RN|RN|RN|
|FC-8B4AAF5852 钟粹宫后殿|RU|RU|RU|RDO|RU|RDLO|RLO|RU|RN|RN|DN|RN|DN|DN|
|FC-670877B32E 钟粹宫东配殿|RUL|DUL|DUL|RUL|RUL|RUL|LU|RUL|RNL|RNL|DNL|RNL|DNL|DNL|
|FC-C2476163FF 钟粹宫西配殿|RUL|DUL|DUL|RUL|RUL|RUL|LU|RUL|RNL|RNL|DNL|RNL|DNL|DNL|
|FC-29A3CF12B3 钟粹宫后殿东配殿|LU|LU|LU|LU|LU|LU|LU|LU|LN|LN|LN|LN|LN|LN|
|FC-A50FDDE804 钟粹宫后殿西配殿|LU|LU|LU|LU|LU|LU|LU|LU|LN|LN|LN|LN|LN|LN|
|FC-D2B7EEC1F3 永和宫|RU|RU|RWUL|RU|RU|RWUL|RU|RU|RUL|RU|DUL|RUL|DUL|DUL|
|FC-6F90562528 永和门|RU|RU|RU|RU|RU|RU|RU|RU|RN|RN|RN|RN|RN|RN|
|FC-9503F7B70D 同顺斋|RU|RU|RU|RU|RU|RU|RU|RU|RN|RN|DN|RN|DN|DN|
|FC-AD0DA87365 永和宫东配殿|RUL|DUL|DUL|RUL|RUL|RUL|LU|RUL|RNL|RNL|DNL|RNL|DNL|DNL|
|FC-2C0932AE68 永和宫西配殿|RUL|DUL|DUL|RUL|RUL|RUL|LU|RUL|RNL|RNL|DNL|RNL|DNL|DNL|
|FC-D240B3E3A3 永和宫后殿东配殿|LU|LU|LU|LU|LU|LU|LU|LU|LN|LN|LN|LN|LN|LN|
|FC-171FEF95E4 永和宫后殿西配殿|LU|LU|LU|LU|LU|LU|LU|LU|LN|LN|LN|LN|LN|LN|
|FC-9DA5992A78 景阳宫|RU|RU|RU|RU|RU|RU|RU|RU|RN|RN|DNL|RN|DNL|DNL|
|FC-A6CA8EE18C 景阳门|RU|RU|RU|RU|RU|RU|RU|RU|RN|RN|RN|RN|RN|RN|
|FC-8B02DC003C 御书房|RUL|RWUL|RWUL|RWUL|RUL|RUL|RWUL|RUL|RNL|RNL|DNL|RNL|DNL|DNL|
|FC-493ECC78C4 景阳宫东配殿|RUL|DUL|DUL|RUL|RUL|RUL|LU|RUL|RNL|RNL|DNL|RNL|DNL|DNL|
|FC-1EBDC0DA98 景阳宫西配殿|RUL|DUL|DUL|RUL|RUL|RUL|LU|RUL|RNL|RNL|DNL|RNL|DNL|DNL|
|FC-FE29005359 景阳宫后殿东配殿|LU|LU|LU|LU|LU|LU|LU|LU|LN|LN|LN|LN|LN|LN|
|FC-BD30A6AEF7 景阳宫后殿西配殿|LU|LU|LU|LU|LU|LU|LU|LU|LN|LN|LN|LN|LN|LN|
|FC-87C1541D29 延禧门|RU|RU|RU|RU|RU|RU|RU|RU|RN|RN|RN|RN|RN|RN|
|FC-8317089C69 灵沼轩|RU|RU|RU|RU|RU|RU|RU|RU|RN|RN|RN|RN|RN|RN|
|FC-C8D368757C 延禧宫北楼|RU|RU|RU|RU|RU|RU|RU|RU|RN|RN|DN|RN|DN|DN|
|FC-8FECDC6AD1 延禧宫东楼|RU|RU|RU|RU|RU|RU|RU|RU|RN|RN|DN|RN|DN|DN|
|FC-13EDF0348B 延禧宫西楼|RU|RU|RU|RU|RU|RU|RU|RU|RN|RN|DN|RN|DN|DN|
|FC-C716A8E34A 毓庆宫|DLO|LU|LU|LU|LU|DLU|LO|LU|DLO|DLO|DLO|DLO|DLU|DLO|
|FC-8D4739DF1E 斋宫|DLO|LU|LU|LU|LU|DLU|LO|LO|LN|LN|LN|LN|DLN|LN|
|FC-D8AEF2E8A9 奉先殿|RU|DWO|DWO|RWLO|RU|LU|RWUL|RU|RN|RN|DN|RN|DN|DN|
|FC-DD68A90CC7 诚肃殿|DLO|LU|LU|LUO|LU|DLU|LU|LU|LN|LN|LN|LN|DLN|LN|
|FC-E8CC6A03C1 前星门|DLU|LU|LU|LU|LU|DLU|LU|LU|LN|LN|LN|LN|DLN|LN|
|FC-4D8561AE5D 祥旭门|DLU|LU|LU|LU|LU|DLU|LU|LU|LN|LN|LN|LN|DLN|LN|
|FC-1ED6740852 惇本殿|DLU|LU|LU|LU|LU|DLU|LU|LU|LN|LN|LN|LN|DLN|LN|
|FC-7AACE4D51F 继德堂|DLU|LU|LU|LU|LU|DLU|LU|LU|LN|LN|LN|LN|DLN|LN|
|FC-59F7BB24CB 味余书室|LUC|LU|LUC|LU|LU|DLU|LU|LU|LCO|LCO|LCO|LCO|DLU|LCO|
|FC-CF00F15FA8 螽斯门|LO|LO|LU|LO|LU|LU|LO|LU|LN|LN|LN|LN|LN|LN|
|FC-7CE51EACB4 天穹宝殿|DLO|LU|LU|LUO|LU|LU|LU|LU|LN|LN|LN|LN|LN|LN|
|FC-4188F97D66 乾东五所|ADLU|ALU|ALU|ALU|ALU|ALU|ALO|ALU|ALU|ALU|ALU|ALU|ALU|ALU|
|FC-75AB2BF1F2 麟趾门|LO|LO|LU|LO|LU|LU|LU|LU|LN|LN|LN|LN|LN|LN|
|FC-9ABF21A275 苍震门|LO|LO|LU|LO|LU|LU|LU|LU|LN|LN|LN|LN|LN|LN|
|FC-1400B5FC62 延禧宫|ADU|ALU|ALU|ALU|ALU|ALU|ALU|ALU|ALU|ALU|ALU|ALU|ALU|ALU|
|FC-EF18B2CEC2 奉先门|RN|RN|RN|RN|RN|RN|RN|RN|RN|RN|RN|RN|RN|RN|
|FC-7C94D62DDC 乾东五所头所|ADLU|ALU|ALU|ALU|ALU|ALU|ALU|ALU|ALU|ALU|ADLN|ALU|ADLN|ADLN|
|FC-58235BAE6E 乾东五所二所|ADLU|ALU|ALU|ALU|ALU|ALU|ALU|ALU|ALU|ALU|ADLN|ALU|ADLN|ADLN|
|FC-ADA14569A3 乾东五所三所|ADLU|ALU|ALU|ALU|ALU|ALU|ALU|ALU|ALU|ALU|ADLN|ALU|ADLN|ADLN|
|FC-E935697C20 乾东五所四所|ADLU|ALU|ALU|ALU|ALU|ALU|ALU|ALU|ALU|ALU|ADLN|ALU|ADLN|ADLN|
|FC-5B8C4984E3 乾东五所五所|ADLU|ALU|ALU|ALU|ALU|ALU|ALU|ALU|ALU|ALU|ADLN|ALU|ADLN|ADLN|

## 61对象逐项残余

### FC-6AF6DCFC02 景仁宫
- 外观：E1：/items/2 主殿现存；R40 专属后中门、后檐玻璃示意、后阶及座位访问退让；R49B 匾额挂层拟合。 位置/包络仍为拟合，不包含同名region全院。；E2：官网本体5走兽；实际CourtKit.roof默认low，addHip省略全部走兽。high分支4兽未运行，不算当前实际计数。；E4：南侧4个次梢间仍为整高通用隔扇，官文明确槛墙/槛窗；北檐R40玻璃和双向中门已存在。；E7：正殿外匾近景已经实看；仅支持该外匾可见范围，不能代替内匾或整殿身份/外观验收。；E8：官图07井亭已由证据审阅者实际观察；当前声明无独立实例。照片主体已可用，但井亭精确位置/周边关系仍须定位，不再把它写成没有图。
- 室内：I1：已有可进入房间/地面和柱网；实际分间、侧间开口和目标展陈版本尚未核定。；I2：现为通体彩画平面顶；官文可支持二龙戏珠天花类型，但网格/纹样/配色/现状顶图尚未核。；I3：现有4块通用宝座及其碰撞未被本房现状证据确认。不得把历史座具占位当现代陈列；throne=false会触发另一套palace-front预设。；I4：缺本殿已见于官文的内匾：赞德宫闱；外部殿名匾不是这块内匾。图形/尺寸/准确挂位还须房间图。
### FC-921CB4CE37 景仁门
- 外观：E1：/items/0现有单洞墙门模型与门洞引用；没有本体专项R39/R48复原，不用门名推出门型已对。
- 室内：I1：有可穿越门洞，runtime未注册室内房间不代表门厅任务不适用；必须核门洞深度/柱网/台阶/梁架。
### FC-2E5B97AD6F 景仁宫后殿
- 外观：E1：/items/3 已有后殿候选；不因无中文name重建。R39明确5间硬山/齐平山墙。；E4：证据审阅者已看05/06，确认后殿高槛玻璃下扇+上部步纹；当前R39后殿仍为默认整高格扇，存在具体可做差异。
- 室内：I1：/items/3 现登记hall游戏房间；柱网/入口与全进深空间存在，但当前真实分间和楼层不由模板证明。；I3：/items/3 自动生成generic hall家具；长案、椅、柜、凳没有对应房间位置证据。
### FC-D4E740DED3 景仁宫东配殿
- 外观：E1：已有声明位置及包络为游戏拟合；尚未逐视角确认本体与院墙/相邻实体。；E2：/items/4 三间通用gable壳；未设hardGableEnd使瓦端超山墙中心线约0.55m、超墙外面约0.20m，官文侧殿为硬山。
- 室内：I1：/items/4 现登记room游戏房间；柱网/入口与全进深空间存在，但当前真实分间和楼层不由模板证明。；I3：/items/4 自动生成generic room家具；炕床、方桌、凳、柜没有对应房间位置证据。
### FC-1B734F5453 景仁宫西配殿
- 外观：E1：已有声明位置及包络为游戏拟合；尚未逐视角确认本体与院墙/相邻实体。；E2：/items/5 三间通用gable壳；未设hardGableEnd使瓦端超山墙中心线约0.55m、超墙外面约0.20m，官文侧殿为硬山。
- 室内：I1：/items/5 现登记room游戏房间；柱网/入口与全进深空间存在，但当前真实分间和楼层不由模板证明。；I3：/items/5 自动生成generic room家具；炕床、方桌、凳、柜没有对应房间位置证据。
### FC-808DBF510F 景仁宫后殿东配殿
- 外观：E1：官文已列三间配殿，但10个后院侧殿均无匹配声明。现有前院同侧房不是本项；需现存主体/轮廓定位后建。
- 室内：I1：缺本房平面/视角与运行绑定，不将历史文字/透视画转成可走入房间。
### FC-C61F02E5E9 景仁宫后殿西配殿
- 外观：E1：官文已列三间配殿，但10个后院侧殿均无匹配声明。现有前院同侧房不是本项；需现存主体/轮廓定位后建。
- 室内：I1：缺本房平面/视角与运行绑定，不将历史文字/透视画转成可走入房间。
### FC-42D58B9B0D 承乾宫
- 外观：E1：/items/9 主殿现存；R48 保留五间歇山，槛墙菱花窗、双凤类型原创天花、德成柔顺字体匾；家具仍未核。 位置/包络仍为拟合，不包含同名region全院。；E4：R48为统一double-cross-four-diamond纹理与三等分竖梃；没有中宽/侧窄的异型分区。 新实看图已支持中宽/侧窄分区差异，不应继续仅列缺源。
- 室内：I1：已有可进入房间/地面和柱网；实际分间、侧间开口和目标展陈版本尚未核定。；I3：现有4块通用宝座及其碰撞未被本房现状证据确认。不得把历史座具占位当现代陈列；throne=false会触发另一套palace-front预设。
### FC-7668331735 承乾门
- 外观：E1：/items/7现有单洞墙门模型与门洞引用；没有本体专项R39/R48复原，不用门名推出门型已对。
- 室内：I1：有可穿越门洞，runtime未注册室内房间不代表门厅任务不适用；必须核门洞深度/柱网/台阶/梁架。
### FC-FCDFE021DF 承乾宫后殿
- 外观：E1：/items/10 已有后殿候选；不因无中文name重建。R39明确5间硬山/齐平山墙。；E3：R39精确profile已实现五间硬山和齐平山墙/瓦端；外包与等分柱距保留为拟合，纹样/构件尺度仍需本后殿图。；E4：R39五间硬山壳已有，窗仍为默认整高格扇。
- 室内：I1：/items/10 现登记hall游戏房间；柱网/入口与全进深空间存在，但当前真实分间和楼层不由模板证明。；I3：/items/10 自动生成generic hall家具；长案、椅、柜、凳没有对应房间位置证据。
### FC-27581842CA 承乾宫东配殿
- 外观：E1：已有声明位置及包络为游戏拟合；尚未逐视角确认本体与院墙/相邻实体。；E2：/items/11 三间通用gable壳；未设hardGableEnd使瓦端超山墙中心线约0.55m、超墙外面约0.20m，官文侧殿为硬山。
- 室内：I1：/items/11 现登记room游戏房间；柱网/入口与全进深空间存在，但当前真实分间和楼层不由模板证明。；I3：/items/11 自动生成generic room家具；炕床、方桌、凳、柜没有对应房间位置证据。
### FC-E2BBEF5EA0 承乾宫西配殿
- 外观：E1：已有声明位置及包络为游戏拟合；尚未逐视角确认本体与院墙/相邻实体。；E2：/items/12 三间通用gable壳；未设hardGableEnd使瓦端超山墙中心线约0.55m、超墙外面约0.20m，官文侧殿为硬山。
- 室内：I1：/items/12 现登记room游戏房间；柱网/入口与全进深空间存在，但当前真实分间和楼层不由模板证明。；I3：/items/12 自动生成generic room家具；炕床、方桌、凳、柜没有对应房间位置证据。
### FC-53A9B689A3 承乾宫后殿东配殿
- 外观：E1：官文已列三间配殿，但10个后院侧殿均无匹配声明。现有前院同侧房不是本项；需现存主体/轮廓定位后建。
- 室内：I1：缺本房平面/视角与运行绑定，不将历史文字/透视画转成可走入房间。
### FC-7A11F91B5D 承乾宫后殿西配殿
- 外观：E1：官文已列三间配殿，但10个后院侧殿均无匹配声明。现有前院同侧房不是本项；需现存主体/轮廓定位后建。
- 室内：I1：缺本房平面/视角与运行绑定，不将历史文字/透视画转成可走入房间。
### FC-479353AF2C 钟粹宫
- 外观：E1：/items/16 主殿现存；R40 专属前廊、后退2m槛窗和通行拟合；R49B 匾挂层保留。 位置/包络仍为拟合，不包含同名region全院。；E2：官网本体5走兽；实际CourtKit.roof默认low，addHip省略全部走兽。high分支4兽未运行，不算当前实际计数。；E8：实看图04已有井亭与玉兰，不是图源缺失；应逐实例核院落位置，不能按对称新增或把树种/年代当既定。
- 室内：I1：已有可进入房间/地面和柱网；实际分间、侧间开口和目标展陈版本尚未核定。；I3：现有4块通用宝座及其碰撞未被本房现状证据确认。不得把历史座具占位当现代陈列；throne=false会触发另一套palace-front预设。；I4：缺本殿已见于官文的内匾：淑慎温和；外部殿名匾不是这块内匾。图形/尺寸/准确挂位还须房间图。；I5：老建筑页玉器展与当前清单古琴文化展入口不可混合；当前模型仍为通用座具。
### FC-818A015688 钟粹门
- 外观：E1：/items/14现有单洞墙门模型与门洞引用；没有本体专项R39/R48复原，不用门名推出门型已对。
- 室内：I1：有可穿越门洞，runtime未注册室内房间不代表门厅任务不适用；必须核门洞深度/柱网/台阶/梁架。
### FC-8B4AAF5852 钟粹宫后殿
- 外观：E1：/items/17 已有后殿候选；不因无中文name重建。R39明确5间硬山/齐平山墙。；E4：实看图05已给后殿上下分区窗；现有五间硬山壳仍使用默认整高格扇。；E6：前檐廊架已可见，不能再统写未看来源；现壳没有按该图核定的廊架/围护退进关系。；E7：后殿匾可见、字待核。图库05的title/alt仅为“钟粹宫”；正文历史改名不证明现匾字样，不据猜读生成匾文。
- 室内：I1：/items/17 现登记hall游戏房间；柱网/入口与全进深空间存在，但当前真实分间和楼层不由模板证明。；I3：/items/17 自动生成generic hall家具；长案、椅、柜、凳没有对应房间位置证据。
### FC-670877B32E 钟粹宫东配殿
- 外观：E1：已有声明位置及包络为游戏拟合；尚未逐视角确认本体与院墙/相邻实体。；E2：/items/18 三间通用gable壳；未设hardGableEnd使瓦端超山墙中心线约0.55m、超墙外面约0.20m，官文侧殿为硬山。
- 室内：I1：/items/18 现登记room游戏房间；柱网/入口与全进深空间存在，但当前真实分间和楼层不由模板证明。；I3：/items/18 自动生成generic room家具；炕床、方桌、凳、柜没有对应房间位置证据。
### FC-C2476163FF 钟粹宫西配殿
- 外观：E1：已有声明位置及包络为游戏拟合；尚未逐视角确认本体与院墙/相邻实体。；E2：/items/19 三间通用gable壳；未设hardGableEnd使瓦端超山墙中心线约0.55m、超墙外面约0.20m，官文侧殿为硬山。
- 室内：I1：/items/19 现登记room游戏房间；柱网/入口与全进深空间存在，但当前真实分间和楼层不由模板证明。；I3：/items/19 自动生成generic room家具；炕床、方桌、凳、柜没有对应房间位置证据。
### FC-29A3CF12B3 钟粹宫后殿东配殿
- 外观：E1：官文已列三间配殿，但10个后院侧殿均无匹配声明。现有前院同侧房不是本项；需现存主体/轮廓定位后建。
- 室内：I1：缺本房平面/视角与运行绑定，不将历史文字/透视画转成可走入房间。
### FC-A50FDDE804 钟粹宫后殿西配殿
- 外观：E1：官文已列三间配殿，但10个后院侧殿均无匹配声明。现有前院同侧房不是本项；需现存主体/轮廓定位后建。
- 室内：I1：缺本房平面/视角与运行绑定，不将历史文字/透视画转成可走入房间。
### FC-D2B7EEC1F3 永和宫
- 外观：E1：/items/30 主殿现存；R40 三间开放抱厦、圆弧屋面、露椽与正殿素格天花；R49 匾、抱厦接檐拟合保留。 位置/包络仍为拟合，不包含同名region全院。
- 室内：I1：已有可进入房间/地面和柱网；实际分间、侧间开口和目标展陈版本尚未核定。；I3：现有4块通用宝座及其碰撞未被本房现状证据确认。不得把历史座具占位当现代陈列；throne=false会触发另一套palace-front预设。；I5：诚慎仁术展览入口已给，但房间主体/日期未核；现有通用宝座不等于医药展厅。
### FC-6F90562528 永和门
- 外观：E1：/items/28现有单洞墙门模型与门洞引用；没有本体专项R39/R48复原，不用门名推出门型已对。
- 室内：I1：有可穿越门洞，runtime未注册室内房间不代表门厅任务不适用；必须核门洞深度/柱网/台阶/梁架。
### FC-9503F7B70D 同顺斋
- 外观：E1：/items/31 已有后殿候选；不因无中文name重建。R39明确5间硬山/齐平山墙。
- 室内：I1：/items/31 现登记hall游戏房间；柱网/入口与全进深空间存在，但当前真实分间和楼层不由模板证明。；I3：/items/31 自动生成generic hall家具；长案、椅、柜、凳没有对应房间位置证据。
### FC-AD0DA87365 永和宫东配殿
- 外观：E1：已有声明位置及包络为游戏拟合；尚未逐视角确认本体与院墙/相邻实体。；E2：/items/32 三间通用gable壳；未设hardGableEnd使瓦端超山墙中心线约0.55m、超墙外面约0.20m，官文侧殿为硬山。
- 室内：I1：/items/32 现登记room游戏房间；柱网/入口与全进深空间存在，但当前真实分间和楼层不由模板证明。；I3：/items/32 自动生成generic room家具；炕床、方桌、凳、柜没有对应房间位置证据。
### FC-2C0932AE68 永和宫西配殿
- 外观：E1：已有声明位置及包络为游戏拟合；尚未逐视角确认本体与院墙/相邻实体。；E2：/items/33 三间通用gable壳；未设hardGableEnd使瓦端超山墙中心线约0.55m、超墙外面约0.20m，官文侧殿为硬山。
- 室内：I1：/items/33 现登记room游戏房间；柱网/入口与全进深空间存在，但当前真实分间和楼层不由模板证明。；I3：/items/33 自动生成generic room家具；炕床、方桌、凳、柜没有对应房间位置证据。
### FC-D240B3E3A3 永和宫后殿东配殿
- 外观：E1：官文已列三间配殿，但10个后院侧殿均无匹配声明。现有前院同侧房不是本项；需现存主体/轮廓定位后建。
- 室内：I1：缺本房平面/视角与运行绑定，不将历史文字/透视画转成可走入房间。
### FC-171FEF95E4 永和宫后殿西配殿
- 外观：E1：官文已列三间配殿，但10个后院侧殿均无匹配声明。现有前院同侧房不是本项；需现存主体/轮廓定位后建。
- 室内：I1：缺本房平面/视角与运行绑定，不将历史文字/透视画转成可走入房间。
### FC-9DA5992A78 景阳宫
- 外观：E1：/items/37 主殿现存；R48 保留三间庑殿，玻璃槛窗、双鹤原创示意天花、柔嘉肃敬字体匾；没有完成御书房后殿。 位置/包络仍为拟合，不包含同名region全院。
- 室内：I1：已有可进入房间/地面和柱网；实际分间、侧间开口和目标展陈版本尚未核定。；I3：现有4块通用宝座及其碰撞未被本房现状证据确认。不得把历史座具占位当现代陈列；throne=false会触发另一套palace-front预设。
### FC-A6CA8EE18C 景阳门
- 外观：E1：/items/35现有单洞墙门模型与门洞引用；没有本体专项R39/R48复原，不用门名推出门型已对。
- 室内：I1：有可穿越门洞，runtime未注册室内房间不代表门厅任务不适用；必须核门洞深度/柱网/台阶/梁架。
### FC-8B02DC003C 御书房
- 外观：E1：/items/38 已有后殿候选；不因无中文name重建。御书房是景阳后殿不是正殿。
- 室内：I1：/items/38 现登记hall游戏房间；柱网/入口与全进深空间存在，但当前真实分间和楼层不由模板证明。；I3：/items/38 自动生成generic hall家具；长案、椅、柜、凳没有对应房间位置证据。
### FC-493ECC78C4 景阳宫东配殿
- 外观：E1：已有声明位置及包络为游戏拟合；尚未逐视角确认本体与院墙/相邻实体。；E2：/items/39 三间通用gable壳；未设hardGableEnd使瓦端超山墙中心线约0.55m、超墙外面约0.20m，官文侧殿为硬山。
- 室内：I1：/items/39 现登记room游戏房间；柱网/入口与全进深空间存在，但当前真实分间和楼层不由模板证明。；I3：/items/39 自动生成generic room家具；炕床、方桌、凳、柜没有对应房间位置证据。
### FC-1EBDC0DA98 景阳宫西配殿
- 外观：E1：已有声明位置及包络为游戏拟合；尚未逐视角确认本体与院墙/相邻实体。；E2：/items/40 三间通用gable壳；未设hardGableEnd使瓦端超山墙中心线约0.55m、超墙外面约0.20m，官文侧殿为硬山。
- 室内：I1：/items/40 现登记room游戏房间；柱网/入口与全进深空间存在，但当前真实分间和楼层不由模板证明。；I3：/items/40 自动生成generic room家具；炕床、方桌、凳、柜没有对应房间位置证据。
### FC-FE29005359 景阳宫后殿东配殿
- 外观：E1：官文已列三间配殿，但10个后院侧殿均无匹配声明。现有前院同侧房不是本项；需现存主体/轮廓定位后建。
- 室内：I1：缺本房平面/视角与运行绑定，不将历史文字/透视画转成可走入房间。
### FC-BD30A6AEF7 景阳宫后殿西配殿
- 外观：E1：官文已列三间配殿，但10个后院侧殿均无匹配声明。现有前院同侧房不是本项；需现存主体/轮廓定位后建。
- 室内：I1：缺本房平面/视角与运行绑定，不将历史文字/透视画转成可走入房间。
### FC-87C1541D29 延禧门
- 外观：E1：/items/21现有单洞墙门模型与门洞引用；没有本体专项R39/R48复原，不用门名推出门型已对。
- 室内：I1：有可穿越门洞，runtime未注册室内房间不代表门厅任务不适用；必须核门洞深度/柱网/台阶/梁架。
### FC-8317089C69 灵沼轩
- 外观：E1：R32石铁五亭未完工遗构专属builder存在，R48仅reviewed-retained。核现存铁构、石材、池/四角亭，不补拟建完整玻璃宫。
- 室内：I1：遗构仍有内部可见结构核查；当前无整套宫廷家具。历史瓷砖/玻璃设想不证明现存残留范围。
### FC-C8D368757C 延禧宫北楼
- 外观：E1：R32独立1931库房profile存在，双层窗带、浅色下板/上层铁栏保留；短翼长度、屋顶类型/窗数为继承拟合，不能说原清代配殿。
- 室内：I1：仅两层立面；没有已证二层楼板/楼梯/房间，当前为原单层导航空间。二层室内不因外墙两排窗而完成。；I3：1931文物库房当前还保留generic hall/room家具；不可因用途是库房自行换随机木箱。；I5：/items/24 自动生成generic hall家具；长案、椅、柜、凳没有对应房间位置证据。
### FC-8FECDC6AD1 延禧宫东楼
- 外观：E1：R32独立1931库房profile存在，双层窗带、浅色下板/上层铁栏保留；短翼长度、屋顶类型/窗数为继承拟合，不能说原清代配殿。
- 室内：I1：仅两层立面；没有已证二层楼板/楼梯/房间，当前为原单层导航空间。二层室内不因外墙两排窗而完成。；I3：1931文物库房当前还保留generic hall/room家具；不可因用途是库房自行换随机木箱。；I5：/items/25 自动生成generic room家具；炕床、方桌、凳、柜没有对应房间位置证据。
### FC-13EDF0348B 延禧宫西楼
- 外观：E1：R32独立1931库房profile存在，双层窗带、浅色下板/上层铁栏保留；短翼长度、屋顶类型/窗数为继承拟合，不能说原清代配殿。
- 室内：I1：仅两层立面；没有已证二层楼板/楼梯/房间，当前为原单层导航空间。二层室内不因外墙两排窗而完成。；I3：1931文物库房当前还保留generic hall/room家具；不可因用途是库房自行换随机木箱。；I5：/items/26 自动生成generic room家具；炕床、方桌、凳、柜没有对应房间位置证据。
### FC-C716A8E34A 毓庆宫
- 外观：E1：已有身份审计确认无匹配运行实体；先修父院/正殿双义和父子依赖，不先放通用殿壳。；E6：父组与子殿/穿堂/耳房关系不闭合：父项requiredChildIds为空不能代表其子项不必需。；E7：静态图已实看，但仅匾额局部；父院/正殿边界与实际挂点尚需分开核定。
- 室内：I1：8350已由证据审阅者实看，主体限味余书室局部。父项只可引用该子空间的局部观察，不得将局部家具/隔断扩散到其它房间。；I5：斋戒/读书等历史功能有文字证据，不授权填入通用宫廷家具；父项不另造generic室内。
### FC-8D4739DF1E 斋宫
- 外观：E1：院落一角已实看，含现代玩具鹿/展览banner；只支持该拍摄版本局部。应与清代建筑层和历史陈设分开，不能用照片存在推定清代原物。；E6：父组与子殿/穿堂/耳房关系不闭合：父项requiredChildIds为空不能代表其子项不必需。；E7：斋宫匾额图已实看，仅可用于可见匾额，不代表两进院落和诚肃后寝已复原。
- 室内：I1：缺本房平面/视角与运行绑定，不将历史文字/透视画转成可走入房间。；I5：斋戒/读书等历史功能有文字证据，不授权填入通用宫廷家具；父项不另造generic室内。
### FC-D8AEF2E8A9 奉先殿
- 外观：E1：已有声明位置及包络为游戏拟合；尚未逐视角确认本体与院墙/相邻实体。；E2：前殿R62九间重檐已有独立实施范围；后殿/54仍默认15间，官文是9间单檐，两个子体不可互相代表。；E4：R62前殿槛窗/匾位由独立实施范围包含；后檐、后殿、穿堂相接门窗并未被两幅前殿外图覆盖。
- 室内：I1：已有可进入房间/地面和柱网；实际分间、侧间开口和目标展陈版本尚未核定。；I3：R39前殿empty已移除错误朝会宝座，不能称历史空殿；后殿/54仍有generic hall案椅柜凳，祭祀/钟表展版本未核。
### FC-DD68A90CC7 诚肃殿
- 外观：E1：已有身份审计确认无匹配运行实体；先修父院/正殿双义和父子依赖，不先放通用殿壳。；E4：诚肃照片已实看但树木遮挡显著，不能称全外观已看；只对可辨开口作局部记录，其余仍待视角。；E6：父组与子殿/穿堂/耳房关系不闭合：父项requiredChildIds为空不能代表其子项不必需。
- 室内：I1：缺本房平面/视角与运行绑定，不将历史文字/透视画转成可走入房间。；I5：斋戒/读书等历史功能有文字证据，不授权填入通用宫廷家具；父项不另造generic室内。
### FC-E8CC6A03C1 前星门
- 外观：E1：已有身份审计确认无匹配运行实体；先修父院/正殿双义和父子依赖，不先放通用殿壳。；E6：父组与子殿/穿堂/耳房关系不闭合：父项requiredChildIds为空不能代表其子项不必需。
- 室内：I1：缺本房平面/视角与运行绑定，不将历史文字/透视画转成可走入房间。；I5：斋戒/读书等历史功能有文字证据，不授权填入通用宫廷家具；父项不另造generic室内。
### FC-4D8561AE5D 祥旭门
- 外观：E1：已有身份审计确认无匹配运行实体；先修父院/正殿双义和父子依赖，不先放通用殿壳。；E6：父组与子殿/穿堂/耳房关系不闭合：父项requiredChildIds为空不能代表其子项不必需。
- 室内：I1：缺本房平面/视角与运行绑定，不将历史文字/透视画转成可走入房间。；I5：斋戒/读书等历史功能有文字证据，不授权填入通用宫廷家具；父项不另造generic室内。
### FC-1ED6740852 惇本殿
- 外观：E1：已有身份审计确认无匹配运行实体；先修父院/正殿双义和父子依赖，不先放通用殿壳。；E6：父组与子殿/穿堂/耳房关系不闭合：父项requiredChildIds为空不能代表其子项不必需。
- 室内：I1：缺本房平面/视角与运行绑定，不将历史文字/透视画转成可走入房间。；I5：斋戒/读书等历史功能有文字证据，不授权填入通用宫廷家具；父项不另造generic室内。
### FC-7AACE4D51F 继德堂
- 外观：E1：已有身份审计确认无匹配运行实体；先修父院/正殿双义和父子依赖，不先放通用殿壳。；E6：父组与子殿/穿堂/耳房关系不闭合：父项requiredChildIds为空不能代表其子项不必需。
- 室内：I1：缺本房平面/视角与运行绑定，不将历史文字/透视画转成可走入房间。；I5：斋戒/读书等历史功能有文字证据，不授权填入通用宫廷家具；父项不另造generic室内。
### FC-59F7BB24CB 味余书室
- 外观：E1：味余局部室内已经实看，但不提供独立外立面/坐标绑定；正文东耳房与同页术语东次间冲突仍未解决。；E6：父组与子殿/穿堂/耳房关系不闭合：父项requiredChildIds为空不能代表其子项不必需。
- 室内：I1：味余局部内景已实看，非全室库存或平面验收；东耳房/东次间定位冲突仍在。可见构件逐项绑定，未见物不猜造。；I5：斋戒/读书等历史功能有文字证据，不授权填入通用宫廷家具；父项不另造generic室内。
### FC-CF00F15FA8 螽斯门
- 外观：E1：本体在西六宫西二长街南端；清单E保留，不与麟趾门合并，也不把实体放在E默认坐标。；E2：单开墙门、小屋顶已有实看证据，可进入定位后的限定构件方案，不再笼统列为无图；当前仍无已确认运行实例。；E7：已有门匾近景实看；文字/挂点须对应螽斯本门，不能借此把麟趾门合并或移置。
- 室内：I1：没有确认门内图但门洞/梁架仍是必须子项；先定位本体，再核可穿行门厅。
### FC-7CE51EACB4 天穹宝殿
- 外观：E1：官方说景阳宫东邻的独立道教院落；canonical却挂parentCandidates=景阳宫，邻接被误当父属。；E4：实看静态图仅为入口门口；门洞有局部证据，五间正殿门窗仍未覆盖，需分别绑定子体。
- 室内：I1：缺本房平面/视角与运行绑定，不将历史文字/透视画转成可走入房间。
### FC-4188F97D66 乾东五所
- 外观：E1：现有五个同z无名hall+共院墙/泛名门，只能候选对应西到东五所；一所三进不能由一个hall代表。 实看静态图仅敬事房匾，不能扩大成五组三院外观证据。；E7：静态图实际仅敬事房匾，不是乾东五所总图。须先确认匾的具体子实体，不能将五组外匾或立面标成已看。
- 室内：I1：父组只汇总子建筑的分间开口/柱网楼层地面，不得新增同名通用建筑/室内。
### FC-75AB2BF1F2 麟趾门
- 外观：E1：东六宫独立街门，所给静态图是背面；寿春门是历史名，不能借螽斯门造双体。；E2：墙门背面已有实看证据，可进入定位后的限定构件方案，不再笼统列为无图；当前仍无已确认运行实例。
- 室内：I1：没有确认门内图但门洞/梁架仍是必须子项；先定位本体，再核可穿行门厅。
### FC-9ABF21A275 苍震门
- 外观：E1：东六宫东大墙独立门，宫东门是旧名；不是昭华门或蹈和门。；E2：琉璃门可见侧已有实看证据，可进入定位后的限定构件方案，不再笼统列为无图；当前仍无已确认运行实例。
- 室内：I1：没有确认门内图但门洞/梁架仍是必须子项；先定位本体，再核可穿行门厅。
### FC-1400B5FC62 延禧宫
- 外观：E1：/27仅region父院；/23灵沼轩、/21门、/24..26三库房独立。不得用灵沼轩单体通过关闭父院。
- 室内：I1：父组只汇总子建筑的分间开口/柱网楼层地面，不得新增同名通用建筑/室内。
### FC-EF18B2CEC2 奉先门
- 外观：E1：/items/51现有三开间门厅模型与门洞引用；没有本体专项R39/R48复原，不用门名推出门型已对。
- 室内：I1：有可穿越门洞，runtime未注册室内房间不代表门厅任务不适用；必须核门洞深度/柱网/台阶/梁架。
### FC-7C94D62DDC 乾东五所头所
- 外观：E1：现有五个同z无名hall+共院墙/泛名门，只能候选对应西到东五所；一所三进不能由一个hall代表。 实看静态图仅敬事房匾，不能扩大成五组三院外观证据。
- 室内：I1：父组只汇总子建筑的分间开口/柱网楼层地面，不得新增同名通用建筑/室内。；I3：该所候选hall自动带通用案椅柜凳，具体属于前/中/后殿未定，不能因有家具而算这一所内饰完成。
### FC-58235BAE6E 乾东五所二所
- 外观：E1：现有五个同z无名hall+共院墙/泛名门，只能候选对应西到东五所；一所三进不能由一个hall代表。 实看静态图仅敬事房匾，不能扩大成五组三院外观证据。
- 室内：I1：父组只汇总子建筑的分间开口/柱网楼层地面，不得新增同名通用建筑/室内。；I3：该所候选hall自动带通用案椅柜凳，具体属于前/中/后殿未定，不能因有家具而算这一所内饰完成。
### FC-ADA14569A3 乾东五所三所
- 外观：E1：现有五个同z无名hall+共院墙/泛名门，只能候选对应西到东五所；一所三进不能由一个hall代表。 实看静态图仅敬事房匾，不能扩大成五组三院外观证据。
- 室内：I1：父组只汇总子建筑的分间开口/柱网楼层地面，不得新增同名通用建筑/室内。；I3：该所候选hall自动带通用案椅柜凳，具体属于前/中/后殿未定，不能因有家具而算这一所内饰完成。
### FC-E935697C20 乾东五所四所
- 外观：E1：现有五个同z无名hall+共院墙/泛名门，只能候选对应西到东五所；一所三进不能由一个hall代表。 实看静态图仅敬事房匾，不能扩大成五组三院外观证据。
- 室内：I1：父组只汇总子建筑的分间开口/柱网楼层地面，不得新增同名通用建筑/室内。；I3：该所候选hall自动带通用案椅柜凳，具体属于前/中/后殿未定，不能因有家具而算这一所内饰完成。
### FC-5B8C4984E3 乾东五所五所
- 外观：E1：现有五个同z无名hall+共院墙/泛名门，只能候选对应西到东五所；一所三进不能由一个hall代表。 实看静态图仅敬事房匾，不能扩大成五组三院外观证据。
- 室内：I1：父组只汇总子建筑的分间开口/柱网楼层地面，不得新增同名通用建筑/室内。；I3：该所候选hall自动带通用案椅柜凳，具体属于前/中/后殿未定，不能因有家具而算这一所内饰完成。

## 图像证据索引

只列官方公开链接、文件SHA-256与观察状态，不附官方图片。URL中的上传日期不作为拍摄日期。每张图的适用细项详见JSON的evidenceCoverage。

|证据ID|官方图片|SHA-256|实看记录|
|---|---|---|---|
|PHOTO-JINGREN-01|[官方图片](https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d167f9a32e.jpg)|d897b4c0c1dea7e1ca23c82ba77d021d6b3237a5db2fddfaf9b8bcc2f1014e93|已实看，局部覆盖|
|PHOTO-JINGREN-02|[官方图片](https://img.dpm.org.cn/Uploads/Picture/2020/07/06/s5f0293fb111a4.jpg)|ca4d715e3281477f56f5d1d2d38918a9a4bfeb491f9dde5af3183366bdd3ae44|已实看，局部覆盖|
|PHOTO-JINGREN-03|[官方图片](https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d169d6117a.jpg)|fc9edb2d9105f4ebd71a2360da881b16de54902c6924521b845e480b17eba3b4|已实看，局部覆盖|
|PHOTO-JINGREN-04|[官方图片](https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d16b8c13f4.jpg)|8c480498b6bd9c19a8c085991c26b23c02876b3bd97787b403373b904ce33c5b|已实看，局部覆盖|
|PHOTO-JINGREN-05|[官方图片](https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d16b8c46ab.jpg)|7f20d6d67c50e8cc52599d5327eb682d72a88822891c33d45ea9ab1ab2a7ff8d|已实看，局部覆盖|
|PHOTO-JINGREN-06|[官方图片](https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d16b8c7345.jpg)|8ef05cc459518b644185a6048077265e923ab9420b88cf205288e1e795791a55|已实看，局部覆盖|
|PHOTO-JINGREN-07|[官方图片](https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d16b8ca62c.jpg)|f1a587cbb41173ecd699a99236365f4f92f23bf868dde774a1d332a5210a533c|已实看，局部覆盖|
|PHOTO-JINGREN-08|[官方图片](https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d16b8cd318.jpg)|9e6582f24fd7f39ca16d4400a2a78851a8049b5631b26625fd66c289f61a8d76|已实看，局部覆盖|
|PHOTO-ZHONGCUI-01|[官方图片](https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e99846521e48.jpg)|20648bb2e0b4dc6183d9f1ef20b153fa0b4fd59b7fa004ba2fbc4a6ce3d78bfd|已实看，局部覆盖|
|PHOTO-ZHONGCUI-02|[官方图片](https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5eff06feb0619.jpg)|52141abac7f0f5ebce848d2fcb2ee159093e4f37dbcc5f3897505641db0e2a43|已实看，局部覆盖|
|PHOTO-ZHONGCUI-03|[官方图片](https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e99847e500e7.jpg)|32aa4a42aed9e84284f129292f98a0b69dc1e2cb766636f3f486df31e163a692|已实看，局部覆盖|
|PHOTO-ZHONGCUI-04|[官方图片](https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e99850654383.jpg)|dd9a52d69aaf9bbe7142a7643ab574ca441fdecb2628b0815ec16cc11559e312|已实看，局部覆盖|
|PHOTO-ZHONGCUI-05|[官方图片](https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e99850656e11.jpg)|6d0bb4ca79e6f44e2de9850b8f341d09e520be11ea844198e9d0addde1f0ef40|已实看，局部覆盖|
|PHOTO-CHENGQIAN-01|[官方图片](https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e980b05e328d.jpg)|7b5cc481481cd2568338a09be483a9b28d3df8823ae843181e13d7f4cb0f3466|已实看，局部覆盖|
|PHOTO-CHENGQIAN-02|[官方图片](https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efeddd7e07f1.jpg)|991868698ec8d6215e5b0a2ba0f6c8b4bd5b3f1451d8ccb00b6b1cff26399cd7|已实看，局部覆盖|
|PHOTO-CHENGQIAN-03|[官方图片](https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e980b05e64ad.jpg)|902cd63ba031cfa2de849d30db9a0d0924ea7928468c2284fdb61ed08c9898c3|已实看，局部覆盖|
|PHOTO-CHENGQIAN-04|[官方图片](https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e980b05dbe20.jpg)|d28406ca757524b589005d7aa352e8befdec50dd3bc4268902b7bb0d618fe47f|已实看，局部覆盖|
|PHOTO-CHENGQIAN-05|[官方图片](https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efeddd7e7f80.jpg)|bd97a7595c8b45446b21bf797e44e3bb50911e6af00a78b8ab8ccf091a2a5a06|已实看，局部覆盖|
|PHOTO-STATIC-49C4A7D38A78|[官方图片](https://img.dpm.org.cn/Uploads/Picture/dc/8206.jpg)|49c4a7d38a783988134af8d93d42200ef0a63b9eeb9717005d69149796f3fd6e|已实看，局部覆盖|
|PHOTO-STATIC-DBC465B770F1|[官方图片](https://img.dpm.org.cn/Uploads/Picture/dc/2402.jpg)|dbc465b770f12bfaf321b072d302d688d4b4f3ee0d8f6cd068a96364c68dc6b7|已实看，局部覆盖|
|PHOTO-STATIC-F3EC1B69CC29|[官方图片](https://img.dpm.org.cn/Uploads/Picture/dc/8350[1024].jpg)|f3ec1b69cc29aeb4d001aeafbf063a7fd8d2d3ccb6b77b7c8a12bf3bfaf6410f|已实看，局部覆盖|
|PHOTO-STATIC-A232610C5BD4|[官方图片](https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e9838f9e741b.jpg)|a232610c5bd436c34d15d766bbe8debce15a6aa17f898a01319ceeebfa1a5fdc|已实看，局部覆盖|
|PHOTO-STATIC-00FF24CF9838|[官方图片](https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e98392602dde.jpg)|00ff24cf9838aa2be5c6e9ee6826679b5534f89bb71c94b71d8c3e8c5f591421|已实看，局部覆盖|
|PHOTO-STATIC-0E6C14C9C8F1|[官方图片](https://img.dpm.org.cn/Uploads/Picture/2021/11/01/s617f4ed042f53.jpg)|0e6c14c9c8f1e2b09962ddf870ecf93bf38ec7e6dbb66eac4c68cb6f67bbd3dc|已实看，局部覆盖|
|PHOTO-STATIC-A539B8C50A11|[官方图片](https://img.dpm.org.cn/Uploads/Picture/2021/11/01/s617f4ed051855.jpg)|a539b8c50a116e1dab16d7d4c283fcc168882ee230313080fcf76129bce23723|本次未报告实看|
|PHOTO-STATIC-52BD3AB7FCB4|[官方图片](https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e983c936d454.jpg)|52bd3ab7fcb419d181a3096d651371ab2c9369e89f38c57a2ba97cde01f1f3b0|已实看，局部覆盖|
|PHOTO-STATIC-C151345A1369|[官方图片](https://img.dpm.org.cn/Uploads/Picture/dc/13146[1024].jpg)|c151345a136931b11f3ad9dc2744b97fcf79420bd633ece36f768d329c093230|已实看，局部覆盖|
|PHOTO-STATIC-8100C85F1B16|[官方图片](https://img.dpm.org.cn/Uploads/Picture/dc/13144[1024].jpg)|8100c85f1b1614faffbeec0c95c49118a4c5d1f9cea72516480a1417bd7c3ce9|已实看，局部覆盖|
|PHOTO-STATIC-DC056948D51E|[官方图片](https://img.dpm.org.cn/Uploads/Picture/dc/8397.jpg)|dc056948d51e5566262560982f32d2ad6de55944936729a4563ab747834cca66|已实看，局部覆盖|
|PHOTO-STATIC-B83BF6172899|[官方图片](https://img.dpm.org.cn/Uploads/Picture/dc/8248.jpg)|b83bf61728992a0a58a5ff77ce026777a9732b74e69e55845d84d56e3014d3fd|已实看，局部覆盖|
|PHOTO-STATIC-8EE664210631|[官方图片](https://img.dpm.org.cn/Uploads/Picture/dc/13162[1024].jpg)|8ee664210631f5c0e8ce89a2a73a13aa152c2f39977a2d7166d2c2a84030ccc9|已实看，局部覆盖|
|PHOTO-STATIC-F89977DC15C3|[官方图片](https://img.dpm.org.cn/Uploads/Picture/dc/20551[1024].jpg)|f89977dc15c308a442d7e13d0df81dca108f1bac301eda8251b83819a72b65cc|已实看，局部覆盖|

## 完整性与未完成项

- 61个唯一对象、854个原细项未删改；所有accepted仍为false，canonical内容哈希保持不变。
- 全部854项仍有真实浏览器同视角对照缺口；局部代码检查不能代替视觉验收。
- 定位、缺视角、未知陈设与有证工程差异分别保留，不因某子项缺图冻结全对象。
- EXPAND-01/05/06仍开放。没有任何图片、局部窗样或首批修改可据此宣称E区全部完成。
