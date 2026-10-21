# R32 内金水河五桥首入河段

## 交付边界与证据

本模块将首入所见的矩形槽替换为中部偏南、东西两肩向北转折的有限河段，并生成五座具有真实券腹空洞的桥。五座桥保留既有 `x=-30,-13,0,13,30`、`z=-310.8` 登记点。没有把整条内金水河、侧门河道接头或五桥逐座测绘结果标成完成。

直接核对来源（2026-10-19）：

- [故宫太和门条目](https://www.dpm.org.cn/explore/building/236439.html)：西向东蜿蜒经过广场、五座石桥。
- [故宫里的桥](https://www.dpm.org.cn/architectural_art/246281.html)：五座汉白玉石拱桥的类型。
- [该条目官方首入照片](https://img.dpm.org.cn/Uploads/Picture/2018/01/18/s5a6079fc517e1.jpg)：实际弯曲岸线、五桥排列、可见券洞与起伏桥面。
- [官方导览示意图](https://img.dpm.org.cn/static/themes/image/xf/map3.jpg)，来自 [导览页](https://www.dpm.org.cn/Visit.html)：中心南弯、两肩北转；这是示意图，不能直接作米制测量。

当前 6.1m 桥宽、21m 桥长继续作为逐座独立的工程拟合输入；不声称五桥历史尺寸相等。`river.bridges[i].width/length` 可分别替换，不能只改绘制而不改通行。现有范围量算来源见 `docs/research/dimensions.md` 的内金水桥行；该资料没有将宽度范围逐桥配对。

有限河段的拟合范围是 `x=-76..76`、`z=-318.3..-285.8`。端点止于现有侧门坡脚之前，不设横向墙、栏或假坝。东西延续及其与侧门慢道的真实接合仍待配准。水位、河床、岸厚、栏杆细部、拱起和弯曲半径均为工程拟合，不是现场实测。标识为 `OFFICIAL_TOPOLOGY_MODEL_FIT_NOT_SURVEYED`。

## 单一几何资料与实体

`src/scene/palace/special/InnerJinshui.js` 同时提供：

- `innerJinshuiProfile(river)`：世界坐标岸线、闭合水域多边形、逐桥尺寸、洞口及桥面分段。
- `innerJinshuiGroundPath(river)`：与水面同点列的地面孔洞，采用现有 `(x,-z)` Shape 坐标。
- `innerJinshuiRoadGap(river,4)`：中央8m装饰御道必须移除的水域区间。只切主地面、保留旧平御道会在真实拱洞中留下悬空薄片。
- `canCrossInnerJinshui(river,position,radius)`：以同一多边形和玩家方形脚印拒绝非桥涉水，只在有限桥面矩形内豁免。
- `buildInnerJinshui(library,river,waterMaterial)`：返回一个已作材质合批、已置于世界锚点的 `group`，另含 `water/profile/colliders/walkables`。

桥身为完整挤出的石作断面，券洞是实际空洞；已删去该模块中的实心桥箱/黑半圆替代方案。桥面24段，桥体上缘与120个可行走坡段使用完全相同的采样值；栏板顺同一桥面起伏。每座桥最小岸外搭接为2.267m，未为了保留桥位让桥止于水中。岸栏分段在五桥范围准确留口，不用连续碰撞带封桥头。

该模块不自行创建或释放共享材质、纹理。几何归返回 Group 的持有者释放；兼容 PalaceBuilder 的对象遍历释放。水材质直接沿用 `PalaceBuilder.materials.water`，并保留 `userData.isWater`。

## 必须一起实施的最小接线

本文件为集成说明；专属模块作者未修改以下共享文件。不能只加新 Group 而保留旧 `buildRiver`。

### 1. PalaceBuilder.js：替换整个旧 buildRiver

删除旧 `riverBridges/JINSHUI_BRIDGE_LENGTH` import（如无其他用处），添加：

```js
import { buildInnerJinshui } from './palace/special/InnerJinshui.js';
```

将旧 `buildRiver(data)` 整体替换为：

```js
  buildRiver(data) {
    const result = buildInnerJinshui(this.library, data, this.materials.water);
    this.addObject(result.group);
    this.colliders.push(...result.colliders);
    this.walkables.push(...result.walkables);
  }
```

不要再 `begin/finish`，因为结果已合批并登记世界位置。不要保留旧矩形水面、矩形封端岸墙、两坡桥面、黑色半圆、旧桥栏碰撞或旧坡段。

### 2. Environment.js：主地面和御道同时开孔

添加：

```js
import { innerJinshuiGroundPath, innerJinshuiRoadGap } from './palace/special/InnerJinshui.js';
```

将原河道矩形 Path 构造循环替换为：

```js
    const rivers = PALACE_LAYOUT.filter(item => item.type === 'river');
    for (const river of rivers) shape.holes.push(innerJinshuiGroundPath(river));
```

保留地面创建与UV处理。在御道部分保留 `roadWidth/roadZ0/roadZ1`，把从 `roadLen` 到旧 `this.addObject(road)` 替换为：

```js
    const roadTileSize = this.library.tileSize('stone_slab');
    const roadMaterial = this.library.material('stone_slab', { roughness: 0.75, metalness: 0 });
    const gaps = rivers.map(r => innerJinshuiRoadGap(r, roadWidth / 2))
      .filter(Boolean).sort((a,b) => a.minZ - b.minZ);
    const spans = [];
    let cursor = roadZ0;
    for (const gap of gaps) {
      if (gap.minZ > cursor) spans.push([cursor, Math.min(gap.minZ, roadZ1)]);
      cursor = Math.max(cursor, gap.maxZ);
    }
    if (cursor < roadZ1) spans.push([cursor, roadZ1]);
    for (const [z0,z1] of spans) {
      if (z1 <= z0) continue;
      const length = z1 - z0;
      const geometry = new THREE.PlaneGeometry(roadWidth, length);
      const uv = geometry.attributes.uv;
      for (let i=0; i<uv.count; i++)
        uv.setXY(i, uv.getX(i)*roadWidth/roadTileSize, uv.getY(i)*length/roadTileSize);
      const road = new THREE.Mesh(geometry, roadMaterial);
      road.rotation.x = -Math.PI/2;
      road.position.set(0, .01, (z0+z1)/2);
      road.receiveShadow = true;
      this.addObject(road);
    }
```

### 3. Collision.js：替换矩形水域判断

用以下 import 替换旧 `isOnBridge` import：

```js
import { canCrossInnerJinshui } from '../scene/palace/special/InnerJinshui.js';
```

将 `checkRiverCrossing` 替换为：

```js
  checkRiverCrossing(position, radius) {
    return this.rivers.every(river => canCrossInnerJinshui(river, position, radius));
  }
```

不要改变玩家半径、物理控制、台阶高度或跳跃/救援规则。专属模块返回的碰撞与坡段需要和其它静态建筑同样登记。

### 4. FlightEnvelope.js：新肩部仍须禁止落地

该文件旧矩形水域不能保留为唯一水域标记。添加：

```js
import { innerJinshuiProfile } from '../palace/special/InnerJinshui.js';
```

将 `layout.filter(i=>i.type==='river')` 的旧 `addRect` 循环替换为：

```js
  for (const item of layout.filter(i=>i.type==='river')) {
    const { north, south } = innerJinshuiProfile(item).banks;
    for (let i=1; i<north.length; i++) {
      grid.addRect(south[i-1].x, south[i].x,
        Math.min(south[i-1].z, south[i].z),
        Math.max(north[i-1].z, north[i].z), 0, { water:true });
    }
  }
```

这是按同一岸线逐短段保守栅格化；不依赖水材质名称，也不增加飞行可穿拱洞能力。其它飞行安全包络规则保持原样。

### 5. Minimap.js：绘制同一弯曲水域

添加 `innerJinshuiProfile` import。紧接外城墙分支、在通用 `rectOf` 之前，加独立河道分支：

```js
      if (type === 'river') {
        const profile = innerJinshuiProfile(item);
        ctx.beginPath();
        profile.waterPolygon.forEach((point,index) => {
          const {x:mx,y:my} = this.worldToMap(point.x, point.z);
          if (index) ctx.lineTo(mx,my); else ctx.moveTo(mx,my);
        });
        ctx.closePath();
        ctx.fillStyle = 'rgba(100, 150, 200, 0.6)';
        ctx.strokeStyle = 'rgba(70, 120, 170, 0.8)';
        ctx.lineWidth = 1.2;
        ctx.fill(); ctx.stroke();
        continue;
      }
```

本基线 `worldToMap(x,z)` 返回 `{x,y}`，上例直接沿用该方法。移除下面旧 `type === 'river'` 的矩形分支。若画桥，则以 `profile.bridges` 的 `width/minZ/maxZ` 绘制，不能重新写五个经验点。

### 6. Layout.js：清理过时形制说明

保留五桥列表和河中心锚点。将“仍为100×15矩形、弓形未建模”的旧注释更新为“首入河段为官方拓扑支持的工程拟合；shape/岸线/碰撞以 InnerJinshui profile 为准”。不要将旧 `dimensions.width/depth` 当作新水域矩形；所有水域消费者应通过上述共用 profile。独立桥宽仍是拟合值，不能升级成实测来源。

## 侧门路线的必要调整

原侧门路线在桥头横向直走，会穿过新增的北转水面。不是桥宽不够，也不应为通过旧捷径将河拉直。

在 `tests/stepwalk.cjs` 四条相关侧路中，保留原始起点和原 `gateTransit`，插入两组明确的工程导航点：

- 协和门两条路线：`[[-30, xh.z], [-30,-280], [-80,-280], ...xhTransit, ...原后续点]`
- 熙和门两条路线：`[[30, xi.z], [30,-280], [80,-280], ...xiTransit, ...原后续点]`

`z=-280` 在本段北岸外，`|x|=80` 在本段边界外且仍在现有坡脚前。它们是模型路线QA点，不是历史道路控制点。西/东水系延续未建，因此围绕本段端点的这段通行不能作为全河系现状证明。五座桥南北通路锚点、桥头原有过桥路线与两个侧门本体及坡道不移动。

## 验证与资源

单独执行 `node --test tests/inner-jinshui.test.mjs`：21/21通过。

- 首次红灯：21项中最初15项在文件缺失时按功能断言失败；随后实现；新增的独立输入、开放端点和侧门联动校核也通过。
- 对实际最终合批网格射线验证水域/地面互补、5个真实券洞、石作上缘及两岸桥台、全桥每0.31m支撑一致性。
- 五桥，10/60Hz，走/跑，南北两个方向：40次真实 FirstPersonControls 步行，全部抵达，最高脚点超过0.8m，最终回地面，无负脚点。
- 河段加现有两个实际侧门生成器，10/60Hz，走/跑：8次路径，全部进入原坡道、到原门外地面。
- 脚印碰水、桥栏阻横穿、5桥头无整条岸栏封口，平移一次，独立修改中桥宽长，不合法输入与开放端点均覆盖。
- 4个合批Mesh、40,758顶点、13,700三角面、1,305,288字节几何、4个共享材质、348个局部实体碰撞盒、120个桥面坡段。R31旧河独立对照为6 Mesh、2,620顶点、874三角面、83,852字节；增加约1.22MB静态几何，无新增纹理。
- 未进行浏览器截图、真实GPU帧率、完整合并场景的最终验收，也没有Git写入、上传或部署。

集成前已运行一次现有 `test:current-state`：1009/1010通过；唯一失败是 `taihe-core-geometry.test.mjs` 在导入历史fixture时触发 `data/zones/east-six.json` 的旧R29保留hash断言，与同批获准的六宫数据修改相关。此模块没有修改那个文件或旧hash规则。最终合并场景与保留证据的统一验收由集成负责人执行。
