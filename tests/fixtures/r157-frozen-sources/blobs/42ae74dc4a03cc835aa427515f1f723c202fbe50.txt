# 故宫分区数据 Schema

> 版本 v1.2 · 2026-10-15 · R3 显式结构与封闭接头扩展
> 本文件定义所有 zone JSON 的数据格式。每个 zone 由 `ZoneBase` 读取，按 `kind` 分发到 `CourtKit` 对应方法。

---

## 1. Zone 顶层结构

```jsonc
{
  "id": "east-six",              // 唯一标识符，kebab-case
  "name": "东六宫",              // 中文名称
  "bounds": {                    // 区域边界（米制模型坐标，AABB；精度不一）
    "x0": -200,
    "x1": -80,
    "z0": 330,
    "z1": 520
  },
  "neighbors": ["axis", "ningshou"],  // 相邻区 id 列表，用于预加载
  "items": [                     // 构件列表，按数组顺序构建
    { "kind": "hall", ... },
    { "kind": "gate", ... },
    { "kind": "wall", ... }
  ]
}
```

---

## 2. Item 类型（kind）

### 2.1 hall（殿座）

程序化生成的殿座：台明、柱网、屋顶、门扇、内部陈设。

```jsonc
{
  "kind": "hall",
  "name": "景仁宫",              // 必填。建筑名称，用于匾额和位置显示
  "x": -130,                     // 必填。世界坐标 x（米）
  "z": 350,                      // 必填。世界坐标 z（米）
  "rot": 0,                      // 可选。旋转角（弧度），或字符串 "south"|"north"|"east"|"west"。默认 0（朝南，正面朝局部 -Z）
  "w": 29,                       // 必填。面阔（米）
  "d": 15,                       // 必填。进深（米）
  "pad": 1.0,                    // 可选。台明在墙外的水平外扩（米），默认 1.0
  "ph": 1.2,                     // 可选。台明高度（米），默认 0.9
  "colH": 6.0,                   // 可选。柱高（米），默认 6.0
  "roof": "xieshan",             // 可选。屋顶类型："xieshan"（歇山）|"wudian"（庑殿）|"gable"（硬山）|"pavilion"（攒尖，方亭）。默认 "xieshan"
  "layers": 1,                   // 可选。屋顶层数（重檐），1 或 2。默认 1
  "brackets": true,              // 可选。是否有斗拱，默认 true
  "enter": true,                 // 可选。是否可进入；通用非敞厅默认 true，专用组件可另有默认
  "throne": true,                // 可选。室内是否有宝座（enter 为 true 时生效），默认 false
  "backDoor": true,              // 可选。殿后是否也开门（可穿行），默认 false
  "open": false,                 // 可选。是否为敞厅（四面无墙，仅柱），默认 false
  "interior": "A:palace-front",  // 可选。内景类型标识符（Phase 1 内景管线使用），默认无
  "plaque": true,                // 可选。是否显示匾额，默认 true
  "map": "hall"                  // 可选。小地图图标类型："hall"|"gate"|"garden"，默认无（不在小地图显示）
}
```

**坐标约定**：`(x, z)` 为建筑中心，`rot` 为正面朝向（局部 -Z 旋转后的世界方向）。

### 2.2 gate（宫门）

宫门。返回墙上需要留出的开口宽度（wall 的 gaps 可引用）。

```jsonc
{
  "kind": "gate",
  "name": "景仁门",              // 必填。门名
  "x": -130,                     // 必填。世界坐标 x（门道中心）
  "z": 335,                      // 必填。世界坐标 z（门道中心）
  "rot": 0,                      // 可选。旋转角（弧度）或字符串 "south"|"north"|"east"|"west"。默认 0（朝南）
  "w": 3.6,                      // 可选。门道净宽（米），默认 3.6
  "h": 4.4,                      // 可选。门道高度（米），默认 4.4
  "t": 1.0,                      // 可选。墙体厚度（米），默认 1.0
  "style": "wall",               // 可选。门类型："wall"（随墙门，两侧门垛）|"hall"（门殿，三间）。默认 "wall"
  "roof": "xieshan",             // 可选。style="hall" 时屋顶类型，默认 "xieshan"
  "brackets": true,              // 可选。style="hall" 时是否有斗拱，默认 true
  "layers": 1                    // 可选。style="hall" 时屋顶层数，默认 1
}
```

**特殊行为**：`gate` 方法返回墙上开口宽度（style="wall" 时 = w + 2.8，style="hall" 时 = 门殿面阔）。在 wall 的 gaps 里可用 `{"at": x, "gate": "门名"}` 引用，ZoneBase 会先构建 gate 记下宽度，再构建 wall 时替换 `gate` 为实际 `w`。

#### R3 V3：有独立依据的侧门记录

| 字段 | 必填性 | 说明 |
|---|---|---|
| `gateKind` | 普通门可选；专用侧门必填 | `wall` / `three-bay` / `five-bay`。专用侧门必须明确为 `five-bay`，不按宽度猜门类。 |
| `gateProfile` | 可选 | 仅接受 `xiehe` / `xihe` / `jingyun` / `longzong`。显式空值、假值、未知值会报错，不能落回旧模板。省略时仍使用普通门逻辑。 |
| `rot` | 可选 | 专用门省略时采用该独立记录的官方朝向；显式指定时只接受四个方向名或有限的正交角弧度。普通门原默认朝南不变。 |
| `open` | 专用侧门可选 | 默认打开；`false` 改变真实门扇姿态与碰撞，不替换门厅开口。不是现实参观许可。 |
| `plaque` | 专用侧门可选 | `false` 不生成匾额；默认显示。 |

例如：

```json
{"kind":"gate","name":"协和门","x":-106.47,"z":-300.3,"rot":"east","gateKind":"five-bay","gateProfile":"xiehe"}
```

专用侧门的宽度、深度、逐间宽、平台、坡顶/脚、门扇线和屋顶由 `src/scene/palace/special/SideGateProfiles.js` 的独立记录决定，不使用普通门的 `w/h/t/layers` 默认值覆盖。模型和路线共用 `sideGateGeometry(item)`；`verified` 仅标记有据值，其余尺寸是明确暂定参数。不要仅凭“形制相同”复制另一门的实测值。

ZoneBase 原样转发专用门的方向供严格验证，避免宽松旧解析器把未知方向改成朝南。`x/z` 必须是有限数值。合并后的 `userData.architecture` 同时记录实际 `facing` 与依据的 `sourceFacing`，以及三条通道和两面慢道的世界坐标。

梯形可走坡仍为 `type: 'ramp'`，可增加完整的 `crossMin0/crossMax0/crossMin1/crossMax1`，分别表示纵轴 `a0/a1` 处的横向范围。四字段必须同时有限且各处min≤max，边界与高度沿同一进度插值。省略全部四字段时保持旧矩形坡行为；部分字段或非法边界会报错，不退回包围矩形。

#### R3 V7：昭德门三间单门专用记录

```json
{"kind":"gate","name":"昭德门","x":-62.4,"z":-214.2,"rot":0,"gateKind":"three-bay","gateProfile":"zhaode","open":true}
```

`zhaode` 使用独立 `ZhaodeGateProfile.js` / `ZhaodeGate.js`，不扩写原四门的五间三门记录。`gateKind: three-bay` 必须明确给出，缺失或不匹配时报错。位置必须为有限数字，方向只接受正交弧度或四个方向名；显式 `open` 必须为布尔值。旧通用 `w/h/t` 不能覆盖独立建筑轮廓，生产记录不保留这些过时值。

模型、地图、碰撞、支持和新增路线共享 `zhaodeGateGeometry(item)`；`wallGapWidth` 是台基及封闭接头所需的墙洞宽，与建筑外柱线尺度不同。南北坡独立定义并带支持 ID。文献值、条件换算、历史图上读数和工程暂定值分别保存，不把整个 profile 都标为实测。

只有此专用门的两个已有庑房记录可以声明下一节的 `gateJoin`；不是通用自动邻接系统，也不自动修改其他门/廊或生成侧向楼梯。

### 2.3 wall（轴对齐墙体）

直线红墙（灰砖下碱 + 红墙身 + 黄琉璃墙帽）。

```jsonc
{
  "kind": "wall",
  "from": [-145, 335],           // 必填。起点 [x, z]（世界坐标）
  "to": [-115, 335],             // 必填。终点 [x, z]（世界坐标）
  "h": 7.0,                      // 可选。墙高（米），默认 6.5
  "t": 1.0,                      // 可选。墙厚（米），默认 1.0
  "gaps": [                      // 可选。墙上开口（门）列表
    {
      "at": -130,                // 必填。沿墙方向的世界坐标（x 或 z，取决于墙的方向）
      "w": 6.4                   // 可选方式 1：直接指定开口宽度（米）
    },
    {
      "at": -115,
      "gate": "协和门"            // 可选方式 2：引用 gate 的 name，ZoneBase 会自动替换为该 gate 返回的宽度
    }
  ]
}
```

**约定**：墙必须轴对齐（`from` 和 `to` 有一个坐标相同）。`gaps` 中的 `at` 是沿墙方向的坐标（如果墙沿 X 轴，`at` 就是 x 坐标；沿 Z 轴则是 z 坐标）。

### 2.4 courtWalls（矩形院墙）

四面围合的矩形院墙，可在任意边开门。

```jsonc
{
  "kind": "courtWalls",
  "x0": -136,                    // 必填。矩形左下角 x（世界坐标）
  "x1": -84,                     // 必填。矩形右上角 x
  "z0": -104,                    // 必填。矩形左下角 z
  "z1": -40,                     // 必填。矩形右上角 z
  "h": 7.0,                      // 可选。墙高（米），默认 6.5
  "t": 1.0,                      // 可选。墙厚（米），默认 1.0
  "gates": [                     // 可选。各边的门列表
    {
      "side": "s",               // 必填。边："s"（南，z=z0）|"n"（北，z=z1）|"xmin"（西，x=x0）|"xmax"（东，x=x1）
      "at": -110,                // 必填。沿该边的世界坐标
      "w": 6.4                   // 可选方式 1：开口宽度
    },
    {
      "side": "xmin",
      "at": 184,
      "gate": "遵义门"            // 可选方式 2：引用 gate name
    }
  ]
}
```

### 2.5 corridor（庑房）

单侧庑房（面向院内或外廊）。

```jsonc
{
  "kind": "corridor",
  "from": [71.9, -146],          // 必填。起点 [x, z]（世界坐标）
  "to": [71.9, -122],            // 必填。终点 [x, z]（世界坐标）
  "facing": "x-",                // 必填。正面朝向："x+"|"x-"|"z+"|"z-"
  "depth": 4.0,                  // 可选。进深（米），默认 4.0
  "colH": 4.0,                   // 可选。柱高（米），默认 4.0
  "name": "朝房"                 // 可选。名称（可进入时显示），默认无
}
```

**约定**：corridor 必须轴对齐（`from` 和 `to` 有一个坐标相同）。`facing` 指定正面（有门窗的一侧）朝向。

#### R3 V7：显式封闭接头 `gateJoin`

```json
{"gate":"昭德门","side":"left","end":"to"}
```

这是 corridor 的可选字段，不是独立 item。仅支持本轮两处已登记接头：

- 原 `[-105.97,-217.3] → [-69.2,-217.3]` 使用 `{gate:"昭德门",side:"left",end:"to"}`，有效靠门端从同一门轮廓解析为 `[-74.6,-217.3]`。
- 原 `[-55.6,-217.3] → [-26.5,-217.3]` 使用 `{gate:"昭德门",side:"right",end:"from"}`，有效靠门端解析为 `[-50.2,-217.3]`。

`left/right` 指门局部 X 的负/正侧，不是照片中的视觉左右；在本轮 rot=0 时分别为地理东/西侧。JSON 原端点保留用于追溯，但渲染和碰撞使用解析后的有效端点。已构建门必须是合法 zhaode profile，side/end 配对、未旋转的原中心线、另一端位于门体外侧均要验证；未知或矛盾接头报错，不偷偷落回旧端点。

接口由门体封闭，原廊地坪、外端及方向保留，不形成侧向可走连接。重建缩短的两条廊可能重排它们的原有间距和家具；不能把这两条的全部几何称为未变。其余廊不受此字段影响。

### 2.6 cityGate（城台门）

城门（午门、神武门、东华门、西华门样式），带城台和门洞。

```jsonc
{
  "kind": "cityGate",
  "name": "东华门",              // 必填。城门名称
  "x": -155,                     // 必填。世界坐标 x（城台中心）
  "z": -115,                     // 必填。世界坐标 z（城台中心）
  "rot": 1.5708                  // 可选。旋转角（弧度）或字符串。默认 0
}
```

### 2.7 region（命名区域）

逻辑区域（不生成几何，仅用于位置显示和小地图）。

```jsonc
{
  "kind": "region",
  "name": "东一长街",            // 必填。区域名称
  "x0": -50,                     // 必填。AABB 边界
  "x1": -40,
  "z0": 170,
  "z1": 305
}
```

### 2.8 nineDragonWall（九龙壁）

**额外注册的 kind**。九龙壁是 SideCourts 的自定义几何（须弥座 + 琉璃壁身 + 九条金龙 + 黄琉璃顶）。

```jsonc
{
  "kind": "nineDragonWall",
  "name": "九龙壁",              // 必填
  "x": -137,                     // 必填。世界坐标 x（壁身中心）
  "z": 145,                      // 必填。世界坐标 z
  "length": 22,                  // 必填。壁长（米）
  "rot": 3.14159                 // 可选。旋转角（面朝向），默认 Math.PI（朝北）
}
```

---

## 3. 旋转角（rot）规范

所有构件的 `rot` 字段支持两种格式：

1. **数值弧度**：`0`、`1.5708`、`3.14159`、`-1.5708` 等。
2. **方向字符串**：`"south"`、`"north"`、`"east"`、`"west"`，对应 `kit.js` 中的 `FACE` 常量。

对应关系（本场景坐标约定：+Z 北，-X 东）：

| 字符串      | 弧度值        | 正面朝向（局部 -Z 转到世界）     |
|------------|--------------|--------------------------------|
| `"south"`  | `0`          | 南（-Z）                        |
| `"north"`  | `Math.PI`    | 北（+Z）                        |
| `"east"`   | `Math.PI/2`  | 东（-X）                        |
| `"west"`   | `-Math.PI/2` | 西（+X）                        |

普通构件由ZoneBase在调用kit前转换字符串；专用侧门将原始方向交给其严格解析器验证。

---

## 4. 扩展规则

- **新 kind**：需在本文件新增一节说明字段，并在 ZoneBase 中注册对应处理逻辑。
- **新字段**：必须在本文件对应 kind 的字段表中补充说明，并标注可选/必填。
- **单位**：所有长度单位为米（真实 1:1 尺度）；角度单位为弧度（或字符串）；坐标为世界坐标（原点 = 太和殿中心，+Z 北，-X 东）。

---

## 5. 实现要求（ZoneBase）

1. **gate 宽度引用**：`wall` 和 `courtWalls` 的 `gaps` 中可写 `{"at": x, "gate": "门名"}`。ZoneBase 需先遍历 items 找到所有 gate 并构建，记录 `门名 → 返回的开口宽度`，再构建 wall 时自动替换。
2. **rot 字符串转换**：普通构件遇到 `"south"|"north"|"east"|"west"` 时转换为弧度；`gateProfile` 专用门保持原始值，由独立记录严格验证并应用自身默认朝向。
3. **kind 分发**：按 `item.kind` 调用 `CourtKit` 对应方法（`kit.hall()`、`kit.gate()`、`kit.wall()` 等）。
4. **顺序执行**：`items` 数组按顺序执行，保证 gate 在引用它的 wall 之前构建。

---

**变更日志**

- 2026-10-11：P0b 初版，覆盖 SideCourts 实际用到的所有 kind 和参数。

## R3 显式结构字段

- `bays`、`roofH`、`roomBays`、`interior` 已从 ZoneBase 传入 CourtKit；不再因字段丢失静默采用默认值。`throne:true` 优先使用既有宝座陈设，避免与新传入的内景预设重叠。
- `storeys` 是实际楼层数，`eaveCount` 是主屋顶檐层数，不能互相替代。普通殿座只支持单层；多层必须有明确专用组件，否则报错。兼容 `layers` 作为檐层数别名。
- `structure: "tiren-pavilion"` 保留为体仁阁兼容入口，现选择独立测绘记录；旧 `lowerStoreyH`、`upperStoreyH`、`roofH` 和 `w/d/ph` 不覆盖该专用记录。新数据使用下节的显式 `surveyed-pavilion` 与 `pavilionProfile`。
- `gateKind` 可明确为 `wall`、`three-bay`、`five-bay`。不再从宽度猜门类；未填写时仅以已有 `style:wall/hall` 兼容映射。未知类型直接报错。
- 既有大门的显式五间字段只是保存原生成效果，`structureStatus:provisional-preserved-baseline` 不代表实景核准。`style:triple` 旧数据原来没有实现，仍按旧墙门保留，并标 `provisional-legacy-style-unimplemented` 待复核。
- `cuanjian` 与 `yingshan` 分别规范为 `pavilion` 与 `gable`；未知屋顶类型报错。修复别名不能替代各栋建筑逐项验收。
- 材质合并后，专用殿座的结构记录保留在输出组 `userData.architecture`；乾清门保留 `userData.qianqingGate`。这些记录用于审查，不替代真实几何与通行测试。
- 非均等间宽、逐立面开口、各类阶道的全局通用 schema 仍未完成。本轮四座由专用结构实现，不能据此宣布整条 R2 参数化任务结束。


## R3 V4：弘义阁与体仁阁的独立测绘记录

```json
{"kind":"hall","name":"弘义阁","x":102.1,"z":-110.4,"rot":"east","w":43.680,"d":16.704,"ph":3.8,"pad":0,"structure":"surveyed-pavilion","pavilionProfile":"hongyi","storeys":2,"eaveCount":1,"enter":true,"plaque":false,"dimensionStatus":"mixed-evidence"}
```

- `pavilionProfile` 只接受 `hongyi` / `tiren`，必须配合 `structure:'surveyed-pavilion'`；未知记录直接报错。`rot` 原样转发并严格验证四个方向名或有限正交角，`x/z` 必须有限。
- 记录中的 `w/d` 是各自下层柱心跨度，保留供地图传送等既有调用读取，不能当屋檐、平座或高台外包。`ph:3.8` 表示在前院地坪0的约定下底层室内面；平台铺地另为3.7，体仁阁此值明确暂定。`pad` 不是新高台轮廓的生成器。
- `PavilionMeasurements.js` 保存独立来源、图号、页码、单位、状态和未知项。`PavilionProfiles.js` 的 `pavilionGeometry(item)` 为模型和路线提供同一份 `lower`、`upper.front/rear`、`gallery.front/rear/supports`、`deck`、`roof`、`waist`、`platform`、`elevations`、`roomBounds`、`frontFlights`、`sideConnections` 和 `approaches`。
- `DIMENSIONED` 只代表标注且端点已辨认；`DERIVED` 为透明算术；共享高台文字是 `TEXT_APPROX`，每阁使用时为 `ADOPTED_TEXT_APPROX_SHARED_SCOPE`。其他外包/结构细节使用 `PROVISIONAL_NOT_SURVEYED`；弘义腰层前总宽冲突保留 `PROVISIONAL_SOURCE_CONFLICT`。`dimensionStatus:'mixed-evidence'` 不等于全模型实测或2026现状验收。
- 坐标来自正面朝下的图纸：u向图右，局部X=−u、Z向后；使用中心开间中心而非全宽几何中心，保留体仁阁4毫米前间差与弘义前后网差。室内0对应worldY3.8；可选 `interiorFloorWorldY` 只改变明确的垂直基准，不移动x/z锚点。
- 上层是九区间围护中的七开口＋两封闭端间；外围另有24根方柱，不能用下层宽×7/9。上层楼板、柱心线、平座边、屋面边和檐/脊标高不能混用。檐标记不是柱顶；生成器 `baseY` 由真实生成檐/脊目标单独求解。H01脊标高指连续正脊帽顶，不是瓦面交点；专用校准扣除共享生成器3.324×ridgeRadius的脊帽升高，真实中心竖向射线验证帽顶。共享低细节屋顶省略鸱吻，不能把其bbox声称为测绘最高装饰高度。
- `approaches.frontLeft/frontRight` 含 `points` 与 `worldPoints`，每点是 `{kind,x,y,z}`，依次为outside、groundToe、stairTop、platform、terraceTurn、centralDoor、interior。中央御路不提供可走坡面；两个32级梯段必须各自可用。
- `sideConnections` 暴露xTop、xLanding、xOuter、landingLength、宽度及高度，南踏跺/北礓磋只能到有明显护栏的暂定2.8m落脚台。`neighborConnection:'DEFERRED_ELEVATION_UNRESOLVED'` 明确表示现有庑廊标高未闭合；不能默认已连通，也不能提高无关庑廊。
- `enter:true` 仅打开下层中央门并登记单一下层房间。上层不登记公共房间/楼梯；高处可走面 `rescue:false`。物理后墙不能镜像前窗，也不能因墙段替换产生后门。
- `interface.wallGapWidth` 与 `corridorTrimHalfLength` 为保持旧锚点所需的局部兼容范围。场景仅截断被新闭合阁体替代的后墙宽度并缩短四个直接相邻廊端；JSON重复数值由精确测试保护，不扩大到63.3m高台全宽。
- `f.userData.pavilion` 与合并后的 `userData.architecture` 保留全部依据/暂定状态、实际朝向、地图/房间/路线接口。所有屋顶/材质继续共享；组件不能dispose共享材质或贴图。来源与限制见 `docs/current-state/cards/hongyi.md`、`tiren.md`。
