# R49 独立最终回归审查

审查时间：2026-10-22 01:14 UTC。比较基线：R48 `fddf94c998ea93031763550601b898ed18d2d55b`。本次复核生产内容截至 `70e07fa`，未改生产代码或测试，未启动全套测试，未使用浏览器。

## 结论和验收边界

在这次诊断新增的 **28 条失败记录**及 **13 条同名旧失败中诊断内容改变的记录**中，未找到尚未处理的生产回归、错误牌匾归属或资源释放缺陷。各条失败均已定位到具体断言或文件启动异常，不能仅凭“旧测试”三个字跳过。

前一轮独立审查发现的两处钦安殿当前卡片矛盾已修正：现有传送仍是地面外观落点，模型可经两侧虚拟侧门进入并原路返回，且不代表现场开放。实际 `PlaceCatalog → PlaceInfoPanel` 测试通过，而非只检查 JSON 字符串。

**这不是全套全绿结论，也不是浏览器验收。**

- 重新运行的 R48 基线为 325 文件、5,271 tests、5,144 pass、**127 fail**、exit 1。这 127 项是本轮比较前已经存在的失败；本报告没有逐项认定它们无害，更没有修复或豁免它们。
- 首次 R49 诊断为 335 文件、5,197 tests、5,044 pass、**153 fail**、exit 1。它包含运行期间的卡片文案/fixture 修改，不是冻结版本发布验收。模块启动失败会阻止文件内子测试登记，不能直接用总测试数之差判断丢失了多少行为覆盖。
- 本报告审查的 28 条新增失败记录以 `final-validation/diagnostic-first-pass-summary.json` 为可持久复核清单。
- 另读两份已保存完整原始TAP解析出的全部13对before/after，不以截断错误摘要或失败名字代替诊断比较。2个不再失败的旧钦安测试是当前状态预期更新，不是证明修好了2个旧生产bug。
- 最终 337 文件集中回归在本报告写入时尚未结束，未取代或推算其最终计数。最终结果若出现本表之外的新失败，仍须独立归因，不能沿用本报告自动放行。
- 没有浏览器/GPU实景验证。本报告不保证像素栅格、字体回退、抗锯齿或所有屏幕尺寸上的最终视觉效果；CPU几何、射线、DOM事件和释放事件的结果只在各自范围内有效。

## 28 条新增失败逐项判定

序号与诊断清单一致。文件名以下均相对 `tests/`。

| # | 失败位置 | 实际失败原因与独立判定 |
|---|---|---|
| 1 | `current-state/zhaode-gate.test.mjs`，旧门和走廊保留 | 前面的旧门/走廊对象断言不是失败点；最终对整个轴线条目数组做历史 hash，包含新补的弘义阁牌匾开关。只在内存把弘义 `plaque` 改回 `false`，再做原测试已有的昭德字段逆转，即精确恢复 `c8879998…ec5cf8`。无昭德门/走廊生产变化。 |
| 2 | `gate-map-source-disclosure.test.mjs`，V9三段模板限制 | 全文件源码冻结限制只承认旧V9文字改动，拒绝R49新的钦安虚拟进入说明。R48→当前 SettingsMenu 实际差分仅这两行标题/说明，无事件处理变化。不是地图处理器回归。 |
| 3 | `r12-qianqing-imperial-stair.test.mjs`，文件启动 | 诊断原始TAP是新牌材质生成调用 `document.createElement`，旧纯Node fixture未提供document。这是R49引入的测试环境启动失败，不能称为旧有失败。已仅补标准canvas fixture，现23项中22通过、1项仍报19→20网格。后者是新增专属牌网格，详见下方独立探针。 |
| 4 | `r48-audit-real-legacy-retention.test.mjs`，景仁宫 | 旧“physical”签名把 `userData.role` 也计入。只删除4个新御座role，原R47 stub的全部raw、physical、materials、navigation值逐项一致，未删除或改动几何。 |
| 5 | 同上，钟粹宫 | 同#4；删除仅4个role便精确恢复不可变R47签名。 |
| 6 | 同上，永和宫 | R49修复此牌穿入抱厦梁檩的挂位，并为御座组件增加精确语义身份；旧整殿raw冻结覆盖了本轮目标牌。导航不变，配对牌面/背板与可见性另有定向测试。不是未声明的御座或墙体变化。 |
| 7 | 同上，翊坤宫 | 同#4；删除仅4个role便精确恢复不可变R47签名。 |
| 8 | `r48-current-scope-retention.test.mjs`，全部非目标殿保留 | R48许可名单不含R49补牌，首个差异为弘义阁。122殿实际签名审计仅12殿有声明的本轮几何变化，110殿不变；导航仅钦安变化。 |
| 9 | `r48-final-six-independent-world-body.test.mjs`，文件启动 | 原始TAP在kit.js冻结源码hash断言即停止，不是全身碰撞断言失败。新继承测试只精确逆转已审阅源码小块来恢复原始hash，保留原台阶三角面和全部身体断言；57项通过。详见下方覆盖复核。 |
| 10 | `r48-final-six-independent.test.mjs`，只准最终六殿变化 | 首个差异为文渊阁本轮牌框前移和新增挂位说明。raw/finish hash因此变化；原导航、mesh/triangle数量不变，报告无nonfinite/degenerate或资源提前/漏释放。 |
| 11 | `r48-ningshou-real-materials.test.mjs`，景祺阁 | 整殿raw/physical冻结抓到本轮牌框移至上层门头外；1005 meshes、15846 triangles及导航不变。不是殿体或屋顶改动。 |
| 12 | `r48-outer-first18-retention.test.mjs`，文渊阁 | 本轮为避开真实中柱前移完整牌框；690 meshes、10500 triangles及碰撞/步行/房间/导航不变。R48不变断言不再适用于这块目标牌。 |
| 13 | 同上，吉云楼 | 新增有来源的独立牌盒，增加1 mesh、12 triangles；其余殿体和导航由移除唯一新牌后的基线对照证明保留。 |
| 14 | `r48-outer-first21-retention.test.mjs`，文件启动 | 共享旧逆向重建helper要求整个 RemainingOuterHalls.js 精确等于R48 hash，在新增吉云/宝蕴调用后于 `reviewed final-layer source SHA` 终止。没有运行到具体保留/通行失败。 |
| 15 | `r48-outer-first25-retention.test.mjs`，文件启动 | 同#14。不得把启动终止说成已经通过文件内全部测试；本轮实际目标改动和导航另用当前定向证据核对。 |
| 16 | `r48-outer-geometry.test.mjs`，吉云楼 | 把每个mesh.material当单个材质，调用 `material.name.startsWith`；新六槽材质数组的name不存在。数组本身合法，不是几何非有限或材质未拥有。 |
| 17 | `r48-outer-lifecycle.test.mjs`，吉云楼 | 旧测试要求所有raw geometry在finish合批时都释放一次。新牌明确 `noMerge`，必须保留原网格到最终dispose，finish时0次释放才是正确行为。独立新测试实测最终几何/两个唯一材质/贴图各一次。 |
| 18 | `r48-outer-real-materials.test.mjs`，吉云楼 | 旧所有权检查把整条材质数组作为一个材质查找，未逐槽检查。新测试逐个唯一材质确认kit拥有，并验证实际生产finish和dispose。 |
| 19 | `r48-outer-safety-retention.test.mjs`，文件启动 | 同#14的RemainingOuterHalls完整源hash前置终止；不是运行时安全动作失败。 |
| 20 | `r48-outer-zhujing-proxy-review.test.mjs`，前21殿保留 | 首个差异是文渊阁目标牌框/挂位信息；本轮主敬/敬思板调整也属于明确修复范围。未以扩大楼间距、抬天花或改主体来显牌。 |
| 21 | `r48-qinan-golden-columns.test.mjs`，不可进入内部 | 旧断言要求 `interiorRouteEnabled === false`；与本轮明确的两侧虚拟进入需求相反。内金柱、柱顶/柱础不是本轮修改目标。 |
| 22 | 同上，只有四柱及柱础变化 | 对R47扣除四柱后全殿冻结，当然包括后来R49侧墙门洞拆分、门扇和新匾。属于有意的侧门/题字变更，不能用该历史冻结作为现在无门洞的要求。 |
| 23 | `r48-review-baoyun-inscription.test.mjs`，浅石芯需首命中 | 旧测试要求原空白石芯是第一可见面；R49有来源汉字层位于它前方。原浅石芯/绿框保留，未叠通用蓝金牌，也没有宣称复刻书法。新测试对精确新层排除后保留原基线。 |
| 24 | `r48-review-central-retention.test.mjs`，钦安四柱与非进入状态 | 实际失败为旧 `interiorRouteEnabled === false`，同#21；不是柱网/柱顶断言报告不符。 |
| 25 | 同上，钦安扣四柱后保留 | 侧墙门洞/门扇及牌属于R49变化，旧整殿raw/碰撞冻结拒绝它们；原walkables/rooms相同。侧门是否可走另用实际控制器回放，而非只看开关。 |
| 26 | 同上，永和宫 | 旧R47非目标名单与R49明确目标重合；本轮对牌框/面配对移动，导航不变，同#6。 |
| 27 | 同上，弘义阁 | 整殿冻结遇到有来源新增竖匾；不是别殿归属或伪造题字。导航不变，同#8。 |
| 28 | `r48-yongshou-column-clearance.test.mjs`，其它十一殿字节相同 | 首个差异为养心殿本轮把完整牌框移出门头墙；太极/重华的相同类别修复也已明确。原碰撞和导航不变；未改变永寿柱径修复或一般殿体。 |

## 13 条同名旧失败的诊断改变

这些项仍计入共同失败，但其当前实际值与基线不同；不能统一归为“原样旧失败”。下列序号对应完整shared-changed清单。

| # | 失败位置 | before→after 的实质改变与核查 |
|---|---|---|
| 1 | `r38-independent-taihemen-integration.test.mjs`，七个其它PalaceBuilder根 | 旧失败仅三台；现在新增乾清门根hash变化，其它实际根值包括三台都未再变。独立按原算法构建乾清门，仅在hash遍历排除1块新牌，精确恢复旧乾清门根 `2b124da2…5439f3`。这是有意补牌，不是旧三台问题突然扩大或得到修复。 |
| 2 | `r39-retained-main-halls.test.mjs`，太极殿 | 已不等于R38快照的R48几何hash再改变，对应把牌背板从错误的御座平移集合中排除。定向测试要求仍仅4个御座组件移动，牌框保持在字面后6cm；碰撞/导航的R48→R49比较不变。 |
| 3 | 同上，永和宫 | 已不等于R38快照的R48几何hash再改变，对应梁下小牌重新拟合。原R39测试先因geometry失败，不能声称它也验证了其后navigation断言；导航保留来自独立R48→R49比较。 |
| 4 | `r40-east-facade-profiles.test.mjs`，全119非目标殿 | 首失败由 `east-six/9` 承乾宫改为更早遍历的 `axis-courts/25` 弘义阁。新报告值是弘义新增牌的几何hash，弘义导航仍与旧期望相同。没有证明或宣称后面的承乾旧失败已消失。 |
| 5 | `r41-chuxiu-kang.test.mjs`，全121其它殿 | 与#4相同的首失败位移；旧快照中的承乾差异被更早的新弘义差异挡住，而非修复。 |
| 6 | `r42-guhua-pavilion.test.mjs`，全121非目标殿 | 同#4，新增原因是弘义有意补牌。 |
| 7 | `r43-yihe-layout.test.mjs`，全121非目标殿 | 同#4。 |
| 8 | `r44-shoukang-layout.test.mjs`，全121非目标殿 | 同#4。 |
| 9 | `r45-enclosure-layout.test.mjs`，全120非目标殿 | 同#4。 |
| 10 | `r46-ritual-layout.test.mjs`，全120非目标殿 | 同#4。 |
| 11 | `r47-fidelity-retention.test.mjs`，全122殿 | 同#4。对此8项不能只重跑到首失败就声称所有后续殿不变；本轮另有不依赖fail-fast的122殿当前/R48完整签名比较。 |
| 12 | `r48-review-outer-finishes.test.mjs`，文渊阁 | 逐字段比较完整actual对象，只有 `mesh` hash由 `b1ed8e62…fb315` 变为 `f2d39ceb…1ad48`，meshCount仍690。碰撞、walkables及其它实际值与R48相同，旧645→690及旧碰撞/步行差异并非R49新增。当前新差异对应牌框前移。 |
| 13 | 同上，吉云楼 | 完整actual对象只新增 `mesh` hash及meshCount的693→694变化。原碰撞不等于旧快照的失败值仍完全相同；其余walkables、rooms、regions、mapItems、navigation未变。移除唯一新牌后的保留测试和真实释放事件覆盖新增部分。 |

两个不再失败的旧项都在 `current-state/qinan-hall.test.mjs`：

1. 旧dispatch检查要求四柱状态为 `AXIS_MAPPING_UNRESOLVED_OMITTED`，但R48实际已经是 `SOURCE_DERIVED_FIG2_NODE_MAPPING_NOT_CURRENT_SURVEY`。当前测试反映已有四柱及本轮获准的两侧虚拟门，不是新修复了四柱。
2. 旧role-budget上限3382，而R48实际3396，已失败。当前改成明确预算 `3252 + 144 + 96 + 124 = 3616`，分别为原外观、已有四柱/柱础、拆分侧门及新牌；继续禁止把备用LOD重复计数。这是更新计数预期，不是R49降低了三角形或消除了旧性能bug。

## 本次独立补充验证

### 1. 元数据与物理改变区分

直接构建当前景仁、钟粹、翊坤，每殿只在内存删除4个 `retained-throne-component` 的 `role`。重新执行旧捕获脚本的精确序列化算法，并与不可变 `r48-capture-d37cf4d.json` 的stub记录对照：三殿的整个记录都相同，包括mesh数量、raw/physical hash、材质计数和导航hash。

这证明#4/#5/#7的“physical”字样具有误导性：该旧hash包括语义role，不能直接等同于顶点/矩阵变化。探针没有改源码或更新快照。

对#1在内存单独逆转弘义 `plaque: true → false`，加上原昭德测试本已有的字段逆转，数组SHA-256精确恢复为：

`c8879998ad586ec1c822e28f22fd2a28f4c8fac7b1772a0b4d68285ceaec5cf8`

### 2. 乾清门旧十九组确实仍在

当前完整构建中精确找到1个 `qianqing-rear-eave-gate-name-plaque`。仅从检查列表排除该新网格后，原R12的全部19条旧material-group断言都通过，包括大理石+116三角形、三个既有后连廊材质组和其它组的精确hash比较。

因此不能把原始启动失败抹掉，但其修复后的唯一红项确为“整体只能有旧19网格”的过时计数，不是旧台阶材质/几何损坏。保留的日志 `final-validation/qianqing-stair-final.tap` 如实为22 pass / 1 fail。

### 3. 吉云楼实际资源周期

独立重跑 `r49-jiyun-horizontal-name-plaque.test.mjs` 通过：

- 唯一新牌移除后，旧几何与导航签名恢复。
- 六槽数组中两个唯一材质都由kit拥有。
- 生产finish后原牌对象仍在，几何和材质尚未释放；这是noMerge所需语义。
- 规定视点对三个汉字位置射线首命中新牌的第4材质面。
- 最终dispose时几何、两个唯一材质和汉字纹理各释放一次。

这直接回答#16/#17/#18，不能仅靠“数组支持正常”推断无漏释放。

### 4. 继承全身路线断言未被放宽

独立比较 `r48-final-six-independent-world-body.test.mjs` 与 `r49-inherited-world-body.test.mjs`：除了精确源小块逆转前置检查、报告版本标识和报告环境变量，实际世界构建、物理路线、身体碰撞和反例断言相同。

逆转fixture只涉及kit四个御座语义标签、牌注册frame字段以及SouthCourtHalls后殿牌/悬杆/挂位说明。每块必须在当前源码恰好出现一次，逆转后再次要求原受信源码hash。原始台阶三角面JSON仍要求不可变hash `3b6f27ab…bcad4`，没有重新捕获支持面，也没有泛化允许穿过的低物体。

现存日志57/57通过；记录含56路线、44,180物理帧、58,648已接受子步，全部到达，rescue为0。完整世界、原身体半径/高度、STEP_UP约束、无每帧三角面截断、每帧及已接受子步碰撞检查、平移2cm假支持面反例均保留。这个证据补上#9的行为覆盖，但不把原R48冻结源码测试重标为通过。

### 5. 当前卡片与生产冻结

独立重跑 `r49-qinan-place-card.test.mjs` 通过：真实catalog渲染的card包含虚拟侧门、两侧台阶、原路返回和现场开放限定；不含旧“不开放室内路线/不增加室内通行”矛盾。159条place、外观传送模式和未验证现场权限状态未改变。

独立检查 `84500a7..70e07fa -- src data` 只有这两条当前卡片字符串变化，与 `current-card-text-only-delta.json` 一致。既有几何/地图证据没有因后续测试或报告提交而失去适用性。

## 其它已审阅范围与证据限制

- 通用牌匹配使用登记的frame/text和精确背板对象，不再按金/漆材质泛选御座。拟合函数检查唯一匹配及正有限尺寸，面和背板一起移动/缩放。
- 钦安两侧门洞沿既有侧阶设置，北墙仍封闭，不增设穿殿北出捷径；虚拟通行与现实开放已经分别说明。
- 乾清、钦安、吉云、弘义、宝蕴题字与已存来源记录及“语义字体近似/拟合挂位/未复刻满文”限制相容。没有把有字板误当另一个殿名牌。这里没有重新访问官方照片，来源图像细节仍以专项报告为据。
- 地图审核覆盖屏幕像素字号/间距、全局避让、主殿优先、缩放重绘与交互生命周期；没有发现新的监听器或资源生命周期问题。不能据此声称浏览器中所有字体像素观感均已验收。
- 122殿保留审计是限定的几何/矩阵/材质名与导航签名，不是所有材质像素或GPU状态等价证明。专属新材质的所有权与显示面需以上述专门测试补足。
- 最终全套结果另见集中回归报告；本报告只对已审阅的28项新增失败和13项共同失败的诊断变化给出无新增生产阻断项结论，保留全部历史红项和浏览器限制。

可复核的持久证据：`final-validation/r48-baseline-summary.json`、`final-validation/r48-current-baseline.tap.gz`、`final-validation/diagnostic-first-pass-summary.json`、`final-validation/diagnostic-first-pass.tap.gz`、`hall-physical-retention.json`、`final-validation/physical-proof-applicability.json`、`final-validation/inherited-world-body.tap`、`final-validation/inherited-world-body-summary.json`、`final-validation/jiyun-retained-lifecycle.tap`、`final-validation/qianqing-stair-final.tap`、`final-validation/focused-post-disclosure.tap`。

## 最终运行增补：2026-10-22 01:22 UTC

本节追加最终证据，不改写上文在诊断阶段的时间点、失败数量及启动异常记录。未重跑全套，未修改任何生产或测试文件。

### 最终结果与新增差分

直接读取 `final-validation/final-current.tap.gz`，核对最终footer为 **5,277 tests、5,119 pass、158 fail、0 cancelled、0 skipped**，exit 1。337文件范围由 `final-regression-summary.json` 记录。原始TAP SHA-256实测为：

`84db9977adaf39bbf18ab239aad1a59efe5ccbc2d5fb27dd76f430652878c6e3`

另从实际 `ok` 行提取名称，而不是只信任摘要：`focused-post-disclosure.tap` 的126个成功名称及 `inherited-world-body.tap` 的57个成功名称，全都在最终TAP中找到，合计 **183个不同定向测试名称**。

最终与R48比较为125个共同失败身份、33个新增失败身份、2个旧身份不再失败；共同失败中13项诊断内容改变，仍按上文逐项核查。**158项失败仍真实存在，不能改写成全绿。** 两个旧钦安测试不再失败的含义仍是预期更新，不能称修好了两个旧生产bug。

相比首次诊断，R12的文件启动失败已消失，文件内23项实际执行，22通过、1项旧19→20网格计数失败；此前独立保留探针仍适用。另新增的5个目录guard归因如下：

| 文件 | 最终新失败 | 独立核查结论 |
|---|---|---|
| `tests/r39-historical-card-inverse.test.mjs` | `R39 historical adapter reverses only the reviewed Fengxian wording while current card retains purpose disclosure`，报 `exact reviewed added cards` | 原历史逆向只准此前奉先文字，随后校验全部145张新增卡的历史hash；现钦安免责声明有意变化，因此拒绝。只在内存逆转钦安这一叶后，原 `restoreR6PlaceCatalog` 无修改完整通过，精确还原原14卡；奉先卡和逆向安全边界未变。 |
| `tests/r44-fidelity-navigation.test.mjs` | `R44 metadata correction does not alter catalog identities or valid group citations` | 整个 `data/places/zh-CN.json` 固定SHA断言捕获钦安单叶文字变化；并非身份或引用变动。 |
| `tests/r45-fidelity-navigation.test.mjs` | `R45 keeps complete159-place catalog and existing uncertainty records byte-identical` | 同一整文件固定SHA断言；159身份及存疑记录完整保留，单叶逆转恢复全部旧字节。 |
| `tests/r46-fidelity-navigation.test.mjs` | `R46 keeps complete159-place catalog and existing uncertainty records byte-identical` | 同上。 |
| `tests/r47-fidelity-retention.test.mjs` | `R47 all159 places and existing uncertainty records remain byte-identical` | 同上。这是新增的目录guard失败，不与上文已经审阅的R47全殿几何失败混淆。 |

### 单叶逆转的实际证明

读取当前目录及 `git show fddf94c998ea93031763550601b898ed18d2d55b:data/places/zh-CN.json`，递归比较全部JSON值，差异列表长度恰为1：

`/places/9/modelExperience/disclaimer`，对应“钦安殿”。

在当前原始文本中要求新免责声明字符串恰好出现一次，只用旧免责声明替换这一个字符串，不重序列化或归一化其它内容。结果与R48整个原文件逐字相同，SHA从当前：

`34638faeb0b5979b136ed51177408ba3b982b1d4d28a8ca86519a76d29970b7c`

精确恢复为四个guard要求的：

`cad86a86645dba41ac8ae6b569597356496d645d92526bebdc9dac27699d6711`

因此，未通过删掉任意字段、重录快照、放宽hash或修改历史适配器来解释失败。目录中的129来源、159地点及其它字段都没有第二处变化。实际比较159条id/name/aliases相同；下列7条存疑记录的**整个对象**也与R48逐项一致，而不只是数量仍为7：

- 南薰门：`identity-unresolved`
- 太极门：`identity-inferred`
- 长康左门、长康右门：`partial-history`
- 南三所西所后殿、南三所中所后殿撷芳殿、南三所东所后殿：`partial-identity`

当前产品文件和这些旧guard均保持原样，所以最终5项仍红是如实报告的状态。该单叶逆转仅作为只读归因探针，不是建议恢复已经纠正的误导性钦安说明。

### 最终独立判断

新增5项均被精确归因于已审阅的钦安当前免责声明修正；没有发现额外生产阻断项。183个定向通过只证明其明确覆盖范围，不抵消158个全套失败，也不补足此前未进行的浏览器/GPU/真实手机验收。

最终差分原件：`final-validation/final-regression-summary.json`、`final-validation/failure-comparison-full.json.gz`、`final-validation/final-current.tap.gz`。上文的诊断记录及R48基线红项继续保留。
