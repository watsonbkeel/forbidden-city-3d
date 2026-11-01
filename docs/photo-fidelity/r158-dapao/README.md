# R158 附属大庖井低模（不增算原41建筑完成数）

基底 `74c6832d1c8351ac3e08031558a0e7146a81a1f1`，对应已回读远端 e2f 净树。独立树仅新增 `src/scene/palace/special/DapaoWell.js` 与本专项证据，不改共享 hook。独立身份 `R158-SUPPLEMENT-DAPAO`，`originalR158Item:false`；不是拿井亭抵掉祝版房/值房/神厨缺口。

## 自有图支持和工程适配
- 既存官刊 `old-p21.pdf/jpg` 明确题注“大庖井”，故宫青少官网图片明确 alt“传心殿之大庖井.jpg”。两张原图亲看：四柱、曲线博风、两坡卷棚状黄瓦、中央屋顶开口、方形砌体井栏。未借用浴德堂井亭，也未用背景未识别房屋裁定治牲所屋顶。
- 阿乐官刊 p2 明确景行门前东侧大庖井及露天顶孔；相对位置有据，图不是实测平面。
- 本体低模做四红柱、淡色曲面博风、黄瓦曲顶、真实矩形天窗、实体方井栏。没有隐形面假开孔。没有猜滑轮/水桶、机械、井内构造、装饰题字或可饮用水。
- 中心 `(-244,-233.5)`、总外包络约4.32×4.23m、檐约2.77m、最高约3.76m、井栏 .9m、天窗1×.9m，均为工程拟合。屋顶轴向与隐藏细部也不声称测绘。
- 实际井深/水位未知：采用**可见浅实体井底**与四面 .9m 实体井栏防止直接步入；不挖深洞，不放不可见救援面，不改 terrain、river、FirstPerson、Collision，不添加 walkable/contact 特例。允许原生跳跃，不声称跳不过井栏；若跳入，原游戏地面和实体浅底仍支持，无深渊。本专项未测跳跃轨迹。
- 地图可见：`大庖井（井深未验；浅井防坠游戏适配）`。原文“未干涸”和有井亭的图证明相关文章时点，不证明2026实时状态、公众开放或水可饮用。

## 空间及必要验证
先扫描、再写产品；不是先建后忽略旧碰撞。当前基线 `loadAll:false` 加载 outer-east 和全局实体（**不是全分区**）：候选 X[-246.25,-241.75], Z[-235.75,-231.25], y(.05,5)旧 AABB交叠0；0.5m网格100个身体/水样本全允许。体量距景行/治牲两者皆留空；x=-236.5主轴、x=-255桥路、x=-221.5夹道与z=-257东西路不动。

3组件真RED（缺builder）→3绿：实体顶点与三角碰撞逐项相符；四柱；垂直射线穿天窗先碰浅井底、旁线先碰真屋顶；四面井栏有阻挡；预留界；重复/变换/冻结注册前置守卫；正常finish保身份。没有晚发布回滚故障注入或整院验收声称。

QA-only before-finish 加候选的当前 World：
- **7/7 路线、3180帧，脚地差峰0m**：10fps步行与60fps跑步各一周井亭外环、各一次既有主轴经景行往返；三条旧路各一次往返。
- **4/4 井栏面直冲拒绝**（60fps跑步），并非跳跃负例。
- 旧对象数组前缀及子对象身份不变；传心主殿、景行仍唯一。再次断言旧区域/全局实体不占候选框。
- 20精确三角组、55mesh、5636triangles、0walkable；2张自制小CPU已亲看，含上视角真实开孔。CPU是平色几何诊断，非生产纹理/GPU/手机验收。

没有全历史套件或Vite构建；独立未接线构建不算覆盖。请唯一集成人接 `buildDapaoWell` 正常pre-finish hook后做必要累计验证和构建。

## 重现/保全
```
node tests/r158-dapao/scan.mjs
node --test tests/r158-dapao/component.test.mjs
EVIDENCE_OUT=docs/photo-fidelity/r158-dapao/world.json node --test tests/r158-dapao/world.test.mjs
node tests/r158-dapao/export-cpu.mjs docs/photo-fidelity/r158-dapao/cpu
python tests/r158-dapao/render-cpu.py docs/photo-fidelity/r158-dapao/cpu/front.json.gz docs/photo-fidelity/r158-dapao/cpu/front.png
python tests/r158-dapao/render-cpu.py docs/photo-fidelity/r158-dapao/cpu/oblique.json.gz docs/photo-fidelity/r158-dapao/cpu/oblique.png
```
`LOCAL-RAW-SHA.json`列8份原始scan/log/world/CPU几何仅本地，禁止上传；保留原官源缓存不复制。提交只有代码/测试/命令摘要/hash和2小CPU。每阶段盘量高于500MiB（本轮约515），未下载新图、未制造大构建或新包。
