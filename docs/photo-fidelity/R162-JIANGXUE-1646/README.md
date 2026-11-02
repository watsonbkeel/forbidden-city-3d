# R162 绛雪轩 — 最低独立主体 + 限定程序景观让位

Base `70a98df245d4b2a4c0b385a563b0d6101e9e274e` / tree `1089380c5965fa96bb3d1100094e73b0db62ab94`。原对象 `FC-E0E2F06A88`，不是整御花园验收。

## 直接证据 / 工程拟合
- 官网 https://www.dpm.org.cn/explore/building/236466.html：御花园东南、坐东面西，五间黄瓦硬山主屋、三间歇山卷棚抱厦；明间门、次梢槛窗。正文支持形制，**不支持本模型米制坐标**。
- 自身官方 vp3330 / group107（JSON、cover 原件在 manifest 的 localSources）：https://file-pano.dpm.org.cn/panorama/2025/07/10/b0599e1b-af89-4179-9deb-69efeb67255a.jpg 。亲看低台阶、浅色廊柱、闭中门与上下窗区域及黄色抱厦屋盖；不是其它院照片。
- 中心 (-60.1,445.2) 参考既有 anchor，但不是测绘。主宽14/深5、主屋盖3.5+1.5；抱厦低卷棚/四柱、灰台 .2 与 .1 真阶均工程拟合。坐东面西 = game +X / rotation -PI/2。
- 侧背、门窗细节、材质色和隐蔽收口未逐面认证；本轮仅粗形/库材质，不造精细福寿万字、斑竹纹、匾、缸、内陈。闭壳，无进入室内承诺；不宣称现实开放、GPU/手机外观或整栋完成。

## 明确获准的景观调整（不是空地）
原 capture 的占地中有程序床顶草与 pine0；北 oldCypress 枝叶进入较大原检查盒。不是“零占用”。
- 仅床顶草剪两个矩形：建筑 `[-63.5,-53.9] × [437.7,452.7]`，以及已另获准、无树灯的窄接近条 `[-53.9,-49.8] × [443.7,446.7]`。
- 原 `beds` / `paths` 数组和全部 34 次随机放置/变体/姿态采样不变。在完成每次原 RNG 后，仅 exact pine0（原 anchor F32 -56.5956459045,.300000012,443.886016846；矩阵、trunk/crown 实几何合同）不发布 trunk/crown 和原 1 Box owner。
- 其余33树含北 oldCypress 的全实例矩阵/position/normal/UV/index、原所有其它 GardenBuilder 可见几何、owner、tops 逐字保全。不迁真实古树，不改石灯/床边石/旧甬路/采样参数。原低地草 .012 不动；床顶草 .29 局部剪裁，UV 仍世界坐标。
- 最终新体 bbox X[-63.377672291,-53.999999997], Z[437.799999905,452.600000095], Y≈0..5.332399845；落固定盒，不继续缩放。北树原117 trunk+180 crown 真实相关三角与新实际三角对检，0 broadPairs/0交；原北树 owner 不交。所有新形体落最初完整捕获盒，盒外原树三角不可能与新体交叠。

## 实现与接口
仅 3 个生产路径，见 `summary.json` 与 `GardenBuilder.diff`。
- `JiangxueHall.js`: staged CourtKit 注册前置守卫；每可见对象自身真实 triangle owner（独立唯一 ID），三个石台/阶用可见几何精确 Box + 同顶 `rescue:false`。合计29 owner /3真顶。无坡、无接触白名单、无全局物理改动、0 room/0 map。
- `JiangxueLandscapeFit.js`: 两剪片、精确 pine predicate、必须匹配1棵。不是任意删树策略。
- `GardenBuilder.js`: 仅床顶末端 clip、完整抽样后 exact pine 发布过滤、抽样/发布统计。原 726 其它 src/data Git blobs 精确锁在 protected-source。
- **正常 hook 留唯一集成人**：ZoneBase.js import `buildJiangxueHall`，在现有各 finalizer 后、`this.group = this.kit.finish()` 前调用 `buildJiangxueHall(this.kit,this.kit.root.name)`。作者没有改共享 hook / release / main / branches。

## 真实验证与保留红件
命令在 `commands.txt`，原件 SHA/路径在 manifest，不把 /tmp 原件推 Git。
- 真 missing-module RED 6项；正常 GardenBuilder 真 RED `68 != 66` 后 2/2 绿。最终本体7组件+单殿路线1 =8/8；全项目 suite 未跑，按已授权有界 QA，非全站通过。
- 原生实际 World（真实资源，garden/east-six/west-six/axis-courts + global，loadAll:false）：旧东甬路/南横路走跑4条 **710帧完整对象含end** = 原 capture。garden 区原2706mesh/1359owner/91top、room/map/region前后哈希同。
- 必要新接近从原甬路 (-49,445.2) 到抱厦真前台 (-55.8,445.2) 再返，10/60Hz走跑4条 **304帧** 全到，最大脚地差 **.183666668m**；前闭门与后实墙2拒绝；实际终态feet0/native clear。单殿/World完整对象（含end）精确同。
- 本体初用了库不存在的 stone_white：真实组件红，改现有 stone_slab 后绿。初三角 owner 采用非唯一角色名导致原生 CM 拒绝 Duplicate triangle owner：保 local.log，改每mesh唯一ID，无删实体。
- CPU 看出卷棚上面三角绕序朝下：新增真实法线 RED 后仅翻新屋面绕序，**顶点集合/完整包络相同，但有向 roof owner 三角已变**。作者 World 在翻绕序之前；最终8/8局部、新4/304/2拒完整对象与修前同，最终两CPU已亲看。`winding-comparison.json` 绑定全部无向三角集合（含QA地坪1260tri）一致。不可称最终源全物理字节与修前同。
- 原 temporary geometry-check NaN 是 QA 调 CourtKit.mesh 遗漏位置参数，未形成有效交检；保原失败文件，仅 corrected/actual final-tree-check 有效。第一次 local 失败的空 rows 文件被后续local覆盖，首错误log保留；后续关键 local-before-winding/local-final/World各自独立冻结。
- 资源计数检查本体 geometry 每个一次释放；无新增私有材质/纹理。两图为实际几何 CPU z-buffer + 库fallback色，不是GPU/纹理实机截图。

## 累计关口
勿原样重跑 fixed /tmp 输出覆盖作者原件。复制 QA 到新路径：world 去掉 **全部作者注入 import/call 和 before/after/global capture**，不保留 `__jiangxue*` 句；改 base/output 到累计，原4、新4、闭体负例和脚差条件不改。用正常 hook record/29owner/3false顶替作者 capture gate，保旧4/710与新4/304完整对象。最终绕序源需要正常累计 World + 单一 build；作者不重复 World，不宣称该关口已完成。
