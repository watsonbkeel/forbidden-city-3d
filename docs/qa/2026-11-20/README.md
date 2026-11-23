# 2026-11-20 定向复核：梵华楼门楣

**此轮只修梵华楼南门楣上行碰撞。分支尚未达到合并门槛，不发布 Pages。**

以 main `8de5c83d25a669a014575a1489429f064a464496` 和本修补父提交 `4ca8776489ccc632bcb8ac4fcab7388124923bf4` 作对照。两份完整归档与 Git 树逐 blob 比对无差异，同锁文件，Node 24.22.3。对[原45条待定测试](../2026-11-18/blockers/unknown.csv)按名重跑：44 条具名断言两版同红，1 条（#58）两版均在文件入口失败，没有仅在候选失败的条目。这不等于已核验44条的当前玩家功能。严谨局部对照未改变任何故宫坐标或历史模型尺寸。

|检查|结果|
|---|---|
|梵华楼真实控制器，10/60 Hz|原候选对照跳跃可越过真实红门楣底面 Y=3.15；修后两频最高眼位均为 Y=3.149，原点的头部重叠从6/40帧降为0/0。门外普通跳、上下楼正常通行及楼板开孔的相关检查保持原表现。|
|[受影响的原64个用例](#复现)|原候选和修后同为58通过、6失败、0跳过、0取消；失败名及首个诊断相同，包含历史前层/全区哈希、人工高空重放、两项旧浮点首断言、归档无Git历史。R164仍精确比较原几何、原支撑及所有原碰撞盒，只另行断言唯一原门楣的六边界与完整新标签。没有降低阈值或重签旧展陈。|
|独立交付回归|修后24/24，含本次可复现双频测试、默认入口回退、三佛CPU解码及分区重入。|
|三佛桌面正面第一人称|**0/2，未验收**。固定父版的 Vite Pages 路径构建、两个 loopback 入口、JS 和三张 PNG（与试玩包哈希同）通过；运行环境在启动浏览器前未获项目内存保护准入。没有以CPU渲染、单独资产或模拟画面代替真实试玩。无参数默认保持旧像；显式 `?triad=texture-first` 为试用模式。|

仍开放：梵华楼紧邻点（x=-340、z=506.4/508.6）在60 Hz跳跃时上方楼板附近重叠仍各24帧；这不是此次门楣已修点。乾清门南阶两版本均能往返，脚底在下阶时短暂离开支撑的最大值约0.47/0.54模型米（60/10 Hz），仍未按实机体验验收。当前证据不覆盖全宫实景、397项视觉签收、全量套件绿灯或部署；不据此合并。

## 复现

在固定锁定依赖的干净节点环境执行：

```sh
env -u NODE_PATH -u NODE_OPTIONS TZ=UTC LC_ALL=C node --test --test-concurrency=1 --test-reporter=tap tests/final-audit/*.test.mjs
env -u NODE_PATH -u NODE_OPTIONS TZ=UTC LC_ALL=C node --test --test-concurrency=1 --test-reporter=tap \
  tests/overhead-shape.test.mjs tests/r58-overhead-collision.test.mjs \
  tests/r164-fanhua-stair-contact/{component,controller,high,jump,production-zone,neighbor,lifecycle,source}.test.mjs \
  tests/followup-fanhua/details.test.mjs tests/photo-fidelity/batches/middle-right-whole.test.mjs
```
