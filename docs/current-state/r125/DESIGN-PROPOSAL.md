# R125 承乾两后配与后院通路：原型前设计（根09:38批准一次可逆A原型）

基底 R124 `96af886be5d4cf0c65c68c248372c591087fbec3`，runtime `0773b81f…`。只读来源/真实 ready 基线已取；本文的坐标是候选工程拟合，不是测绘或已通过物理。

## 来源与真实差异

官方承乾后东/后西配独立 group164/165 封面（600×338）可见三间硬山、中央四叶木裙格门、两侧槛窗、短中央阶与同一后院；两张后殿1920×1280照片可见后殿五间低台及侧墙小门。来源完整URL/SHA见外部 `r123-r126-source-preflight/{REPORT.md,source-ledger.json}`；原图不作为运行贴图或上传内容。采集日期未知，不称修缮后的最新状态。

当前没有两后配实例。正/后殿、R114月台/西院间门/硬山前配以及R118旧木槛均已存在，不再算新增。后殿耳房完整形制/门位和井亭未知，不由小随墙门推出耳房，不造新牌/家具。R126木屏门及后殿中央低阶保留后续，不混入本版。

真实成品基线（未改变）：
- 主殿整檐Z371.5755785..392.0244215，后殿397.3294982..410.4705018，屋顶投影间距5.305m并非地面院深。
- 主殿后墙最高范围到Z389.3500000，北帽到389.9099997；后殿前墙Z399.1，前帽398.43999996。
- 后殿旧整檐已越名义北界409.7约.7705m；北帽到409.3600，仅.34m到名义线（内墙实际更近）。不将其算北侧可通路线，也不再往钟粹侧扩院。
- `frame-inventory.json`在每hall建完时取值，R114之后会挪原南阶/源ramp；其未变roof/wall可用，不将旧373.75→372.79 ramp标最终。`final-physical.json`另采整个ZoneBase.build结束后的真实物理数组，最终阶口应371.19..372.15。
- 七张同机位CPU成品/生产RGBA图已看，非GPU/PBR。rear-east/west原相机位于未来候选体量，保原图但不以后续镜头入墙伪判布局；另增中央院域朝两门的同位置前后机位。

## 方案比较

**推荐A：保持所有旧父frame，专用短配殿成组。** 两门都朝当前后院开口，主/后殿、两前配、R114西门/月台/院墙完全不动。新增自己的声明/身份、两壳/三间立面/中央四叶分组、低台短阶、可达门与无家具室内，按实际可触成品注册有限源。

B：南移主殿、月台与前配换取更深后院。代价是再牵R114西配南端已损失通路、原西门及三床/隐私屏/三夜路，且无来源迫使该改动；在A能作一次可逆验证前不选。

C：复制现11.2m前配（含pad12.2m）或北移后殿。均与现空间/邻界冲突，拒绝，不用缩开口/玩家body掩盖。

## A确定候选与最大域

|项|东后配|西后配|
|---|---:|---:|
|稳定身份|east-six/chengqian-rear-east|east-six/chengqian-rear-west|
|中心X/Z|−111.2 /395.1|−76 /395.1|
|朝向|west（向中央）|east（向中央）|
|沿Z宽/横向深|8.2 /4.4|8.2 /4.4|
|ph/pad/colH/roofH|.45/.35/3.3/1.35|相同|
|硬山/檐/收脊|单层，.55；脊端最大局部深2.83|相同|
|预期全成品X域|−114.03..−108.31|−78.89..−73.17|
|预期全成品Z域|390.59..399.61|相同|
|预期最高Y|≤5.44|相同|

尺寸沿用可辨三间关系作整体比例拟合，不将米制或每格纹样写成FACT；首图若比例过扁/过高应回报，而非硬塞。

- 门中心Z395.1，比后殿前墙399.1南约4m，正面接院，不以门中心ray代替身体到达。
- 新翼低roof与main高檐有投影重叠，预计≥1.97m高度差，必须actualtri检验；旧rear roofX[−105,−81]与新翼域分离。外墙背檐余量仅约.07m，是需实测的紧边，不叫宽裕。
- 主后墙389.35→新翼南山墙390.65预计高墙净1.30m；两低帽间只有约.68m。主台侧通到后院必须真方足/接触面验证，不把低台当高墙，也不凭中心脚点跳过前缘。
- 把原可站空地变为新两翼体量有明确用途变化。现南端损失账及北无回路照旧；本版新增占地/可到达范围另实测，不称零通路面积损失。

## 保持及实现边界

所有旧数据项按原索引/身份留存，新实例append。旧主殿/三床/屏风、日位、三夜路、后殿R103窗身份、前配/木槛、R114一ramp一owner及地图落点逐值保护；储秀R118/R123/R124不变。两新房室内UNKNOWN，空库存，不复制通用床/宝座。

不改通用hall默认/全局physics/body/STEP/算法。可复用现kit局部回调及现有限surface数学，但新scope只能两房真实源。台阶/低台/门槛/开叶/低天花须同源实体，有洞不得用总bbox封门。四叶按照片构成、游戏开放为可逆拟合；不复制未知题字或现代消防箱。

预算：两栋净新增≤6000tri、≤4owned materials、0新增atlas/纹理请求；预算不是验收。量化两个档位真实build/merge/dispose、常驻字节/材质/碰撞源及startup，保全部尾样。全ready策略不变。

## 最低验收与停止条件

1. 先RED新实例/三间四叶门/空库存/最大域/原数据与physics保护；实现一对，真实图库ready，同机位7原+2有效院内正对门机位看完整组合。
2. actualF32成品roof对旧main/rear/外墙检查；有界结构接合若出现先报根，不默默称零交叠。
3. R114西门→main后角→西翼门进退→横院→东翼门进退→后殿前到达→原路，10/30/60正退横；完整.5方足/1.7高、原生控制器、成品endpoint/accepted微步并列继承旧问题。两新室内跳顶/落地/松键与退出、源detach/mutate/reload门。
4. 三承乾人物日夜及R118帝妃累计保护、真实TextureLibrary双档、资源释放/cache/evict、必要旧门差分、成本、最后cleanbuild/独审。
5. 若实际布局不通或比例明显失真，只报具体最早反例与有限修正范围，不靠无源缩身体/搬外墙/换镜头洗通过。

## B correction approved09:51, after A genuine turn failure

A geometry and raw remain under prototype/. A high-wall gap alone did not supply a full grounded turn: actual full foot first entered old main brick/cap at[-78.50,0,389.956], then stalled atfeet.6 against finishedcap.61. No old support/STEP/body was changed.

Root approves only both newwing centersZ395.55 (+.45). New fullZ391.04..400.06; old main cap north389.91→newcap south391.04 gives1.13m ground strip, highwall gap1.75m. New desired turn390.45 is a test waypoint, not a new floor. All X/dimensions/roof values unchanged, central doors still3.55m south of rearfrontwall399.1. The northends offset beside rear, not a north-court extension; source photograph topology only, not surveyed overlap.

The two new valid facade cameras shiftZ+.45 to remain centered on the same building-relative facade; original seven world cameras stay exact. A view parameters/raw are preserved. B must pass the original integrated route intent, bothdoors and same old actualcap, at10/30/60 directions before acceptance.

## C correction approved09:56 — dynamic turn budget, not narrower player

B completed the full10Hz loop but returned across the target corner with12 endpoint/24 acceptedmicrostep hits on the unchanged maincap/brick. Exact raw frames214→215 are Z390.55→390.30 (initial message's390.8 was an estimate, superseded by raw); the1.13m strip leaves only.13m center tolerance, not enough for normal coarse-frame stepping/turning.

Root chooses a final additional +.5m only for the two newwings: **centerZ396.05**, fullZ391.54..400.56, X and all other dimensions unchanged. Groundstrip1.63m leaves.63m for a1m squarebody; desiredturn390.75 is to be verified with the actual controller at10/30/60, bothways and sideways. Doors remain3.05m south of rearfrontwall. No fourth unproven shift; no oldframe/STEP/body/physics changes to make the candidate pass. A/B source snapshots and complete raw remain.
