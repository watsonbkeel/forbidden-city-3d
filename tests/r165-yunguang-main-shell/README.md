# 云光楼有限主体检查

冻结d8d56c3066352cc6ca1fd8751156b1527ce5c719的完整ZoneBase，再在新候选增加唯一import/hook138/call。原src/data/main/release逐字节保护，其他J21对象字段保留。

```sh
node --test --test-concurrency=1 tests/r165-yunguang-main-shell/{red,component,gable,controller,negative,jump,high,lifecycle,source,ledger}.test.mjs
node --test --test-concurrency=1 tests/r165-yunguang-main-shell/production-zone.test.mjs
```

本轮18轻量，真实宁寿另1；生产必须串行，不跑World。YUNGUANG_EVIDENCE_DIR可指已有目录写production-zone.json。baseline.capture仅使用精确冻结源，非拿新候选充当旧源。

- 60正路线：L前廊与四条地面外绕×3帧率×走/跑×双向；8闭合核心阻挡。移除真实可见核心的单个三角接触后对应路线才通，不借隐藏墙证明。
- 20正常跳跃：5前廊点×4帧率，每帧身体检查并回0.3m支撑。
- 60高落：15起点×10/30/60/144Hz，从16m自然下落5秒，检查静落末状态、其后连续退出每一帧与终点；最初5秒未逐帧扫描，不声称所有方向/所有高点。上廊高落沿开端退出，未知上层内景未开放。
- 36指定邻接：萃赏南接近点、符望东侧、延趣北侧外路各12例，全部为现有地面连接，不是新建上层游廊。
- actual原始/合批山面首击与4山面有向闭合；屋面/接触包络、资源中断、finish/release后重登记。

保留红证：缺失组件；折角柱挡L廊，移动该拟合柱位；独审发现north下坡边界列误取全坡高度遮山面及两山面端盖绕向，正式gable两条红后修复。首次真区旧物/路线通过不代表这些视觉问题已验，最终需用修正源码再跑。未削弱断言。

新增hook138为空区no-op；历史order只逐个审定Zhuxiang/Juting/Yunguang三条边界再还原原156步，原顺序/错误身份/清理契约不变。累计去重和3预存红见最终RESULT，不能宣称全套绿。

有界累计名单为docs/current-state/r165-yunguang-main-shell/BOUNDED-TEST-FILES.json，281唯一文件1030项1027过/3旧红，另真宁寿1去重后1031项1028过/3旧红。独审39正式单列，不把重复执行叠加。

不要运行默认tests/zone-lint.cjs：它会触发旧World夹具；额外schema检查必须带--no-geo。本轮一次误启动在原奉先守卫中止，非World验收，详见RESULT。
