# R145 EXPAND-01–05 只读部分映射账

快照HEAD `b7af7840653badcd8f03550a71ee96bbc4126106`；仅源码/声明检查，未改产品、未运行重CPU/GPU。JSON记录逐实例路径+行号、稳定JSON pointer或既有runtime ID、文件SHA。活动写手期间以文件SHA为准。

所有五组 `enumerationComplete=false` / `wholeGroupAccepted=false`；以下行数不是建筑数，更不是新增交付数。

## EXPAND-01 东六宫各院
原要求：各院井亭、前后殿耳房、配殿耳房、垂花门与游廊
本次列出 33 个声明/程序节点/目录上下文记录；不能跨组累加为建筑数量。

- 六院井亭均没有本审读确认的独立模型映射
- 前/后殿耳房、配殿耳房及各游廊未逐实例命名定位
- 不能把18个原后/配殿声明+2个后配殿当20个已完成耳房
- 延禧1930s库房配置不能当清代耳房关系
- 承乾新增后配/西侧院间门只证明局部，不代表东六扩展完成

|实例引用|名字/角色|当前状态|证据|
|---|---|---|---|
|data/zones/east-six.json#/items/0|景仁门|DECLARED_AND_ROUTED_TO_BASELINE_PARTIAL_UNVERIFIED|data/zones/east-six.json:7; src/scene/zones/ZoneBase.js:332|
|data/zones/east-six.json#/items/1|ESTIMATED_COURTYARD_BOUNDARY_CONTEXT|DECLARED_AND_ROUTED_TO_BASELINE_PARTIAL_UNVERIFIED|data/zones/east-six.json:8; src/scene/zones/ZoneBase.js:378|
|data/zones/east-six.json#/items/3|REAR_HALL_CONTEXT_NOT_EAR_ROOM|DECLARED_AND_ROUTED_TO_BASELINE_PARTIAL_UNVERIFIED|data/zones/east-six.json:10; src/scene/zones/ZoneBase.js:194|
|data/zones/east-six.json#/items/4|EAST_FRONT_WING_CONTEXT_NOT_EAR_ROOM|DECLARED_AND_ROUTED_TO_BASELINE_PARTIAL_UNVERIFIED|data/zones/east-six.json:11; src/scene/zones/ZoneBase.js:194|
|data/zones/east-six.json#/items/5|WEST_FRONT_WING_CONTEXT_NOT_EAR_ROOM|DECLARED_AND_ROUTED_TO_BASELINE_PARTIAL_UNVERIFIED|data/zones/east-six.json:12; src/scene/zones/ZoneBase.js:194|
|data/zones/east-six.json#/items/7|承乾门|DECLARED_AND_ROUTED_TO_BASELINE_PARTIAL_UNVERIFIED|data/zones/east-six.json:14; src/scene/zones/ZoneBase.js:332|
|data/zones/east-six.json#/items/8|ESTIMATED_COURTYARD_BOUNDARY_CONTEXT|DECLARED_AND_ROUTED_TO_BASELINE_PARTIAL_UNVERIFIED|data/zones/east-six.json:15; src/scene/zones/ZoneBase.js:378|
|data/zones/east-six.json#/items/10|REAR_HALL_CONTEXT_NOT_EAR_ROOM|DECLARED_AND_ROUTED_TO_BASELINE_PARTIAL_UNVERIFIED|data/zones/east-six.json:17; src/scene/zones/ZoneBase.js:194|
|data/zones/east-six.json#/items/11|EAST_FRONT_WING_CONTEXT_NOT_EAR_ROOM|PARTIAL_CHENGQIAN_HARD_GABLE_FRONT_WING_FIT|data/zones/east-six.json:18; src/scene/zones/ZoneBase.js:194; src/scene/palace/special/ChengqianCourtyardGroup.js:5|
|data/zones/east-six.json#/items/12|WEST_FRONT_WING_CONTEXT_NOT_EAR_ROOM|PARTIAL_CHENGQIAN_HARD_GABLE_FRONT_WING_FIT|data/zones/east-six.json:19; src/scene/zones/ZoneBase.js:194; src/scene/palace/special/ChengqianCourtyardGroup.js:5|
|data/zones/east-six.json#/items/14|钟粹门|DECLARED_AND_ROUTED_TO_BASELINE_PARTIAL_UNVERIFIED|data/zones/east-six.json:21; src/scene/zones/ZoneBase.js:332|
|data/zones/east-six.json#/items/15|ESTIMATED_COURTYARD_BOUNDARY_CONTEXT|DECLARED_AND_ROUTED_TO_BASELINE_PARTIAL_UNVERIFIED|data/zones/east-six.json:22; src/scene/zones/ZoneBase.js:378|
|data/zones/east-six.json#/items/17|REAR_HALL_CONTEXT_NOT_EAR_ROOM|DECLARED_AND_ROUTED_TO_BASELINE_PARTIAL_UNVERIFIED|data/zones/east-six.json:24; src/scene/zones/ZoneBase.js:194|
|data/zones/east-six.json#/items/18|EAST_FRONT_WING_CONTEXT_NOT_EAR_ROOM|DECLARED_AND_ROUTED_TO_BASELINE_PARTIAL_UNVERIFIED|data/zones/east-six.json:25; src/scene/zones/ZoneBase.js:194|
|data/zones/east-six.json#/items/19|WEST_FRONT_WING_CONTEXT_NOT_EAR_ROOM|DECLARED_AND_ROUTED_TO_BASELINE_PARTIAL_UNVERIFIED|data/zones/east-six.json:26; src/scene/zones/ZoneBase.js:194|
|data/zones/east-six.json#/items/21|延禧门|DECLARED_AND_ROUTED_TO_BASELINE_PARTIAL_UNVERIFIED|data/zones/east-six.json:28; src/scene/zones/ZoneBase.js:332|
|data/zones/east-six.json#/items/22|ESTIMATED_COURTYARD_BOUNDARY_CONTEXT|DECLARED_AND_ROUTED_TO_BASELINE_PARTIAL_UNVERIFIED|data/zones/east-six.json:29; src/scene/zones/ZoneBase.js:378|
|data/zones/east-six.json#/items/24|REAR_HALL_CONTEXT_NOT_EAR_ROOM|EXPLICIT_YANXI_STOREHOUSE_PROFILE_NOT_HISTORICAL_PALACE_EARROOM|data/zones/east-six.json:31; src/scene/zones/ZoneBase.js:194|
|data/zones/east-six.json#/items/25|EAST_FRONT_WING_CONTEXT_NOT_EAR_ROOM|EXPLICIT_YANXI_STOREHOUSE_PROFILE_NOT_HISTORICAL_PALACE_EARROOM|data/zones/east-six.json:32; src/scene/zones/ZoneBase.js:194|
|data/zones/east-six.json#/items/26|WEST_FRONT_WING_CONTEXT_NOT_EAR_ROOM|EXPLICIT_YANXI_STOREHOUSE_PROFILE_NOT_HISTORICAL_PALACE_EARROOM|data/zones/east-six.json:33; src/scene/zones/ZoneBase.js:194|
|data/zones/east-six.json#/items/28|永和门|DECLARED_AND_ROUTED_TO_BASELINE_PARTIAL_UNVERIFIED|data/zones/east-six.json:35; src/scene/zones/ZoneBase.js:332|
|data/zones/east-six.json#/items/29|ESTIMATED_COURTYARD_BOUNDARY_CONTEXT|DECLARED_AND_ROUTED_TO_BASELINE_PARTIAL_UNVERIFIED|data/zones/east-six.json:36; src/scene/zones/ZoneBase.js:378|
|data/zones/east-six.json#/items/31|REAR_HALL_CONTEXT_NOT_EAR_ROOM|DECLARED_AND_ROUTED_TO_BASELINE_PARTIAL_UNVERIFIED|data/zones/east-six.json:38; src/scene/zones/ZoneBase.js:194|
|data/zones/east-six.json#/items/32|EAST_FRONT_WING_CONTEXT_NOT_EAR_ROOM|DECLARED_AND_ROUTED_TO_BASELINE_PARTIAL_UNVERIFIED|data/zones/east-six.json:39; src/scene/zones/ZoneBase.js:194|
|data/zones/east-six.json#/items/33|WEST_FRONT_WING_CONTEXT_NOT_EAR_ROOM|DECLARED_AND_ROUTED_TO_BASELINE_PARTIAL_UNVERIFIED|data/zones/east-six.json:40; src/scene/zones/ZoneBase.js:194|
|data/zones/east-six.json#/items/35|景阳门|DECLARED_AND_ROUTED_TO_BASELINE_PARTIAL_UNVERIFIED|data/zones/east-six.json:42; src/scene/zones/ZoneBase.js:332|
|data/zones/east-six.json#/items/36|ESTIMATED_COURTYARD_BOUNDARY_CONTEXT|DECLARED_AND_ROUTED_TO_BASELINE_PARTIAL_UNVERIFIED|data/zones/east-six.json:43; src/scene/zones/ZoneBase.js:378|
|data/zones/east-six.json#/items/38|REAR_HALL_CONTEXT_NOT_EAR_ROOM|DECLARED_AND_ROUTED_TO_BASELINE_PARTIAL_UNVERIFIED|data/zones/east-six.json:45; src/scene/zones/ZoneBase.js:194|
|data/zones/east-six.json#/items/39|EAST_FRONT_WING_CONTEXT_NOT_EAR_ROOM|DECLARED_AND_ROUTED_TO_BASELINE_PARTIAL_UNVERIFIED|data/zones/east-six.json:46; src/scene/zones/ZoneBase.js:194|
|data/zones/east-six.json#/items/40|WEST_FRONT_WING_CONTEXT_NOT_EAR_ROOM|DECLARED_AND_ROUTED_TO_BASELINE_PARTIAL_UNVERIFIED|data/zones/east-six.json:47; src/scene/zones/ZoneBase.js:194|
|data/zones/east-six.json#/items/56|承乾宫后东配殿|DEDICATED_PHOTO_TOPOLOGY_FIT|data/zones/east-six.json:63; src/scene/zones/ZoneBase.js:194; src/scene/palace/special/ChengqianRearWings.js:14|
|data/zones/east-six.json#/items/57|承乾宫后西配殿|DEDICATED_PHOTO_TOPOLOGY_FIT|data/zones/east-six.json:64; src/scene/zones/ZoneBase.js:194; src/scene/palace/special/ChengqianRearWings.js:14|
|src/scene/palace/special/ChengqianCourtyardGroup.js#chengqian-west-court-gate|ONE_SIDE_GATE_NOT_ASSERTED_CHUIHUA_GATE|ONE_SOURCE_BOUNDED_SIDE_GATE_FIT|src/scene/palace/special/ChengqianCourtyardGroup.js:62|

## EXPAND-02 重华宫区
原要求：崇敬殿及翠云馆两侧配殿、各耳房、东西井亭
本次列出 4 个声明/程序节点/目录上下文记录；不能跨组累加为建筑数量。

- 崇敬殿、翠云馆两侧配殿与耳房无可确认的独立runtime映射
- 东西井亭无独立runtime映射；西井亭非真井
- 现中院同名殿不证明完整三进院落，坐标与source逐院映射未核

|实例引用|名字/角色|当前状态|证据|
|---|---|---|---|
|data/zones/west-six.json#/items/52|重华门|PARTIAL_SINGLE_NAME_HALL_OR_GENERIC_BOUNDARY|data/zones/west-six.json:63; src/scene/zones/ZoneBase.js:332|
|data/zones/west-six.json#/items/53|MIDDLE_COURT_CONTEXT_ONLY|PARTIAL_SINGLE_NAME_HALL_OR_GENERIC_BOUNDARY|data/zones/west-six.json:64; src/scene/zones/ZoneBase.js:378|
|data/zones/west-six.json#/items/54|重华宫|PARTIAL_SINGLE_NAME_HALL_OR_GENERIC_BOUNDARY|data/zones/west-six.json:65; src/scene/zones/ZoneBase.js:194; src/scene/palace/special/RemainingResidentialHalls.js:29|
|data/zones/west-six.json#/items/55|重华宫|PARTIAL_SINGLE_NAME_HALL_OR_GENERIC_BOUNDARY|data/zones/west-six.json:66; src/scene/zones/ZoneBase.js:433|

## EXPAND-03 中正殿佛堂区
原要求：中正殿东西配房、淡远楼东西配殿，以及所有已列单体的复建后照片
本次列出 11 个声明/程序节点/目录上下文记录；不能跨组累加为建筑数量。

- 中正殿东西配房、淡远楼东西配殿未有独立可核runtime绑定
- 原已列单体仍需逐栋复建后照片与实体对应
- 当前未运行GPU；源码未命中不等于证明绝无匿名几何，不能宣未命名壳体已对应

|实例引用|名字/角色|当前状态|证据|
|---|---|---|---|
|FC-ADC59D34D5|雨花阁|NO_CONFIRMED_RUNTIME_BINDING_IN_CURRENT_ZONES_OR_SCENE|docs/photo-fidelity/H-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json:5791|
|FC-F0C6383E88|宝华殿|NO_CONFIRMED_RUNTIME_BINDING_IN_CURRENT_ZONES_OR_SCENE|docs/photo-fidelity/H-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json:6284|
|FC-66378DAD81|中正殿|NO_CONFIRMED_RUNTIME_BINDING_IN_CURRENT_ZONES_OR_SCENE|docs/photo-fidelity/H-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json:6527|
|FC-87A0A561ED|淡远楼|NO_CONFIRMED_RUNTIME_BINDING_IN_CURRENT_ZONES_OR_SCENE|docs/photo-fidelity/H-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json:6772|
|FC-E5EEAB2373|中正殿东配殿|NO_CONFIRMED_RUNTIME_BINDING_IN_CURRENT_ZONES_OR_SCENE|docs/photo-fidelity/H-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json:7017|
|FC-77D6708679|中正殿西配殿|NO_CONFIRMED_RUNTIME_BINDING_IN_CURRENT_ZONES_OR_SCENE|docs/photo-fidelity/H-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json:7262|
|FC-3295FB46B4|香云亭|NO_CONFIRMED_RUNTIME_BINDING_IN_CURRENT_ZONES_OR_SCENE|docs/photo-fidelity/H-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json:7507|
|FC-F95F60645E|雨花阁东配楼|NO_CONFIRMED_RUNTIME_BINDING_IN_CURRENT_ZONES_OR_SCENE|docs/photo-fidelity/H-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json:7752|
|FC-C7BA2B3690|雨花阁西配楼|NO_CONFIRMED_RUNTIME_BINDING_IN_CURRENT_ZONES_OR_SCENE|docs/photo-fidelity/H-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json:7997|
|FC-2953884F94|昭福门|NO_CONFIRMED_RUNTIME_BINDING_IN_CURRENT_ZONES_OR_SCENE|docs/photo-fidelity/H-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json:8242|
|FC-98F5C6BC6B|春华门|NO_CONFIRMED_RUNTIME_BINDING_IN_CURRENT_ZONES_OR_SCENE|docs/photo-fidelity/H-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json:8488|

## EXPAND-04 南三所
原要求：各所琉璃门，三进院东西配殿，耳房、顺山房、值房、膳房、净房、井亭及后罩房
本次列出 9 个声明/程序节点/目录上下文记录；不能跨组累加为建筑数量。

- 一个南三所宫门声明不是三所分别琉璃门验收
- 每所中进/三进完整轴线与东西配殿未确认
- 耳房、顺山房、值房、膳房、净房、井亭、黑瓦后罩房未逐实例绑定
- 六声明只做组共性绿瓦硬山屋顶及撤无依据家具，不可说六完整院落/或历史前后名字已核

|实例引用|名字/角色|当前状态|证据|
|---|---|---|---|
|data/zones/outer-east.json#/items/10|南三所宫门|DECLARED_GROUP_CONTEXT|data/zones/outer-east.json:175; src/scene/zones/ZoneBase.js:332|
|data/zones/outer-east.json#/items/11|GROUP_GATE_OR_BOUNDARY_CONTEXT|DECLARED_GROUP_CONTEXT|data/zones/outer-east.json:183; src/scene/zones/ZoneBase.js:378|
|data/zones/outer-east.json#/items/12|南三所西所前殿|SIX_HALL_ROOF_ONLY_AUGMENT_WITH_UNRESOLVED_BINDING|data/zones/outer-east.json:198; src/scene/zones/ZoneBase.js:194; src/scene/palace/special/RemainingOuterHalls.js:88; src/scene/palace/special/RemainingOuterHalls.js:1817|
|data/zones/outer-east.json#/items/13|南三所西所后殿|SIX_HALL_ROOF_ONLY_AUGMENT_WITH_UNRESOLVED_BINDING|data/zones/outer-east.json:215; src/scene/zones/ZoneBase.js:194; src/scene/palace/special/RemainingOuterHalls.js:105; src/scene/palace/special/RemainingOuterHalls.js:1817|
|data/zones/outer-east.json#/items/14|南三所中所前殿|SIX_HALL_ROOF_ONLY_AUGMENT_WITH_UNRESOLVED_BINDING|data/zones/outer-east.json:231; src/scene/zones/ZoneBase.js:194; src/scene/palace/special/RemainingOuterHalls.js:122; src/scene/palace/special/RemainingOuterHalls.js:1817|
|data/zones/outer-east.json#/items/15|南三所中所后殿撷芳殿|SIX_HALL_ROOF_ONLY_AUGMENT_WITH_UNRESOLVED_BINDING|data/zones/outer-east.json:248; src/scene/zones/ZoneBase.js:194; src/scene/palace/special/RemainingOuterHalls.js:139; src/scene/palace/special/RemainingOuterHalls.js:1817|
|data/zones/outer-east.json#/items/16|南三所东所前殿|SIX_HALL_ROOF_ONLY_AUGMENT_WITH_UNRESOLVED_BINDING|data/zones/outer-east.json:266; src/scene/zones/ZoneBase.js:194; src/scene/palace/special/RemainingOuterHalls.js:156; src/scene/palace/special/RemainingOuterHalls.js:1817|
|data/zones/outer-east.json#/items/17|南三所东所后殿|SIX_HALL_ROOF_ONLY_AUGMENT_WITH_UNRESOLVED_BINDING|data/zones/outer-east.json:283; src/scene/zones/ZoneBase.js:194; src/scene/palace/special/RemainingOuterHalls.js:173; src/scene/palace/special/RemainingOuterHalls.js:1817|
|data/zones/outer-east.json#/items/18|南三所|DECLARED_GROUP_CONTEXT|data/zones/outer-east.json:299; src/scene/zones/ZoneBase.js:433|

## EXPAND-05 乾东五所
原要求：头所至五所，各自三进正殿、厢房、院门和井亭
本次列出 8 个声明/程序节点/目录上下文记录；不能跨组累加为建筑数量。

- 头所至五所的个别宿主与三进殿/厢房/院门/井亭均未建立可靠映射
- 5壳体不能当5完整宫所或15主殿
- 无额外乾东专用constructor命中；现归通用匿名hall和unknown-inventory保护

|实例引用|名字/角色|当前状态|证据|
|---|---|---|---|
|data/zones/east-six.json#/items/42|乾东五所|GENERIC_SHELL_NO_INDIVIDUAL_THREE_COURT_MAPPING|data/zones/east-six.json:49; src/scene/zones/ZoneBase.js:332|
|data/zones/east-six.json#/items/43|SHARED_GROUP_GATE_BOUNDARY_REGION_CONTEXT|GENERIC_SHELL_NO_INDIVIDUAL_THREE_COURT_MAPPING|data/zones/east-six.json:50; src/scene/zones/ZoneBase.js:378|
|data/zones/east-six.json#/items/44|FIVE_ANONYMOUS_HALL_PLACEHOLDERS|GENERIC_SHELL_NO_INDIVIDUAL_THREE_COURT_MAPPING|data/zones/east-six.json:51; src/scene/zones/ZoneBase.js:194|
|data/zones/east-six.json#/items/45|FIVE_ANONYMOUS_HALL_PLACEHOLDERS|GENERIC_SHELL_NO_INDIVIDUAL_THREE_COURT_MAPPING|data/zones/east-six.json:52; src/scene/zones/ZoneBase.js:194|
|data/zones/east-six.json#/items/46|FIVE_ANONYMOUS_HALL_PLACEHOLDERS|GENERIC_SHELL_NO_INDIVIDUAL_THREE_COURT_MAPPING|data/zones/east-six.json:53; src/scene/zones/ZoneBase.js:194|
|data/zones/east-six.json#/items/47|FIVE_ANONYMOUS_HALL_PLACEHOLDERS|GENERIC_SHELL_NO_INDIVIDUAL_THREE_COURT_MAPPING|data/zones/east-six.json:54; src/scene/zones/ZoneBase.js:194|
|data/zones/east-six.json#/items/48|FIVE_ANONYMOUS_HALL_PLACEHOLDERS|GENERIC_SHELL_NO_INDIVIDUAL_THREE_COURT_MAPPING|data/zones/east-six.json:55; src/scene/zones/ZoneBase.js:194|
|data/zones/east-six.json#/items/49|乾东五所|GENERIC_SHELL_NO_INDIVIDUAL_THREE_COURT_MAPPING|data/zones/east-six.json:56; src/scene/zones/ZoneBase.js:433|
