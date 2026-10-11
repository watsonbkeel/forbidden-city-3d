# P1-I · 内景管线（推荐模型：sonnet5.5 high；交叉审：gpt-6.1-sol）

> 前置：P0 已合入 main；P1-D 的 `docs/research/interiors-*.md` 至少完成太和殿、乾清宫两份。
> worktree：`git worktree add ../fc-p1-interior -b feat/p1-interior`

## 所有权文件
- `src/scene/interior/*`（新建）
- `src/scene/palace/interiors.js`（可扩展 PRESETS，不改 `furnishRoom` 签名）
- `data/interiors/*.json`（新建）
- `assets-src/interiors/*`（建模源文件与导出脚本）
- `public/models/interiors/*.glb`

## 三档内景（见控制文件 1.2）
| 档 | 做法 | 本任务范围 |
|---|---|---|
| S | GLB 模型 | 搭管线 + 太和殿、乾清宫 2 座样板 |
| A | 参数化模板 | `palace-front`（六宫前殿）、`gate-hall`（门殿）、`study`（书房）、`bedroom`（寝宫）4 个预设 |
| B | 现有盒子 | 不动 |

## 任务
### I-1 InteriorLoader
- `src/scene/interior/InteriorLoader.js`：
  - `GLTFLoader` + `DRACOLoader`（decoder 放 `public/draco/`，从 three/examples 复制）+ `KTX2Loader`（transcoder 放 `public/basis/`）
  - `load(hallId)`：读 `data/interiors/<hallId>.json` → 加载 GLB → 放入 hall 的 frame 局部坐标 → 登记碰撞（从 GLB 中名为 `COL_*` 的 mesh 提取 Box3，渲染时隐藏）
  - `unload(hallId)`：dispose geometry/material/texture，移除碰撞
  - 触发：玩家进入 hall 的 `rooms` 包围盒外扩 15m 时预载；离开 40m 时卸载
  - 加载期间显示 B 档盒子陈设；加载完成后替换（淡入 300ms）
- 失败回退：GLB 加载失败 → 保留 B 档并 `console.warn`，不阻塞

### I-2 interiors JSON schema
```jsonc
// data/interiors/taihe.json
{
  "hall": "太和殿",
  "tier": "S",
  "model": "/models/interiors/taihe.glb",
  "budget": { "tris": 400000, "textureMB": 8 },
  "anchor": { "x": 0, "y": 0, "z": 0 },      // 相对 hall frame
  "lights": [{ "type": "point", "x": 0, "y": 6, "z": -2, "color": "#ffd9a0", "intensity": 2 }],
  "source": "docs/research/interiors-taihe.md"
}
```

### I-3 A 档参数化模板
- 在 `interiors.js` PRESETS 新增 4 个预设，要素：宝座台（3 级）、屏风、匾额、藻井（简化八角）、金砖地纹理、两侧陈设。
- 材质走 `kit.interiorMaterials()` 现有通道，新增材质需注册到 TextureLibrary（走 `assets-src/` 生成脚本）。

### I-4 S 档样板（太和殿、乾清宫）
- 用 Blender（Python 脚本放 `assets-src/interiors/`）按 `docs/research/interiors-taihe.md` 建模：金漆雕龙宝座、七扇屏风、六根金柱、藻井、地面
- 导出：`gltf-transform optimize --compress draco --texture-compress ktx2`（若无 gltf-transform 环境，先导出未压缩 GLB 并在报告中注明）
- 单殿预算：≤ 400k tris、≤ 8MB

## 验收
- [ ] 走进太和殿：PerfHUD 显示 GLB 加载 ≤ 1.5s（本地），走出 40m 后显存回落
- [ ] 东六宫任一前殿套用 `palace-front` 模板，门口 1.6m 通道畅通（stepwalk 不卡）
- [ ] stepwalk + regression 全绿
- [ ] `docs/agent-tasks/REPORTS/P1-I.md`：管线说明、如何新增一座 S 档殿（给后续内容 Agent 看）

## 禁止
- 不改 ZoneBase / ZoneManager 签名；需要钩子写进 `docs/agent-tasks/REQUESTS.md`
- 不改 `src/render/*`
