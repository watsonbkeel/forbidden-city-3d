# 故宫 3D 虚拟游览

> 用 Three.js 程序化生成的北京故宫第一人称漫游：中轴线全部主要殿宇，加上东西两路的宫院、宫门和御花园，大部分殿宇、宫门都能走进去。  
> **R3 V3 预览分支（2026-10-14）**：新增协和门、熙和门、景运门、隆宗门的独立五间三门与慢道结构，保留前两轮四座建筑；修复画质按钮和浴德堂测试路线规划。此版本不是全宫实景验收，也不是精确测绘模型。当前验证与限制见 [V3验收记录](docs/current-state/V3-ACCEPTANCE.md)，体验见 [V3启动说明](docs/current-state/TRY-V3.md)。
> 原 `v1.0.0` 的功能说明和历史门禁记录保留于下文，不代表 R3 所有场景均已核准。

![Three.js](https://img.shields.io/badge/Three.js-r162-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/Status-v1.0.0-brightgreen)

## 项目简介

建筑、天空由代码程序化生成（纹理为少量位图 + 程序化绘制）；只有 6 座殿的高保真内景是 Blender 脚本生成的 GLB（源脚本在 `assets-src/interiors/`，总计约 1 MB）。场景采用米制坐标组织平面格局（各项尺寸的依据和精度不同）：午门在南，神武门在北，东华门、西华门在东西两侧，可以直接走出宫城。

### 已完成内容
- ✅ **中轴线**：午门、金水桥、太和门、太和殿、中和殿、保和殿、乾清门、乾清宫、交泰殿、坤宁宫、御花园、神武门
- ✅ **东西六宫**：景仁宫、承乾宫、钟粹宫、延禧宫、永和宫、景阳宫（东）+ 永寿宫、翊坤宫、储秀宫、太极殿、长春宫、咸福宫（西）
- ✅ **外路区域**：文华殿、文渊阁、奉先殿、箭亭（外东） + 武英殿、南薰殿、慈宁宫、寿康宫、寿安宫、英华殿（外西）
- ✅ **宁寿宫区**：皇极殿、宁寿宫、九龙壁、乾隆花园、畅音阁等 20+ 建筑
- ✅ **内景系统**：太和殿、乾清宫、皇极殿、养心殿、坤宁宫、慈宁宫 6 座 S 档高保真内景（走近 15 m 自动加载，离开 40 m 卸载，加载失败回退简化内景）+ 其他殿座 B 档简化内景
- ✅ **性能优化**：DrawCall −66.5%, Triangles −57.1%, 目标 60fps(桌面) / 30fps(移动)

## 场景内容

### 中轴线（南 → 北）

午门 → 金水河与金水桥 → 太和门 → 太和殿 → 中和殿 → 保和殿 → 乾清门 → 乾清宫 → 交泰殿 → 坤宁宫 → 御花园（钦安殿、堆秀山、万春亭、千秋亭、浮碧亭、澄瑞亭）→ 神武门

- 三大殿共用三层台基，后三宫保留组团台基；各殿另有台明和阶道。台基轮廓与标高仍需独立实景核对。
- 午门、神武门的门洞有顶，门扇打开后贴在门洞两侧的墙上。
- 殿内有地面、天花和宝座，宝座在中轴上，参观路线从侧面绕过。

### 两侧宫院

| 区域 | 内容 |
|------|------|
| 中轴两侧 | 太和殿院落东西庑房、体仁阁/弘义阁、协和门/熙和门、左翼门/右翼门、昭德门/贞度门、中左门/中右门、后左门/后右门、景运门/隆宗门、内左门/内右门 |
| 内廷东西墙 | 日精门/月华门、龙光门/凤彩门、基化门/端则门，以及东西一长街 |
| 东西六宫 | 景仁宫、承乾宫、钟粹宫、延禧宫、永和宫、景阳宫；永寿宫、翊坤宫、储秀宫、太极殿、长春宫、咸福宫；另有乾东五所、养心殿 |
| 东路 | 文华殿、主敬殿、文渊阁、南三所、奉先殿、箭亭、宁寿宫区（九龙壁、皇极殿、宁寿宫、养性殿、乐寿堂、颐和轩、景祺阁、畅音阁） |
| 西路 | 武英殿、敬思殿、南薰殿、慈宁花园、慈宁宫、重华宫、建福宫/延春阁、英华殿、寿康宫、寿安宫 |
| 宫城出入口 | 东华门、西华门（城台门，可走出宫城）；午门、神武门 |
| 外围 | 城墙、四座角楼、护城河、午门外朝房 |

两侧宫殿按现有项目锚点摆放，细节比中轴简单：多数殿宇是可进入的殿座（带台基、台阶、柱网、宝座），部分宫院为外观 + 院门。

### 交互与界面

- 桌面端：WASD / 方向键移动，鼠标转向，Shift 冲刺，持续按住移动键约 2 秒自动冲刺，**空格跳跃**（可越过 1.1 m 的汉白玉栏杆）
- 移动端：左下角常驻虚拟方向盘（同方向持续推约 2 秒自动奔跑）；屏幕任意位置拖动转视角；右下角「跳」按钮和视角锁定按钮；按手机安全区留边，操作说明 8 秒后淡出
- 城台登城：午门、神武门两端有马道（斜坡踏道），可从宫内一侧走上城台顶
- **M 键小地图**：上北、右东（与真实地图方位一致），标出中轴与两侧宫院、宫门名称，红点和箭头指示自己的位置与朝向
- 左上角位置提示：在中轴和两侧宫院里都会显示当前所在建筑或街巷名
- Esc 打开设置菜单（音效、画质切换）
- 碰撞：不能穿墙、不能穿柱；台阶和台基按真实高度行走，快速移动或低帧率下也不会掉到台基底下

### 渲染与性能

- 实时阴影、SSAO、Bloom、FXAA 后期处理
- 同材质网格合并（`mergeByMaterial`）、实例化渲染，控制 draw call
- 匾额统一烘焙到一张图集
- 高 / 低画质一键切换，移动端自动降低阴影分辨率和像素比

## 快速开始

```bash
npm ci
npm run dev        # http://localhost:5173
npm run build      # 产物在 dist/
npm run preview
npm run test:gate  # 运行完整门禁测试（build + zones + anchors + smoke + regression + stepwalk + perf）
```

开发模式下，浏览器控制台可通过 `window.__forbiddenCityApp` 访问应用实例（调试和自动化测试用）。

## 坐标约定

- +Z 朝北，**-X 朝东**（面朝北时的右手边）
- 每座建筑本地坐标默认朝南（-Z）
- 中轴关键位置（`src/config/constants.js` 的 `LAYOUT`）：

| 建筑 | Z |
|------|---|
| 午门 | -419.6 |
| 太和门 | -214.2 |
| 太和殿 / 中和殿 / 保和殿 | 0 / 65 / 123.2 |
| 乾清门 | 215.3 |
| 乾清宫 / 交泰殿 / 坤宁宫 | 316.8 / 354.1 / 386.1 |
| 御花园 | 470.5 |
| 神武门 | 542（与锚点 531 尚有已知差异） |

- 场景边界：x ±400，z -500 ~ 560（东华门、西华门外留出一段街面）
- 玩家：视线高 1.7 m，步行 5 m/s，冲刺 10 m/s，单步可踏上 0.6 m；方向盘走 3 m/s、奔跑 7.5 m/s；起跳速度 7.2 m/s，重力 14 m/s²（跳高约 1.85 m）

## 项目结构

```
forbidden-city-3d/
├── index.html / main.js / style.css     # 入口与主循环
├── public/textures/                      # 纹理（hd / sd 两档）
├── assets-src/                           # 纹理生成与处理脚本
├── data/                                 # 数据驱动配置（Phase 1）
│   ├── zones/*.json                      # 各区建筑清单（真实米制坐标）
│   ├── interiors/*.json                  # 重点殿内景陈设清单 + GLB 引用
│   └── schema.md                         # 冻结的数据格式
├── docs/                                 # 架构文档与任务管理
│   ├── ARCHITECTURE-1to1.md              # 1:1 复刻控制文件
│   ├── D1/                               # 测绘数据（anchors.json, dimensions.md）
│   └── agent-tasks/                      # 任务板与报告
├── src/
│   ├── config/constants.js               # 尺寸、布局、玩家、性能、后期参数
│   ├── scene/
│   │   ├── zones/                        # 分区 Builder（ZoneBase, AxisZone, EastSixZone, etc.）
│   │   ├── ZoneManager.js                # 分区加载/卸载管理器
│   │   ├── interior/                     # 内景管线（InteriorLoader, InteriorFallback）
│   │   ├── palace/kit.js                 # CourtKit：宫墙、随墙门、门殿、城台门、可进入殿座、庑房、匾额
│   │   ├── palace/gate.js                # 午门
│   │   ├── palace/gateAscent.js          # 城台马道（登城踏道）与碰撞/可行走面
│   │   ├── palace/interiors.js           # 室内陈设预设（大殿/居室/库房，可复用）
│   │   ├── palace/river.js               # 金水河与金水桥
│   │   ├── palace/colliders.js
│   │   ├── PalaceBuilder.js              # 中轴主要殿宇、城门（收编至 AxisZone）
│   │   ├── Enclosure.js                  # 外城墙、角楼、午门外朝房
│   │   ├── GardenBuilder.js              # 御花园（亭、水池、堆秀山、树木，收编至 GardenZone）
│   │   ├── HallKit.js / RoofBuilder.js   # 殿身、台基、栏杆、屋顶
│   │   ├── Layout.js / Environment.js
│   │   └── sky/ garden/                  # 天空、植被与山石
│   ├── render/                           # 渲染优化（Phase 1）
│   │   ├── BatchedBuilder.js             # r162 BatchedMesh 替代 mergeByMaterial
│   │   ├── SilhouetteBuilder.js          # 远景屋面轮廓壳（无投影）
│   │   ├── ShadowSetup.js                # 阴影相机跟随玩家、半径 ≤ 120m
│   │   └── PostProcessing.js             # SSAO 深度重建法线 + Bloom + FXAA
│   ├── controls/                         # 第一人称、虚拟摇杆、传送（Phase 1 增强）
│   ├── utils/                            # 碰撞与可行走面、纹理、几何合并
│   ├── ui/                               # 小地图、设置菜单、位置提示（Phase 1 增强）
│   └── audio/Ambience.js                 # 环境音
└── tests/                                # 自动化测试脚本（Phase 1 增强）
    ├── gate.cjs                          # 门禁总控
    ├── zone-lint.cjs                     # zone JSON schema 校验
    ├── anchor-check.cjs                  # 锚点坐标对比
    ├── smoke.cjs / regression.cjs / stepwalk.cjs
    └── p1r-profile.cjs                   # 性能数据采样
```

### 碰撞与台阶

- 碰撞体是 Box3，只登记身体高度范围内（约 0 ~ 3 m）的部分。
- 可行走面有两类：`box`（平台、台面）和 `ramp`（台阶斜坡）。`getGroundHeight` 返回脚下不超过"脚高 + 单步高度"的最高面。
- 移动按子步长逐步推进，每个子步重新计算地面高度；若玩家已落入台基内部，会被托回台面。
- 跳跃/从高处走下时进入"空中"状态，按真实脚面做碰撞，落地后恢复贴地。
- 城台马道的碰撞体按 0.5 m 切片，只能从下端口走上去，不能从侧面翻上。

### 增加一座新殿

Phase 1 后，建筑由数据驱动（`data/zones/*.json`），使用 `CourtKit` API：

```js
// 在对应 zone 的 JSON 中添加：
{
  "kind": "hall",
  "name": "某某殿",
  "x": -100,
  "z": 150,
  "rot": 0,  // 0=朝南 90=朝东 180=朝北 270=朝西
  "w": 24,   // 面阔（米）
  "d": 14,   // 进深（米）
  "colH": 5, // 柱高（米）
  "ph": 1.2, // 台基高（米）
  "roof": "xieshan",  // 屋顶类型：xieshan / wudian / cuanjian / yingshan
  "enter": true,      // 是否可进入
  "throne": true,     // 是否有宝座
  "interior": "A:palace-front"  // 内景档位（S/A/B）
}
```

门殿与院墙同理：
```js
{ "kind": "gate", "name": "某某门", "x": -80, "z": 140, "rot": 90, "style": "wall" }
{ "kind": "wall", "from": [-100, 140], "to": [-60, 140], "h": 7, "gaps": [] }
```

详见 `data/schema.md` 和 `docs/ARCHITECTURE-1to1.md`。

## 部署

产物是纯静态文件（`dist/`，约 13 MB：贴图 10 MB、JS 0.96 MB / gzip 0.28 MB、内景 GLB 1 MB、draco/basis 解码器 1.3 MB），任何静态托管都能用。

```bash
npm run build                                  # 部署到域名根路径
npx vite build --base=/forbidden-city-3d/      # 部署到子路径（如 GitHub Pages 项目页）
```

- 贴图、内景模型、解码器路径都跟随 `--base`，子路径部署无需改代码。
- 服务器需对 `.wasm` 返回 `application/wasm`（主流托管默认支持）。
- 生产包不暴露 `window.__forbiddenCityApp`（仅开发模式），自动化测试须跑在 `npm run dev` 上。

## 测试

测试脚本用 Playwright + 本机 Chrome（headless，swiftshader），需要先启动 `npm run dev`。Playwright 不在项目依赖里，自行安装；并按本机路径修改脚本里的 `executablePath`。

### 门禁测试
```bash
npm run test:gate  # 完整门禁（8 个步骤：build + zones + anchors + smoke + regression + stepwalk + stepwalk-auto + perf）
```

**门禁状态（v1.0.0 发布基线）**：
- ✅ build（构建通过）
- ✅ zones（7 个 zone，0 错误，23 警告）
- ✅ anchors（113 条锚点，超差 0）
- ✅ smoke（colliders 6560，无报错）
- ✅ regression（24/24 通过）
- ✅ stepwalk（132/132 全部通过；P2-A1 已修复御花园四亭、文渊阁院夹道、蹈和门三处碰撞缺陷）
- ✅ stepwalk-auto（152/152 全部通过，无 knownIssue 跳过）

> stepwalk / stepwalk-auto 会先预加载全部 6 座 S 档内景，按「内景全部在场」的最坏情况测碰撞；预加载失败即判失败。
- ✅ perf（对比 `tests/perf-p2.json`，calls/tris 无劣化；fps 为软渲染参考值）

### 单独运行测试

| 脚本 | 作用 |
|------|------|
| `npm run test:zones` | 检查 zone JSON schema、bounds 缝隙、门净空 |
| `npm run test:anchors` | 对比 anchors.json 锚点坐标，检测超差 |
| `tests/smoke.cjs` | 加载页面，检查无报错、碰撞体数量 |
| `tests/regression.cjs` | 四座城门可通行、护城河与桥、御花园碰撞等回归断言 |
| `tests/stepwalk.cjs` | 用真实控制器按固定帧率逐帧走完中轴与两侧路线，检测"掉到台下""未到达途经点"。`node tests/stepwalk.cjs 60,10 0,1 all` |
| `tests/shot.cjs` | 按给定相机位置批量截图：`node tests/shot.cjs 名称 x,y,z lx,ly,lz ...` |
| `tests/walk.cjs` `realwalk.cjs` | 简单行走验证 |

当前：`stepwalk` 132/132、`stepwalk-auto` 152/152 全部通过，`regression` 全部通过。

## 参数调整

`src/config/constants.js`：

- `DIMENSIONS`：主要建筑尺寸
- `LAYOUT`：中轴位置与场景边界
- `PLAYER`：身高、速度、可踏台阶高度、方向盘速度与奔跑判定、跳跃与重力
- `PERFORMANCE`：阴影、瓦片数等
- 后期处理参数（SSAO、Bloom）

## 开发规范

Phase 1 采用多 Agent 协作开发，遵循严格的文件所有权与接口冻结规则：

- **控制文件**：`docs/ARCHITECTURE-1to1.md`（1:1 复刻架构方案）
- **任务板**：`docs/agent-tasks/BOARD.md`（任务跟踪与分派）
- **数据格式**：`data/schema.md`（zone JSON 与 interior JSON 格式冻结）
- **坐标系**：+Z 北 / -X 东，原点 = 太和殿中心，单位米（1:1 真实尺寸）
- **接口冻结**：`ZoneBase` / `ZoneManager` / `CourtKit` 签名冻结，只增不改
- **文件所有权**：每个任务只改任务卡列出的文件，跨文件需求通过 REQUESTS.md 协调
- **测试门禁**：合并前必须通过 `npm run test:gate`

详见 `docs/ARCHITECTURE-1to1.md` 第 4 节。

## 常见问题

- **黑屏**：看浏览器控制台；确认浏览器支持 WebGL。
- **卡顿**：设置菜单切到低画质；或降低 `constants.js` 中的性能参数。
- **点击后不能移动**：桌面端需先点击画面进入指针锁定，Esc 解锁。
- **想嵌入微信小程序**：用 web-view 加载部署后的 HTTPS 页面（需企业主体小程序、已备案域名），建议默认低画质。

## 说明

建筑为学习与展示用途的程序化还原，按真实格局与比例缩小并做了简化，不是精确测绘模型。

## 开源协议

MIT License，详见 [LICENSE](./LICENSE)。

## 致谢

- [Three.js](https://threejs.org/)
- [故宫博物院](https://www.dpm.org.cn/)（建筑参考资料）
