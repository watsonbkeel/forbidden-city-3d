# R159 景运门额：自身官图支持的粗红金外框

基线 `c19329fe4199758b89e7eba906413362af17aa51`。只换景运原金矩形底形；保原 `景运门` 汉字面、门/梁/檐/柱、全部物理与其他门牌。不是整门验收，不补满文，不描细涡纹/书法。未上传；最终累计构建由唯一集成人完成。

## 证据与拟合
自身官图：[景运门门额 3907](https://img.dpm.org.cn/Uploads/Picture/dc/3907%5B1024%5D.jpg)，官方词条 https://www.dpm.org.cn/explore/building/236497.html 。原图 `/tmp/r159-jingyun-readonly-0738-3907.jpg`，1024×682，SHA256 `eaa1e28fd85bfb4e08924315fcf619e95d966528737e7667641abf8a272df7a7`；不纳仓库。可辨红金横翼、折曲侧轮廓、下垂尖与厚度；本次以 36 个原创折点概括，不是逐像素描摹。

宽 2m、高 2.36m、背板厚 .03m 和深红/金粗色为工程拟合，非测绘。旧 .1m 金盒穿入原前梁：局部 z[-4.48,-4.38]，梁前沿 -4.44；新金底 z[-4.485,-4.455]，红前沿 -4.487，字面保持 -4.49，消除旧局部穿梁，不动梁。所有新形在字面后，最低 y≈2.78m。

## 精确接入 / 资源
- 新 `JingyunPlaqueFrame.js`；`SideGate.js` 原 `kit.plaque` 后唯一受限调用，已在候选普通 buildSideGate 路径安装，无 QA 注入。无需 ZoneBase hook。
- 只认 profile jingyun、(-106.47,174.1)、rot=π/2、原宿主姿态/唯一 record/字面和金盒实际属性流；错源/重复拒绝，其他 profile/非标准位置/旋转及 `plaque:false` 原样。
- 字面局部(0,3.98,-4.49)、.8×1.4，世界(-110.96,3.98,174.1)不变。record、mesh、frame 对象保留；仅 frame.geometry 替换并新增一个红层 mesh。
- 共用 kit_gold/kit_lacquer，不建新材质/纹理，不改 atlas 记录顺序、文本、字面 geometry/UV。旧几何立即一次释放；新几何走原 finish 合并释放。实际普通 finish/dispose 已验。

## 有限验证（真实终态，不是全套）
1. 基线采 7 个实际 SideGate/Canvas atlas；6 项 RED 为缺自身轮廓/模块，首绿 6/6。追加共享多牌 atlas 与错源保全检查后，最终 **8/8**，`component-green.tap` exit 0，1588ms。
2. 景运除旧框外 203 mesh 的全部 attributes/index/pose/material 流 SHA `1dacb88ed9f34e5e07c2eeb0d27c3b587cbb19d8fa543bf018e02f864d5256ce` 同父；collider/walkable/map/room/region 联合 SHA `0b371f0e651fdbffdf8385a5426ae3c6359bcf51b2ca823afc0d89d873841505` 同父。
3. 原字面/UV、单牌 Canvas atlas、另含前后两牌的完整共享 atlas 保全；另外三种侧门、景运非标准位置/朝向及无牌配置全部同父。
4. 新金/红两体三角闭合非退化、深度不遮字；原梁 box 无交叠；对每个新顶点向上射线检查真实屋顶有 >.03m 间距。此为有限几何检查，非任意飞行/GPU 验收。
5. 两小 CPU 已亲看，粗框与门体大轮廓清楚；**离线 napi Canvas 未加载 CJK 字体，父/候选均蓝面无字，因此图不能证明汉字可读性**。图注“actual unchanged Han atlas”仅指实际未改 Canvas 生成链，绝不表示图中已读出汉字。文字语义、字面/UV/atlas 输入和同环境 PNG 保全另由测试证明。其他材质为 fallback 平色，非实机截图/纹理/GPU。

## 复验命令
```sh
node --test --test-reporter=tap tests/r159-jingyun-frame/component.test.mjs
# 可选同一普通单门 CPU，不需 World
mkdir -p /tmp/jingyun-frame-cpu
node tests/r159-jingyun-frame/export-cpu.mjs /tmp/jingyun-frame-cpu
python tests/r159-jingyun-frame/render-cpu.py /tmp/jingyun-frame-cpu/front.json.gz /tmp/jingyun-frame-cpu/front.png
python tests/r159-jingyun-frame/render-cpu.py /tmp/jingyun-frame-cpu/context.json.gz /tmp/jingyun-frame-cpu/context.png
```
不得重写 `baseline.json` 为候选。原件 `/tmp/r159-jingyun-frame-0815/`（初红/首绿/终绿、基线 capture、CPU JSON/atlas、图、最终源副本）。只本候选 8 组件，无新 World、无全应用构建/GPU；本批未改变通路，不重复既有门路。PINS 逐文件绑定候选/父依赖/私有证据。
