# P1-Z · 分区内容生产（推荐模型：glm-5.3；抽审：opus5.5）

> 前置：P0 已合入 main；P1-D 的 `docs/research/dimensions.md` 已完成对应区。
> 本任务卡是模板，每个区开一个独立对话，替换 `{ZONE}` 为具体区。
> worktree：`git worktree add ../fc-p1-{ZONE} -b feat/p1-zone-{ZONE}`

## 区列表（每区一个 Agent 对话）
| ZONE | 名称 | 范围 | 建筑数（约） |
|---|---|---|---|
| east-six | 东六宫 | 景仁/承乾/钟粹/延禧/永和/景阳 + 乾东五所 + 奉先殿 | 60 |
| west-six | 西六宫 | 永寿/翊坤/储秀/太极/长春/咸福 + 养心殿 + 重华宫 | 65 |
| ningshou | 宁寿宫区 | 九龙壁、皇极门、皇极殿、宁寿宫、养性殿、乐寿堂、颐和轩、景祺阁、畅音阁、乾隆花园 | 50 |
| outer-east | 外东路 | 文华殿、主敬殿、文渊阁、南三所、箭亭、东华门 | 30 |
| outer-west | 外西路 | 武英殿、敬思殿、南薰殿、慈宁宫、慈宁花园、寿康宫、寿安宫、英华殿、西华门 | 45 |

## 所有权文件（只能改这些）
- `data/zones/{ZONE}.json`
- `src/scene/zones/{ZoneClass}.js`（仅当 ZoneBase 默认行为不够时才新建子类；多数情况 JSON 即可，不建文件）

## 工作方法
1. 读 `data/schema.md`（字段说明）和 `data/zones/axis.json`（范例）。
2. 读 `docs/research/dimensions.md` 中本区的章节，拿到真实尺寸与相对位置。
3. 读 P0 生成的占位版 `data/zones/{ZONE}.json`，在其基础上**逐院落**修正：
   - 院落外墙四至 → `courtWalls`
   - 宫门 → `gate`，位置与墙 `gaps` 对齐
   - 正殿/后殿/配殿 → `hall`，`enter: true` 的殿必须有 `interior` 字段（`"A:palace-front"` / `"B:hall"` 等）
   - 游廊 → `corridor`
   - 命名区域 → `region`（供位置提示）
4. 每改完一个院落运行 `node tests/zone-lint.cjs data/zones/{ZONE}.json`。
5. 全部完成后 `npm run dev`，用 `tests/shot.cjs` 在本区 3 个机位截图，附在报告里。

## 数据规则
- 尺寸单位米，1:1 真实。`dimensions.md` 有的按文档；没有的按同类建筑估算并加 `"source": "estimated"`。
- 所有 item 必须在本区 `bounds` 内；与邻区边界以宫墙中心线为界，墙归南/西侧区。
- 门的 `w` 与它所在墙的 `gaps[].w` 必须相等。
- 不要为了"好看"擅自加历史上没有的建筑。

## 验收
- [ ] zone-lint 全绿
- [ ] 本区所有 `enter: true` 的殿能走进去（手动在 dev 里走一遍或加 stepwalk 路线）
- [ ] 3 张截图：院落全景、正殿近景、从邻区看过来的屋顶群
- [ ] `docs/agent-tasks/REPORTS/P1-Z-{ZONE}.md`：建筑清单（名称/尺寸/来源）、estimated 项列表、遗留

## 禁止
- 不改 schema、不改 CourtKit/ZoneBase、不改其他区的 JSON
- 不改 `constants.js`
