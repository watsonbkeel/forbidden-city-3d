# 抑斋局部主体检查

基线c080，生产代码仅新增YizhaiMainShell及ZoneBase一次import/调用。

轻量全部入口：

```sh
node --test --test-concurrency=1 tests/r165-yizhai-main-shell/component.test.mjs tests/r165-yizhai-main-shell/controller.test.mjs tests/r165-yizhai-main-shell/high.test.mjs tests/r165-yizhai-main-shell/jump.test.mjs tests/r165-yizhai-main-shell/negative.test.mjs tests/r165-yizhai-main-shell/lifecycle.test.mjs tests/r165-yizhai-main-shell/ramp-reserve.test.mjs tests/r165-yizhai-main-shell/source.test.mjs tests/r165-yizhai-main-shell/ledger.test.mjs
```

串行真实宁寿单区，不要与其它单区/构建并发：

```sh
node --test tests/r165-yizhai-main-shell/production-zone.test.mjs
```

- 24浅阶双向走跑、24前后廊横行、24外侧绕行/原西侧通路，共72正向；16真实闭门/窗阻挡负控。移除实际四扇前门接触后同路径才可入，排除整栋隐形盒充当负控。
- 15个起点×4帧率，共60高落：落位后连续沿所在坡面向南/北退出，不重设玩家位置，逐帧检查无身体相交、最终回地面。不是任何方向都能走：横越硬山端缘与北坡逆坡探索有停止，保留原日志，不宣称全部屋顶畅行。
- 24正常起跳覆盖前后外廊，头部不穿原本轮梁底；不扩展为旧全区所有门楣已修。
- 单区完整比较c080旧网格/接触/走面/屋顶/地图/房间/架构及20严格落点，并跑此前累计路线。另24邻接到养性殿接近点/古华前院，真实控制器路径在转弯前减速，不是任意全程冲刺输入验收。
- 元数据身份、双硬山闭合朝外拓扑、raw/合批屋顶/门/窗/窗梃射线、ramp占用、源漂移/只读/重复构建、末端资源释放与可重试，以及finish/release后3轮重新登记均有局部证据。

来源见docs/current-state/r165-yizhai-main-shell/SOURCE-MANIFEST.md。精细彩画/窗格、尺寸、后门位置、照片日期/现行开放和未知内景均未核，采用有标注拟合；无新增传送/家具。CPU示意和数值不能替代GPU、浏览器、手机、完整World、Node20验收。
