# 坤宁宫：双檐七兽计数候选（非整殿验收）

基线 `4ee02a38`（docs；运行源码同 `a09869af`）。原 R159 为 C17+D32；旧乾清九兽与交泰器物保留，不重计。对象 `FC-8FF65D8732`。

## 来源、可见差异与拟合

- 故宫 [坤宁宫自身斜照](https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e997ecca81fc.jpg)，SHA `91c290932497b85a94d0c60f7294c97530992a0c891c273e09f4a5fdf8a88555`。作者/集成人亲看：远右侧本殿上、下两檐各能辨七只小兽及独立骑者；右上伸入的邻屋角明确排除。URL 日期不是拍摄日期。
- 郑连章《仙人走兽与大吻》[故宫原刊 PDF](https://img.dpm.org.cn/Uploads/pdf/1602/T00091_00.pdf)（一页，SHA `4b261241c3b7c33f2d9c3cfff55de5f53fb728d4ad86e7b9033541b8afaaafb9`）支持坤宁宫七兽。背角按全殿文字推定，**不是四面逐角官照已验**。
- 原通用上层宽 41.656 m 对应每角5只，下层每角3只；这只是当前程序事实。专用 profile 改为两层各4角×7＝56只，保原8骑者。现屋体46.6×20.6及高度、兽尺寸/间距、简单体块/朝外头均为工程拟合，不宣称物种雕刻、实测或现代全殿复原。

## 最小产品范围

仅三生产路径：新 `KunningWalkingBeasts.js`；`HallWalkingBeasts.js` 增明确 profile、精确输入拒绝与局部分派；`KunningPalace.js` 原唯一屋盖调用增加选项。复用**字节未改**的 `QianqingBeastSeat.js` 完整三角贴脊算法。没有移动/改造屋盖、瓦面、吻兽、原骑者、柱/门窗、台基、室内、物理或地图。无 ZoneBase/PalaceBuilder/shared release 接线变更。

相同 roof CPU：12,964→15,140 三角（+2,176），属性1,244,544→1,453,440字节（+208,896），合批均6网格；没有新材质/纹理、碰撞或 walkable。自制 PNG 是真实几何/平色 CPU，非纹理/WebGL/手机验收。

## 真实验证分账

1. 先捕获父指纹，8专项真实 RED 为6红/2绿；canonical 未选 profile 与缺坤宁 profile 的旧状态被识别。首修8/8；最终新12＋原乾清22＝**34/34**，含原非兽流、32种旧 roof 输入、正确朝外头、全底三角/负控、资源与 canonical 全碰撞/支承精确保全。原算法 SHA `f8a22abe1755aef7f04f6a539cac45d205abd0d97fb5b3cf77bd8307d652c5ca`。
2. 第一对正常 World 因 QA 漏传 actual-library，通用 tileSize=1 导致文渊 UV 身份 guard 拒绝，父/候选同红且均未进入路线。完整原件与执行脚本保留；**没有放松产品 guard**。仅接回既有 `createActualLibrary`/HD manifest 后续验。
3. 正确资源、正常无注入 `loadAll:false`、主程序缓存选项 `reuseInactive:true`，仅 garden 实际驻留；启动仍执行7区预构造，含全局静态宫殿/环境。父/候选各4条原生组合：本殿入口10Hz走、东绕60Hz跑、西绕10Hz走、坤宁门60Hz跑，皆往返。**4/1,384帧全到，完整数组父后相同**；9,605物理行、919支承、1水的有序有界摘要全部相同（见 SUMMARY）。这不是全区全部游线或真实每帧动态分区验收。
4. **严格贴地并非全绿**：旧坤宁门60Hz跑289帧中46帧脚差>0.3 m，峰0.87527778 m，在北阶 toe 外 `(3.90469,430.23796)`；父后逐帧完全同。本殿3路线峰≤0.15727778 m。此旧阶台问题另行处理，不混入屋脊修复或更改原数据/断言。
5. 正确父 World 实际使用 integrator `c5fe4f82`＋四狮 ZoneBase 两行 WIP，不是假称纯4ee clean：实源差分/所有src-data哈希在私证据，ZoneBase SHA `1706bf4b9cf929808ab4ca57582b1f262040ddcadd2963108abb1fc23985f63b`。四狮在非驻留 outer-west，当前测试没有排除任何 collider；全物理和路帧硬比相同。修正父/候选分别06:38:17.969/06:38:32.557 UTC终态，轻组06:38:34.097终态（TAP、文件时刻和来源均保留）。

## 复现/交接

```sh
node --test --test-reporter=tap tests/r159-kunning-beasts/component.test.mjs tests/r159-kunning-beasts/contact.test.mjs tests/r159/qianqing-roof.test.mjs tests/r159/qianqing-contact-review.test.mjs tests/r159/qianqing-production.test.mjs
KUNNING_BASELINE=/tmp/r159-kunning-beasts-evidence-0630/world-parent-corrected.json.gz KUNNING_OUT=/tmp/r159-kunning-cumulative.json.gz node --test --test-reporter=tap tests/r159-kunning-beasts/world.test.mjs
```

正常作者源码已经选中 profile，无原型注入/额外 hook。World 以 cwd 为源码根，集成人在累计树运行即可；不再调用 capture-baseline 覆盖固定父指纹。原始日志/逐帧/官源/执行时父差分只在 `/tmp/r159-kunning-beasts-evidence-0630/`。作者未做全应用 build/全套历史回归；独审和单一累计收尾，不自行上传。
