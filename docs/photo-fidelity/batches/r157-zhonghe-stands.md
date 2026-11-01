# R157 中和殿前置两陈设：细腿候选交接

基线 `5b83065fd660fa5f7c68e8cbfa5266aa779a80e1`。独立 detached worktree；无 main/远端branch/共享工作树修改，无发布。父任务选定小候选，待独立 Astra 再由单一整合人接入。

## 自身照片与有限改动

实际亲看故宫[中和殿页](https://www.dpm.org.cn/explore/building/236464.html)所载[1569内景](https://img.dpm.org.cn/Uploads/Picture/dc/1569.jpg)：宝座前可辨细高支腿、浅顶托、较小上方陈设，不是两个巨大带盖桶状通用鼎。仅替换现有两个目标的可见轮廓，**不按这张单图补齐全部陈设**。已有低平台、座椅、屏风、四门、四柱/外廊、天花、匾和台阶不改。

- 原中心保留：x=±(4.56×.35)、z=64。各目标原1.2×1.2×2m包络内拟合；新宽深约.70m、总高约1.29m。并非照片测量或精确方位登记。
- 三根素弯腿是稳定小模型的工程拟合，**不是从400×313图断言原物腿数**。上方是无铭文/无花纹的朴素小体量，没有强行命名器物、补盖/火焰或隐蔽附件。颜色只取宽泛色系，不鉴定材质。
- 新 `ZhongheDisplayStands.js`；`ZhongheDisplaySetting.js` 仅导入、替换旧两次tripod以及清理过时“原鼎仍保留”metadata。旧10 meshes/2整盒不再生成，不作叠加。
- 新26个可见闭合实体各自拥有精确 triangleSupport；空隙内不留旧隐形整盒，不添加walkable、救援面、全局controller例外。
- 精确雕刻、器名、腿数/接合方式、背面、尺寸、拍摄日期仍未知。metadata `accepted:false`。本候选不是中和殿整项验收。

## 本轮实际验证

1. 改动前既有真实控制路线 **42/42**；红测6项均因为新API/目标未实现失败。
2. 改动后新专项 **6/6**＋原真实路线 **42/42**＝**48/48**。包括10/60Hz、走跑、前后退、斜向、正反四门环路，实际低台上下，座椅/屏风阻挡。
3. 从5b真实原殿捕获 `tests/fixtures/r157-zhonghe-stands-retained.json`；新测试逐件排除目标后断言全殿非目标 mesh hashes、非目标collider顺序/范围、全部walkable完全相等。不是只证明目标旁边空地能走。
4. 检查每实体闭合流形、无退化面、外向体积、精确triangle owner；细腿间小探针无碰撞，真实腿与正常1m身体负控有碰撞；重复/错对象拒绝；合批可见射线不变、几何dispose一次。
5. 独立模块 Vite bundle通过：2 modules、5.11kB（gzip2.24kB）、Three外置；不是完整应用三基址验收。
6. 历史 `tests/r55-zhonghe-display.test.mjs` 在未改5b基线与候选均 **1过/5失败、同5个测试名**：R54旧整殿保留指纹、交泰/共享源码旧hash、旧台阶hash、旧新增collider计数、neutral旧hash。候选更改两个旧鼎使其“二鼎必须不变”断言也不再适用；未修改golden或改历史测试。新5b逐项保留证据与真实路线是此候选门禁。

命令：
```sh
node --import ./tests/r141-fix/json-hooks.mjs --test \
 tests/photo-fidelity/batches/r157-zhonghe-stands.test.mjs \
 tests/r55-zhonghe-routes.test.mjs
```

## 成本 / 证据

实际包含台阶的中和片段：205→221 meshes（未合批）、11504→12088 tris（+584）、10→12 builder自有材质、174→198 colliders（+24），walkables仍8。目标自身536→1120 tris。没有新纹理/依赖；材质增加是独立合批最多+2桶，不是实测GPU draw call。

本地证据目录 `r157-threehall-audit-1345/`：
- `zhonghe-baseline.tap`, `stands-red.tap`, `stands-green-first.tap`, `stands-final-targeted.tap`。
- `historical-baseline.tap`, `historical-candidate.tap`, `stands-module-build.log`。
- `stands-before/`, `stands-after/`：实际5b/候选原殿同相机导出；正面、左斜、后通路六张CPU图已亲看。使用已有 `tests/r55-zhonghe/export-diagnostic.mjs` / `render-diagnostic.py`，其R55页脚代表沿用诊断工具，并非旧R55资产替代最新模型。
- 官方图为研究私图，未进入生产/提交。CPU没有贴图、浏览器GPU光照、阴影或移动端帧率证据，不能替代最终真机/整殿照片验收。

首次green仅一项失败为测试把原中心浮点值±1.5959999999999999误写成字面±1.596，改用原表达式校验后48/48；未移动模型满足测试。

独立Astra需重点看：三腿/小件拟合是否足够保守；目标确实减少遮挡而不扩大通行占用；新三角碰撞在真实整合世界保留；不误把此候选当全内景重建。完整全量/三基址构建、发布由整合负责人统一执行。
