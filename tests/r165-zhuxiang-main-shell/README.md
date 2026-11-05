# 竹香馆主体一期：有限验收入口

基线 ae712，实际仅新组件＋同步hook136。官方事实/拟合/未做范围见[来源](../../docs/current-state/r165-zhuxiang-main-shell/SOURCE-MANIFEST.md)。没有实景测绘、未知内景或上层开放声明。

## 轻量17个正式用例

```sh
node --test tests/r165-zhuxiang-main-shell/{red,component,roof-form,controller,jump,negative,high,lifecycle,source,ledger}.test.mjs
```

实际控制器48正8负；普通跳跃24；高落15起点×10/30/60/144Hz共60，沿较近坡或地面绕端，不是任意方向/持续冲刺全面验收。闭合主楼负控仅移除唯一可见主核三角接触后原受阻路线能到达。

## 真实宁寿生产单区（串行，不跑World）

```sh
ZHUXIANG_EVIDENCE_DIR=/already-created/evidence node --test tests/r165-zhuxiang-main-shell/production-zone.test.mjs
```

固定ae712原ZoneBase构建baseline，候选仅剥离具名新组/接触/台面/新屋顶后比较旧完整摘要。另实跑累计路线、20落点逐字段、新24邻接及60高落。baseline.capture仅用于重现固定旧构建，不接受把候选快照写成旧基线。第一次约69秒/约1.2GB，勿与另一大区/构建并发。

## 形制与资源

主顶明确分为上部卷棚/两端山面/下部收坡，闭合有向边和侧面首击；耳顶/比例/曲率是拟合。第24接触生成异常和最后私材copy异常清理、真实finish/release/重新登记覆盖。借用材质不得误释放。CPU图只是深度缓冲形体示意，不是GPU画面。

三个历史红保持原断言，不刷绿。构建身份/远端回读另核，不由CPU测试替代。
