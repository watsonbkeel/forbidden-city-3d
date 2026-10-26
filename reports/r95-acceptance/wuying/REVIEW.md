# R95 只读核查：R62 武英门/武英殿旧报警

审计源码：R94 `c6a2a28736b4faa3d7a1826840deb4b0954f9bce`，2026-10-26 UTC。没有修改产品文件或历史报告；无全历史扫测。

## 结论

**两条旧报警仍可由当前 zone-lint 复现，但不能认定为“玩家当前进不去”：已确证其起始脚高夹具不合法。** 当前真实生产全世界、实际 FirstPerson 控制器从地面经武英门进入武英殿/敬思殿再返回，10/60Hz × 走/跑 × 前进/倒退共16路线场景全部通过，独立测试9/9（11.76秒）。不是浏览器/GPU证明，也未证明每个任意点均无局限。

这不是“R76修好了两条报警”：R52已明确引入实际月台侧阶/门侧通路及后继自动路线；R76修的是武英殿—穿廊—敬思殿两处内部接面。zone-lint只迁移了文渊与文华专用路径，没有迁移武英的带实际脚高契约。LIMITATIONS仍写“R62实测、不是历史记录、当前真实缺陷未修复”，属于过时/过度结论，应限定为旧通用检查器报警，不要为了抹掉报警重做可通行建筑或减碰撞。

## 精确复现与判定

|稳定ID|旧报警|当前证据|分类/下一步|
|---|---|---|---|
|R95-WUYING-001|武英门北侧出门0.7m处站不下|实际点(220.8,-238.07)，BFS重置feet=0，碰到实体甬道；正确支撑0.8405115089514059处无碰撞。从门中心保持原平台脚高连续走11.73m，正常抵达旧报警点|测试夹具问题，需求通行已实现；迁移lint须从可达地面/合法平台连续走入，不能强造地面spawn|
|R95-WUYING-002|武英殿前门2m沿中线进入失败|实际旧起点(219.5,-212.52)位于真实月台内；默认feet=0导致起点穿入台体。实际脚高1.2处无碰撞，连续入殿5.92m抵达(219.5,-206.6)，完整地面侧阶入殿回程通过|测试夹具问题，需求通行已实现；保留实体台体拒绝无效零高spawn，更新lint合法起点而不是加救援面|
|R95-WUYING-003|LIMITATIONS把R62两红项定性为当前玩家缺陷|当前zone-lint仍exit1，2errors/20warnings，但独立精确重放证明两错误来自feet初始化而非正常路线|文档/契约待修；按本报告描述已证范围并链接旧原始日志，不删除历史证据、不宣称全园完工|

## 可复跑

工作区根目录：

```sh
(cd r94-duixiu-cumulative && node tests/zone-lint.cjs) > r95-independent-audit/wuying/zone-lint-r94.log 2>&1
node --test --test-reporter=tap --test-concurrency=1 r95-independent-audit/wuying/current-routes.test.mjs > r95-independent-audit/wuying/current-routes.tap 2>&1
```

第一命令退出1为本次刻意保留的原探针结果；第二9/9通过。JSON见 `current-routes.json`，含两个旧点真实脚高、旧/正确输入直线结果及16路线摘要。

## 关键源码/既有契约

- `r94-duixiu-cumulative/tests/zone-lint.cjs:243–246` 专用迁移不含武英；`:347–351` 北侧BFS独立重启；`:401–410` 武英走旧泛型前门起点。
- `tests/lib/world.mjs:287–294` 默认脚高从0查询；`:316–321` BFS同样从0开始，高于0.6的实物支撑被排除后身处台体。
- `src/scene/palace/special/WuyingMoonTerrace.js` 明确旧直线起点被新月台占用，提供真实侧阶规范路线、月台/甬道实体和非救援支撑。
- `tests/lib/r52-wuying-routes.mjs`、`tests/lib/r52-wuying-consumer-checks.mjs`：合法地面侧门、月台侧阶、馆内避障与返回；检查实际每帧身体不穿透、无rescue/unverified支撑、台阶高度不超过原控制限制。
- `tests/r52-wuying-route-consumers.test.mjs` 已明确“old ground-height spawn remains rejected inside the solid deck, not silently rescued”。
- `tests/r76-wuying-interfaces.test.mjs` 与 `r76-wuying-drop.test.mjs` 定位内部接面Z=-190.8/-171.4；与本轮两个旧报警点不同，不能混淆修复归因。

没有把其他20warnings、神武门11m锚点或全园路线自动判成无问题；它们不在本轮两点核查范围内。
