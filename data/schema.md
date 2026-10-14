# 故宫分区数据 Schema

> 版本 v1.1 · 2026-10-14 · R3 显式结构扩展
> 本文件定义所有 zone JSON 的数据格式。每个 zone 由 `ZoneBase` 读取，按 `kind` 分发到 `CourtKit` 对应方法。

---

## 1. Zone 顶层结构

```jsonc
{
  "id": "east-six",              // 唯一标识符，kebab-case
  "name": "东六宫",              // 中文名称
  "bounds": {                    // 区域边界（真实米制，AABB）
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
- `structure: "tiren-pavilion"` 使用体仁阁双层专用构件；支持 `lowerStoreyH`、`upperStoreyH`、`roofH`。来源和暂定比例见 `docs/current-state/cards/tiren.md`。
- `gateKind` 可明确为 `wall`、`three-bay`、`five-bay`。不再从宽度猜门类；未填写时仅以已有 `style:wall/hall` 兼容映射。未知类型直接报错。
- 既有大门的显式五间字段只是保存原生成效果，`structureStatus:provisional-preserved-baseline` 不代表实景核准。`style:triple` 旧数据原来没有实现，仍按旧墙门保留，并标 `provisional-legacy-style-unimplemented` 待复核。
- `cuanjian` 与 `yingshan` 分别规范为 `pavilion` 与 `gable`；未知屋顶类型报错。修复别名不能替代各栋建筑逐项验收。
- 材质合并后，专用殿座的结构记录保留在输出组 `userData.architecture`；乾清门保留 `userData.qianqingGate`。这些记录用于审查，不替代真实几何与通行测试。
- 非均等间宽、逐立面开口、各类阶道的全局通用 schema 仍未完成。本轮四座由专用结构实现，不能据此宣布整条 R2 参数化任务结束。
