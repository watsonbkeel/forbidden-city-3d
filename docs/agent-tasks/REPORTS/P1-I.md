# P1-I 内景管线 · 报告

> 分支 `feat/p1-interior`（worktree `../fc-interior`）。I-1～I-3 由 sonnet5.5 Agent 完成，I-4 与门禁由总控接手完成（Agent 中途被杀）。
> 验收测试全部在端口 5184 跑：`PORT=5184 tools/run-with-vite.sh node tests/<x>.cjs`。

## 1. 交付清单

| 子项 | 内容 | 提交 |
|---|---|---|
| I-2 schema | `data/interiors/schema.md`、`taihe.json`、`qianqing.json`（frame / floor / anchor / preload / throne / lights） | bd3bdc6 |
| I-1 Loader | `src/scene/interior/InteriorLoader.js`、`registry.js`；`public/draco/*`、`public/basis/*`；`tests/p1i-loader.cjs` | b898205 |
| I-3 A 档 | `src/scene/palace/interiors.js` 新增 `palace-front / gate-hall / study / bedroom` 4 预设；`tests/p1i-presets.cjs` | b3f6cdf |
| I-4 S 档 | `assets-src/interiors/throne_hall.py`（通用宝座殿建模）+ `taihe.py` / `qianqing.py` 驱动；`public/models/interiors/taihe.glb`、`qianqing.glb` | 754c62b, be01048 |
| 视觉 | `tests/p1i-visual.cjs`（B/S 档同机位三视角对比截图） | 之后 |

## 2. 管线说明

```
data/interiors/<id>.json ──► registry.js (INTERIORS) ──► InteriorLoader
                                                            │ update(pos) 每帧：距 frame 边 ≤15 m 预载，>40 m 卸载
                                                            │ load(id)：GLTFLoader(+Draco/KTX2) → group 放到 frame(x, floorY, z, rot)
                                                            │   floorY = CollisionManager.getGroundHeight(frame.x, frame.z)（台明顶面）
                                                            │   COL_* / WALK_* mesh → Box3 → cm.addColliders/addWalkables(tag 'interior:<id>')，渲染隐藏
                                                            │   材质 opacity 0 → 1，300 ms 淡入；lights[] 生成 PointLight
                                                            │ unload(id)：dispose geo/mat/tex，cm.removeByTag，group 移除
                                                            └ 失败：console.warn，state=failed，B 档原样保留
```

- **三档叠加关系**：S 档 GLB 不替换 B 档殿身（柱网/门窗/天花/匾额仍由 PalaceBuilder 出），只**盖住**宝座区：GLB 内的金柱、宝座台、宝座、屏风、藻井、轩辕镜都比 B 档对应盒子略大，把它们包进去。殿内横匾（"建极绥猷"）保留在圆井内，不相交。
- **碰撞**：B 档宝座台碰撞 `[ztb0−1.3, ztb1]` 仍在；GLB 额外登记踏跺每级（可拾级而上）、陈设、台前补盒。
- **HUD**：`loader.hudLine()` 返回 `Interior: taihe | last taihe 55ms 41k`，供 PerfHUD 接入。

## 3. S 档样板数据

| 殿 | tris | 体积 | 可见 mesh | COL_ 代理 | 加载耗时（swiftshader） |
|---|---|---|---|---|---|
| 太和殿 | 40 768 | 0.26 MB | 10（按材质合并） | 16 | 55 ms |
| 乾清宫 | 33 384 | 0.23 MB | 10 | 12 | 62 ms |

预算 ≤400k tris / ≤8 MB，余量充足。Draco 由 Blender 5.2 glTF exporter 直接压缩（未用 gltf-transform；无贴图，KTX2 通道已接但本次未用）。

太和殿内容：金砖地（0.64 m 方砖顶点色明暗）、6 根贴金雕龙柱（Ø1 m，螺旋龙身 + 龙头）、七级踏跺 2 m 宝座台 + 栏杆、金漆宝座（围屏式靠背、龙形扶手）、七扇屏风、三层藻井（方井→八角井斗栱→圆井 16 棱）+ 盘龙衔珠轩辕镜、四对陈设 象→甪端→鹤→香亭。
乾清宫：同模板，柱改红漆（资料：无贴金柱）、五级踏跺 1.3 m 台、三对陈设（甪端/鹤/香亭）。

## 4. 参数推导（与 PalaceBuilder 对齐，新增殿时照抄）

PalaceBuilder.buildHall：`bayW = w/bays`、`dBay = d/nd(=max(3, round(d/7.4)|1))`、`H = clamp((height − y)·0.38, 5, 11)`、`ztb1 = d/2 − min(0.6·dBay, 4.5)`、`ztb0 = ztb1 − min(1.6·dBay, 7)`、`thW = min(1.6·bayW, 0.25·w)`；throneArea：宝座 `tz = zc + 0.1·depth`、屏风 `tz + 0.32·depth`、藻井 `cz = zc − 0.15·depth`、斗环半径 ≤ `1.05·bayW`、轩辕镜 `H − 1.6`。
殿内地面 y = 台面 + 台明 `ph = min(spec.plinth, room/1.6)`（太和殿 9.9375、乾清宫 6.9375）。

## 5. 如何新增一座 S 档殿（给内容 Agent）

1. `data/interiors/<id>.json`：复制 `taihe.json`，改 `hall / id / model / frame(x,z,w,d) / throne / lights / source`；`frame` 取 Layout.js 该殿 position 与 DIMENSIONS。
2. `src/scene/interior/registry.js`：`import` 并加入 `INTERIORS`。
3. 建模：若是宝座殿，新建 `assets-src/interiors/<id>.py`，照 `taihe.py` 填 cfg 并 `from throne_hall import build`；非宝座殿另写脚本，只需遵守：
   - 局部坐标 = three 坐标（原点殿中心、地面 y=0、南 −Z），用 `_common.py` 的 `box/cylinder/sphere/ngon_prism/tube`（已做 three↔Blender 转换）；
   - 碰撞代理用 `col_box('COL_xxx', x0,y0,z0,x1,y1,z1)`（可行走面名 `WALK_`）；
   - 结尾 `merge_by_material()` + `export_glb(out, draco=True)`。
4. 导出：`/Applications/Blender.app/Contents/MacOS/Blender -b -P assets-src/interiors/<id>.py -- public/models/interiors/<id>.glb`，看 `[export] tris=… bytes=…` 是否在预算内。
5. 验证：`PORT=518x tools/run-with-vite.sh node tests/p1i-loader.cjs <id>` 须 PASS；`tests/p1i-visual.cjs <id>` 出 B/S 对比图目视核对盖住 B 档、无穿模。

## 6. 门禁结果（feat/p1-interior @ 最终提交）

| 项 | 结果 |
|---|---|
| vite build | ✅ |
| test:zones | ✅ 0 错 0 警 |
| test:anchors | ✅ 108 条超差 0 |
| smoke | ✅（1 条 404 资源警告在 P0 基线 9b8e50c 上同样存在，非本分支引入） |
| regression | ✅ 24/24 |
| stepwalk 60,10 0,1 all | ✅ 132/132 |
| perf vs perf-p0c.json | ✅ 六点 calls / tris 与基线逐项相同（午门前 604 / 太和殿前 746 / 乾清门 412 / 东六宫 256 / 宁寿宫 260 / 御花园 278）；main.js 未接线，S 档不进基线。接线后太和殿内 +20 calls / +41k tris（p1i-visual 实测），走出 40 m 回落 |
| p1i-loader taihe / qianqing | ✅ PASS |
| p1i-presets | ✅ PASS（4 预设门口通道畅通） |

## 7. 验收对照

- [x] 走进太和殿 GLB 加载 ≤1.5 s：swiftshader 下 55 ms；走出 40 m 后 geometries 回落到加载前（638→318）
- [x] 东六宫前殿套 `palace-front`，门口通道畅通（p1i-presets doorwayClear=true）
- [x] stepwalk + regression（见第 6 节）
- [x] 本报告

## 8. 未接线项 / 请求

- **main.js 接线**（非 P1-I 所有权）：已写入 `REQUESTS.md`。需在 `main.js` 「碰撞检测」步骤之后新建 `this.interiors = new InteriorLoader(this.scene, this.collisionManager, { renderer: this.renderer })`，在 `animate` 里 `this.interiors.update(this.camera.position)`，PerfHUD 多显示一行 `this.interiors.hudLine()`，`dispose()` 时调用 `this.interiors.dispose()`。
- 当前 GLB 无贴图；后续内容 Agent 可为金砖地 / 彩画加 KTX2 贴图（通道已通）。
- 六根金柱位置按 B 档柱网取 x = ±0.5·bayW、±1.5·bayW；资料明间 8.44 m 与 B 档等分 5.73 m 有差，待 P1-Z/柱网精修后同步。
