# R160 诚肃殿：七间主屋／前廊有限候选

**只新增一个专属模块，尚未安装生产 hook。** 基线 `2ef6274b951c96fa537135f29f9a2837e01da80f`；运行源码与先验 `39488fbc5e1e31a8b2bfc7d93c5d99e9aff77aab` 相同。既有 704 个 src/data 文件逐 SHA 保持。原 E61 对象 `FC-DD68A90CC7` 仅主体片段；不是整宫、现代现况或测绘验收。

## 自身依据与拟合边界

- [故宫斋宫官文](https://www.dpm.org.cn/explore/building/236463.html)：后寝宫由孚颙殿改称诚肃殿，七间、黄琉璃瓦歇山顶。两侧耳房及十一间游廊**不在本次范围**。
- [故宫英文地图页](https://intl.dpm.org.cn/explore/build_maps.html) 对自身图片明确题名 *Hall of Sincere Solemnity (Chengsu dian)*；[1920×1080 原图](https://intl.dpm.org.cn/Uploads/Picture/2023/06/21/s64926bf08ea58.jpg) 可辨前列红柱、退后中心闭门与侧窗、低灰台。不是前殿五间加三间抱厦的照片。
- 图两端裁切、背面未见。**全部坐标、米制尺寸、等分开间、门窗细分、屋顶端部与背侧面、粗材色、0.6 米低台及三阶宽踏面均为工程拟合**。不复制现代垃圾箱／金属拒马，不造耳房／游廊／内陈；闭门，仅外廊可达，不承诺现实开放。

中心 `(-93.7,283.6)`，主屋拟宽 32、深 14.5。三阶每级高 0.2、深 1.8；平台与阶均真实 Box，只有 4 个 `rescue:false` 真顶，没有隐坡或新接触认证。其他 125 个 mesh 各有独立实际三角 owner，合计 129 个新增实体，未用组合空心廊的实心包围盒。没有新增 room/mapItem。

## 实际先验／关口

- 真实 reserve `X[-112,-75.4] Z[270,294] Y[0,12]`：102,729 个相关可见三角、旧 collider/support 相交均 0；3,876 网格身体／水点均清。斋宫实际北沿 264.5，预留南沿相距 5.5 米；景仁门 `z=295.8` 身体净空。实际成品 bounds 为 `[-111.254638,≈0,270] → [-76.145362,10.755178,292.600000]`。
- 缺模块真 RED 7 项保留；组件终态 **7/7**：主体、包络、逐可见三角 owner、真实顶、实际 tileSize UV、前置守卫、正常 finish/dispose。后者不承诺任意 late-publish 异常原子回滚。
- 新廊线首轮 World 真红保留：`z=277.4` 的半径 0.5 身体与可见柱脚重叠约 1 cm。获准后**只把三处新阳性路线坐标改为 `z=277.6`**，没改产品、柱脚、碰撞或旧路线。全横段扫体及 81 个点通过，旧近柱线仍拒；局部 **1/1**。
- 最终一冷场 World **1/1**：新 4 路 **1243 帧**全部到达（10 Hz 走／60 Hz 跑）；前廊峰 `.102000009/.250277788 m`，外绕峰 0；新闭门／背墙 **2 拒绝、150 帧**。不是室内穿门测试。
- 原两街 **4 路/3315 帧**、斋宫 **6 路/371 帧**、其 **3 拒绝/270 帧**，三个完整数组逐对象严格等于正常累计 0946 原件。原斋宫跑落 `.429778/.387667` 与 `strictPoint3Pass:false` **未修、未改写成严格绿**。
- 原 1595 个 collider、91 supports 与旧可见/物理完整摘要保持；新增仅本模块的 129 owners、4 真顶。物理摘要同时包括原 rooms/mapItems。
- 构造为正常 production World + QA before-finish 安装，`loadAll:false, reuseInactive:true`，实际驻留 **east-six、garden、axis-courts** 及全局体；不是全分区／动态加载／GPU／移动设备验收。

`front.png`、`oblique.png` 是实际几何 CPU 深度渲染，平色取 library fallback，灰色大地面仅 QA；不证明真实纹理、光照或 GPU 外观。源图与 raw 不纳提交；`PINS.json` 绑定本地原件与依赖。

## 单一集成接线／复验

在 `src/scene/zones/ZoneBase.js` 导入 `buildChengsuFrontHall`，**既有 Zhaigong 调用之后、kit.finish 之前恰一次**调用 `buildChengsuFrontHall(this.kit,this.zoneJson.id)`；其他 zone 返回 false。不得移除斋宫／奉先已装调用。

```sh
OUT=/tmp/<independent-output> node --test tests/r160-chengsu-front/component.test.mjs tests/r160-chengsu-front/porch.test.mjs
# 两条命令前均先 mkdir 各自输出目录；NORMAL=1 完全不启用作者 prototype 注入，要求正式 hook 已装。
NORMAL=1 OUT=/tmp/<independent-output> \
BASELINE=/tmp/r160-central-zhaigong-0946/zhaigong/world-final.json.gz \
node --test tests/r160-chengsu-front/world.test.mjs
```

原件 `/tmp/r160-chengsu-0952/`：`scan.*`、`component-red.tap`、`component-first.tap`、`world-first-executed.mjs`、`world-first.tap`、`world-first-red.json.gz`、`porch-local.tap`、`local-porch.json.gz`、`world-final.tap/json.gz`、两图几何/日志。作者不跑全应用 build、不上传；正常 hook 与累计构建留唯一集成人。
