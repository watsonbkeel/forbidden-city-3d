# R160 斋宫前殿＋抱厦最小先验设计

固定基线 1b91d942d3ce0c9643ecc7c5df91e30e54c19cd5 / tree 0366d4668c0df1094e62c540548f83d65cac289b。

## 已选范围与依据
- 自身官网 236463：前殿五间、黄琉璃瓦歇山、前出抱厦三间；明间与两次间隔扇门、两梢槛窗。
- 自身图 s5e98392602dde.jpg 清楚支持主殿＋较低抱厦两层体量、红柱前廊、低灰台与石阶；只取粗轮廓。
- 不采用完整两进院落（后殿/配殿/廊/室内缺本轮图与范围）；不采用泛用五间空壳而省略显著抱厦。
- 选单独专属前殿＋抱厦，保原门路/其他主体。现代鹿、展板、精雕与未证背面不建。

## 工程拟合（不是测绘）
- 暂以旧 anchor (-93,256.2)作布置线索；五间主体计划宽约28.6、深约14，抱厦约17×6。精确构件仍须在已验盒内确定。
- 完整允许包络 X[-110,-76], Z[238,267], Y[0,12]，包含屋檐、真实基座、栏杆与石阶。
- 低台拟约0.8m、每级≤0.2m，踏深按人体可走拟合；仅真实可见面支承 rescue:false，不新增私有物理认证，不隐形坡。
- 正面按官文分扇粗面；未知细格、背面与屋顶细部皆明确拟合。不承诺全斋宫或现实开放。

## 本次唯一先验
- 不创建产品。正常 production World + actual texture-library API；loadAll:false/reuseInactive:true。
- east-six 初始区，明确驻留 garden / axis-courts 以覆盖两个旧街腿；不是动态流式验收。
- 真实 collider/support 与已显示三角对完整盒相交；0.5m人体水/占用采样。
- 从原 r47-r46-auto-routes.json 跨区A截取原两腿，原端点不挪：东一 (-62.4,209.9)↔(-63.3,297.2)；东二 (-120.8,299.2)↔(-120.8,193.3)。30Hz走/跑各往返，完整frames保留。不是重跑整个跨区A。
- 保 src/data 起止全SHA；任一非目标实体占用或旧街不通先停并报告，不能挪旧物制造空位。

## 后续（仅先验通过后）
独立树/TDD：粗形与盒、真实分体碰撞、UV/资源、原四组合数组保全及必要新上阶/廊路线和闭墙负控；两CPU亲看后Astra独审。唯一集成人接hook/build；本作者不动共享源码。

## Execution steps
1. Missing builder RED: scoped identity, five/three silhouette, scanned bounds, native real-solid owners, stone tops, UV/resource disposal.
2. Add only `src/scene/palace/special/ZhaigongFrontHall.js`; normal hook recommendation after east-six existing finalizers before finish. Closed front doors preserve photographed state; accessible porch only, no room/teleport marker.
3. GREEN component; same four original street leg arrays, three actual stair approaches plus closed-front/back and column negatives. Test-time before-finish injection only; no production hook here.
4. Two CPU silhouettes and source/photo/unknown disclosure; freeze and independent Astra. Full build/integration solely integrator.
