# 遂初堂南阶台明接触补全

基线为远端 `1f6e583065d50eb655d66c3772fb798a25656e49`，唯一运行改动是 `SuichuSouthSteps.js` 一处现有 `kit.col` 调用及两行注释。原七级南阶家具运动域没有台明实体的接触支撑，有限脚高查询把原0.5m台明当作0，原五点严格传送失败。

新普通盒体仅覆盖原台明实体内部南阶衔接片区，世界范围 `[-256,0,416.55] → [-250.2,.5,418.3]`。宽度来自既有南阶域，末端为未变前门位置；没有新可见几何、纹理、行走面、导航点、物理类型或公共守卫。坐标是既有游戏模型，不是现实测绘。

先红后绿：原严格落点为null。最初开启整台明solid虽让传送通过，却在真实控制器中阻断原后门双向通路，已撤回，正式负控仍复现。最终只取南片区，原前后贯穿与远侧绕行均保留。一次探针修改kit盒体而未重建CollisionManager副本，结果不代表修改后形状；重建后重新记录，不当作产品红证。一次断言误漏Three.Box3的isBox3属性已修正，未改变运行代码。

## 运行

```
node --test --test-concurrency=1 tests/r164-suichu-platform-contact/{component,teleport,controller,go,high,lifecycle,source,ledger}.test.mjs
SUICHU_EVIDENCE_DIR=<writable directory> node --test tests/r164-suichu-platform-contact/production-zone.test.mjs
bash tests/r164-suichu-platform-contact/run-bounded.sh
```

24项轻量包含：原新全部19profile/可见几何/原接触及资源保护、严格resolve/go负控、60条前后/远侧路线、24个高起点下降后南向退出、原1f6同路线对照及source-release后的三轮注册。方向和停点由测试驾驶器控制，非浏览器任意持键实测。`go`使用真实FirstPerson/Teleport和记录型ZoneManager，实际宁寿单区另验，不能合称完整World旅行。

实际宁寿测试保持全部原对象摘要，19落点除遂初外逐字段保持；同时跑本轮60路线/24高落以及此前72条三入口路线。缺衔接、缺七阶、堵门必须拒绝且go不改原姿态。高落从脚高2m/10m开始，没有途中重设位置，只要求正常落下可走南侧退出，不称每个高起点都停在同一表面。

冻结Steps/Remaining/Zone逐字节对真实1f6Git对象，BeforeZone真实载入旧Steps。历史三入口的旧生成器也固定该Steps（其d84源码与1f6相同），避免导入当前接触导致旧落点记录漂移。历史碰撞摘要仅先断言唯一新接触六坐标，再剥离该一条，其余原断言不动；缺失/重复/形状漂移均拒绝。

没有全World、浏览器、GPU、手机、Node20或Mac温度验证。本轮不补新建筑，也不把遂初加入原I29清单，29身份/24局部代码/0整项验收保持。萃赏/梵华原严格落点失败仍待单独处理。
