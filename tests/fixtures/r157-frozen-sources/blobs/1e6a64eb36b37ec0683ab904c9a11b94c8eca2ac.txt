# data/interiors/<hallId>.json —— S 档内景描述文件

每座 S 档殿一个文件，文件名 = `hallId`（ASCII，拼音）。由 `src/scene/interior/InteriorLoader.js` 读取。

| 字段 | 类型 | 说明 |
|---|---|---|
| `hall` | string | 中文殿名，须与 `src/scene/Layout.js` / `data/anchors.json` 一致 |
| `id` | string | 与文件名相同 |
| `tier` | `"S"` | 固定 S |
| `model` | string | GLB 路径（相对 `public/`，以 `/` 开头） |
| `fallback` | `"B"` | 加载失败时退回的档位（当前只有 B，即保留 PalaceBuilder 程序化内景） |
| `budget.tris` / `budget.textureMB` | number | 单殿预算上限，`tests/p1i-budget.cjs` 校验 |
| `frame.x/z/rot/w/d` | number | 殿身框架：世界坐标中心、绕 Y 旋转（弧度，0 = 正面朝 −Z 南）、面阔、进深 |
| `floor.mode` | `"ground"` \| `"fixed"` | `ground`：加载时用 `CollisionManager.getGroundHeight(frame.x, frame.z, 0, 99)` 取殿内地面 y；`fixed`：直接用 `floor.y` |
| `anchor.x/y/z` | number | GLB 相对殿框架原点的附加偏移（通常 0） |
| `preload.enter` / `preload.exit` | number | 玩家距殿身包围盒 ≤ enter 米开始加载，≥ exit 米卸载（默认 15 / 40） |
| `throne.ztb0/ztb1/thW` | number | 宝座台在殿局部坐标的 z 范围与宽度，必须与 `PalaceBuilder.buildHall` 公式一致（stepwalk 的绕行常量依赖此值） |
| `lights[]` | `{type:'point', x,y,z, color, intensity, distance}` | 殿局部坐标的补光；加载时创建、卸载时删除 |
| `source` | string | 考证来源文档 |

## GLB 建模约定

- 局部坐标：原点 = 殿身中心，地面 y = 0，正面朝 −Z（南），+X 为西（与世界一致，不旋转时 rot = 0）。单位米。
- 名字以 `COL_` 开头的 mesh 为碰撞代理：渲染时隐藏，按其世界 AABB 登记到 `CollisionManager`（tag = `interior:<hallId>`）。
- 名字以 `WALK_` 开头的 mesh 为可行走面（顶面 = max.y），同样隐藏。
- 其他 mesh 正常渲染；材质用 PBR（MeshStandardMaterial 兼容），贴图 ≤ 2048。
- 不含灯光/相机；补光由 JSON `lights` 字段提供。
- 预算：≤ 400k 三角形、≤ 8 MB（含贴图）。
