# R158 文华院六项：六叶门与整组差异复核

## 实际结果 / 不是整殿验收

- 基线：`c9b25a71`。先从 Git 读取完整 B-REVIEW 的 gzip JSON 矩阵，再定位六对象85原特征。旧四樘南窗、工字殿/展陈、主敬格井、本仁/集义院面及牌匾都保留，不记为本轮新工作。
- 新增 `WenhuaCentralDoors.js`：只替换文华殿南明间原有两片通用门叶为六个独立门叶组，每叶有连续不透明背板、红/风化色框、裙板、三方向格心；叶数依据[故宫文华殿官文](https://www.dpm.org.cn/explore/building/236531.html)。自身[南面照片](https://img.dpm.org.cn/Uploads/Picture/2024/02/21/s65d5b70481d5f.jpg)像素已检查。三向轮廓不是精确三交六椀雕花。
- 六叶开启态为可逆使用拟合：两侧外叶闭合、每侧两叶内折。照片明确可见两外红叶和两内风化叶，重叠隐叶、铰链角度/精确厚度不完整可辨；没有声称被实测、没有赋予现实参观许可。
- 净宽约3.653m；新增6个与实际不透明叶面包络匹配的薄碰撞。原碰撞按序严格保留；地坪、房间/门/重生、regions、map、全部既有展陈保留。
- 实际完整 outer-east 合并：109574→113438 三角（+3864）；57→60合并材质批（+3），1059→1065碰撞；61 walkables、13 rooms不变。这是几何/批次数量，不是实机draw call或GPU/手机帧率。
- `accepted:false`；不修改 canonical QUEUE，不报文华殿外观/室内整项完成。

## 唯一集成写手所需 hook

本分支没有改共享 `ZoneBase.js`、`outer-east.json` 或 `RemainingOuterHalls.js`。

```js
// ZoneBase.js import
import {finishWenhuaCentralDoors} from '../palace/special/WenhuaCentralDoors.js';

// 紧接原 finishWenhuaSouthWindows(this.kit) 后、普通 kit.finish() 之前
finishWenhuaCentralDoors(this.kit);
```

真实 full-zone 测试在 `kit.finish` 边界注入相同终结器，调用生产 `ZoneBase.build()` 与真实普通合并，不造测试专用建筑替身。完整合并的 architecture 记录同时保留原南窗元数据并把 centralDoors 指向六叶记录。

旧 `tests/major-pilots/wenhua-windows` 的 raw hall 单对象窗口保留断言仍应成立；若其 full-world 旧里程碑断言要求中央两片门永远不变，须把本轮六叶明确列为后续里程碑例外，不得伪称旧中央几何/碰撞hash不变。

## 证据检查

`SOURCE-INSPECTION.json` 登记URL、SHA256与未知摄影日期；不在 Git 发布官网照片。

- 文华殿南面与文华门自身正面照片已分别检查，不能把旧缓存 `wenhua-front.jpg` 的樱花门景当文华殿主殿。
- 本仁/集义自身2022包院面：各16瓦片拼接完整面后检查。单独 `l2/.../01_01.jpg` 仅天空/瓦檐/树，不能独自证明整立面。本仁仍树遮，集义5组可见；不互借对方叶数/配色当测量。
- 主敬自身 a075-u/f、穿廊 a057-f 已检查；保留格井圆画域轮廓、现代吊轨/吊签、双侧柜/斜托与主敬竖匾。目录包年月不当作实拍日或当前完整作品清单。
- `FEATURE-DIFFERENCES.md/json`逐条覆盖6对象85原特征，保留旧未知，不重复发布原矩阵。
- 明确未闭项包括：文华门右端细红格（左端/北面也未修）；文华主殿东西山墙方窗；精确花瓣雕纹/彩画；屋面/台阶/栏板精确分部；配殿室内全覆盖与当前藏品、院设逐物普查。

## 测试和已知边界

专项命令：

```bash
node --test tests/photo-fidelity/batches/r158-wenhua/central-doors.test.mjs
```

专项35/35通过，连同仍适用的既有窗口/门窗回归77/77通过。覆盖叶数/构成/不透明实物、旧非目标严格保留、6同体薄碰撞、真实全区合并、左右/中央各±1.05m入口10/60Hz双向、前殿绕既有岛墙→圆洞→穿廊→主敬两侧绕既有圆展台往返。全程一次setPosition、无rescue/unknown地面；并测试错身份/材料/几何/资源共用、冻结元数据、失败原子性与合并卸载释放。

所选旧回归84项：79通过、5失败，发生时新hook未装入共享生产路径。4个结构/旧物理快照断言已在未改基线 `r157-wumen-integrate` 的 c9b25a71 复现：R36两殿dimensionStatus全子节点断言、malformed profile错误类型断言、R39冻结R38物理hash。另1个旧world-retention依赖当前未materialize的 `reports/major-pilots/wenhua-windows/world-candidate.json`。不修改这些基线问题来制造绿灯。

曾尝试 `npm run test:current-state`；它包含大量旧冻结epoch/产品清单/历史资产依赖失败。按总集成写手资源约束已停止，exit130；仅保留部分日志，不报全量完成。其生成的两个本分支桥测报告已恢复到干净基线；总集成后统一串行全量。

CPU图：真实整个outer-east生产构建、相同pre-merge hook，南整面/中央/斜面/内向外四机位前后共8图；像素已检查。只有实际基色/顶点色，不含纹理、GPU阴影/光照、浏览器/移动端验收。首轮同进程导出在资源并行时退出137；显式GC重跑已退出0，不再重复大导出。

```bash
# 仅空闲时串行执行；脚本要求显式GC，不要与全量测试并发
node --expose-gc scripts/photo-fidelity/batches/r158-b41/wenhua-central-cpu.mjs ../r158-wenhua-court-evidence
```

图、完整日志和SHA证明在同级私有 `r158-wenhua-court-evidence/`；`CPU-PROOF.json`是小体积可核摘要。无部署、无main更改。

## P2 独审修正（后续提交）

- 原29测对两种真实模块 loader 负控都漏检：6叶全移右、所有格条仅1mm。新增实际顶点合同后，两种负控仍分别通过旧29，但新合同各明确失败；未修改磁盘生产文件。
- 新合同直接量世界包络验证双侧各3扇、逐叶位置/尺寸/开角、无正体积重叠和真实净宽；逐条对实际顶点做PCA方向、矩形边界交点全长度、每向全field分布/覆盖，不相信方向标签或BoxGeometry参数。
- 预检拒绝自有/继承getter-only、setter-only和任何accessor/nonwritable数据属性；失败检查场景、几何、物理/导航、owned以及现有元数据描述符/原型都不改变。另拒绝新finalizer key的继承setter。
- 新几何合同暴露原折叶与闭叶角部约3cm体积侵入：只把4折叶沿局部Z后移3cm，使两叶接面、不相穿。净宽、旧地坪/展陈、材质/三角及6薄碰撞数量不变。
- `P2-RED-GREEN.json`与`p2-evidence/*.tap.gz`保存5项先红、35项全绿、77项回归全绿和两组mutant旧绿/新红证据，可用`gzip -dc`读取。复现：`node scripts/photo-fidelity/batches/r158-b41/wenhua-p2-negative-controls.mjs ../r158-wenhua-court-evidence`。
- **CPU-PROOF及8图为P2前的历史首候选图**；不能当作3cm接面修正后的精确姿态图。为遵守资源限制没有重做大型导出，最终集成需再核可见效果；本分支只有顶点/碰撞/实控证据，不补称GPU验收。
