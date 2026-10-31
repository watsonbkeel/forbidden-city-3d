# 午门右／西掖门单叶钉帽：实际 hook / QA / CPU 独立复核

2026-10-31 10:46 UTC，Astra `/root/review_chunked_qa`。承接 `INDEPENDENT-SOURCE-MAPPING-REVIEW.md` 的原图和坐标结论，按父指令扩展到实际单叶接入。只读，不改生产、不运行 World。

## 结论与范围

**有限接受本地候选的实际单叶 hook、组件级物理保全和 CPU 几何表现。不是默认关闭线框研究，也不是午门整项或整版发布验收。** 当前代码确实由生产 `buildGate()` 路径自动添加钉帽；仅一片侧门叶的已见外表面，69帽，不复制另三片侧门叶或背面。完整 World/累计门禁、构建、真实GPU和现地状态本轮未验，不能据本报告宣称整版全绿或已发布。

- P0：本次范围未发现。
- P1 已纠正：照片 r8c7 明确有帽，不能列为缺损；最终保留。r7c8/r8c8 无可见钉帽、r9c1 护栏遮挡未知分别登记，不把未知混作缺失。
- 原 first-4-red 已按明确对象边界处理：装饰成为同铰链兄弟对象，旧实叶本体/碰撞不变；新装饰全部另有实际几何契约。不是只藏到旧检查外面后就不验。
- P2 QA 盲区已补：新组隐藏/缩放及实际相对坐标、缺损列反向、删已见帽/补缺位均有负控；不是只验 site 标签。
- 仍未解：照片真实摄年、米制钉距/材质/球冠尺寸、当前现场缺损状态、门框门洞断面/地坪与整体午门问题。严格整项完成新增0。

## 审核字节

树 `/workspace/scratch/02a8023d1a85/r158-arrow-integrate`，分支 `feat/r157-wumen-right-leaf-20261031`；基线/回滚 `be395c519ddf9a9050382a2cabb770c1f0d10a23`。审核时尚为该基线之上的候选 WIP，后续提交身份另核。

- `WumenLowerBase.js` SHA256 `7ae6df03668ff6e6a1a655e714922a615985954283681cbb7ac6aa2602b0ec4a`
- 新 `WumenRightLeafStuds.js` SHA256 `89196c63536e01c81c5600b7c645441b1043bc7fb663371499f29ae3054e1b02`
- `tests/lib/wumen-right-leaf-fixture.mjs` SHA256 `7cb4abc14bbc84ea90a857436f63b4412e5185053e74712423a2375d53eaa3f8`
- 新测试 SHA256 `93fd4a4949a355aa730c987b7291437adb95b2017668b16724fbd0d452cc5bfb`

独立核 `source-final-1045.json` 全590 src/data摘要、`qa-freeze-1045.json` 全4项均符；旧589源文件里只有 LowerBase 改动（import、调用、说明注释），另新增该 helper。其他生产源字节未改。原 lower19 测试与基线 Git blob 逐字相同。没有改旧 golden、原点/台体/门洞/马道/其他叶或碰撞策略。

## 真入口与正确图证映射

`PalaceBuilder.buildGate → buildWumen → buildWumenLowerBase` 在实际生成门叶后调用 helper；helper 只接受 `portalId=west-yemen && side=+1`，其余门/侧立即返回。新 QA 从真实 `captureGate`/builder 路径取结果，不手动向测试场景安装候选。

目标是右／西掖门近叶，照片画面左侧；局部−Z为外表面，照片左→右列顺序对应 leaf +X→−X。闭门外法线−X、开90°外法线+Z。既有原图报告和实际两态矩阵另存；模型开角、叶宽1.78/高5.2及厚.22均是当前工程值，并非本轮从照片测绘。

最终只有69帽：72位规则阵列中 r7c8/r8c8 对应照片无遮挡无帽，r9c1 为护栏全遮挡而不作；r8c7明确保留。帽缺位只表示不添加金帽，没有伪造照片的小孔深度、磨损、铺首、门环或现代格门。其他三片侧门叶、全部背面均未复制。

## 兄弟组与视觉/物理边界

每帽为真实半球冠网格，不是黑/金贴片。12周向×6纬向段，132三角/帽；69帽共9108新增三角。半径=旧叶宽×.0275，冠高.015m，最终基底放置z−.11，与原叶标称表面−.11接触，实际最外−.125，即最大15mm视觉外凸；真实Float32叶面差在浮点容差内。早轮基底−.111存在1mm工程gap，写入者另加接触负控真实先红再改为贴面；这是真几何变化，不是metadata-only。归一化钉位和所有米制尺寸、颜色/粗糙度均为工程拟合，不是现地测量。

**该15mm装饰明确没有独立 collider/support。** 原.22m门叶仍作为碰撞实体。由此不能声称每个可见钉帽与身体碰撞逐三角一致；这是显式视觉小件边界，不是扩大原叶或加隐形阻挡。

首版把帽组挂在 leaf 下，原19中4项“整leaf可见包络与实体碰撞一致”真实失败（open/closed×2个origin），保留 `old-lower-initial-red.tap`。修订后帽组与 leaf 共享同一 hinge，复制 leaf 的局部 position/quaternion/scale；帽组不标 `door-solid`，原 leaf 子树和实体边界恢复原语义。旧19未弱化。同时新QA验证全部帽三角/法线、真实 group→leaf 相对矩阵与局部厚度，避免通过对象改名逃避检查。

开/闭两次真实构建均检查；另外在同一实际组件上将共享 hinge 转到0、π/4、π/2，group与leaf相对矩阵保持单位阵。证明两对象随同一铰链同步，不是承诺未知未来对leaf单独位姿动画也自动绑定。

生命周期：69帽共享1几何、1自有材质；组件退役和实际finish/merge相关测试通过，资源只退役一次。真实 `PalaceBuilder.finish` 使用 realTextureLibrary和merge，帽材质网格顶点精确等于来源69×132三角；范围/缺位metadata随architecture进入最终生产对象。不是仅 premerge 的手动候选函数结果。

## 既有几何与物理：独立重建基线

旧对象签名锁定723条记录的所列字段：geometry attributes/index/groups、matrix、userData，以及列出的材质参数等；**不是穷尽Three所有字段**（例如该signature本身不含castShadow/maps全部属性）。原 lower19、真实merge检查及非目标源码零改提供另外的有限保证。

我从Git读取be395原 LowerBase，核其 SHA256 `2417a8311d54f9d640eacfbe13fb1ee1ab25e252f6dfdf50e55d723c08ed0c72`，用只认指定文件和候选/原件SHA的私有loader恢复原文件字节，其余源依赖保持基线未改。实际单门开/闭构建均产生0钉组，且**723旧对象记录、452碰撞、16支承逐项摘要精确=retained-be395.json**。这独立确认基线可由原版本重现，不是从带新帽候选反向录制。

签名只规范随机UUID值；写入者早期未规范导致的初基线/红日志保留。此次我没有改基线或规范算法。独立基线复现日志 `/tmp/wumen-right-leaf-prehook-independent-1040.log`，SHA `2f40d124b04d3effb6f11a19a8754a02df3e09ba4b3a534f5aa554ffb849cd89`。

## 独立正/负验证

实际无loader执行：

```sh
node --expose-gc --max-old-space-size=512 --test --test-reporter=tap \
 tests/photo-fidelity/batches/wumen-right-leaf-studs.test.mjs \
 tests/photo-fidelity/batches/wumen-lower-five-portals.test.mjs
```

终态 **29/29＝新10+原19，exit0，0 skip/cancel**。独立TAP `/tmp/wumen-right-leaf-independent-contact-final-1046.tap`，SHA `85cad93fe90c585a7e83d8196cfc13b66bb351f93f23e2acddadc12af4a14c86`。

负控包括：原叶顶点漂移、原碰撞漂移；目标组隐藏/scale2、列翻转、删r8c7、补r7c8；帽几何有限非零三角、外法线、厚度；重复安装/无效尺寸；共享铰链中间角。所有实际帽world→leaf顶点均受检查，不只检metadata或名字。

额外真实源负控：仅用上述hash锁定loader恢复be395原LowerBase，运行原“real buildGate adds only…”测试，明确因钉组数 **0≠1** 失败，exit1。TAP `/tmp/wumen-right-leaf-independent-source-negative-1046.tap`，SHA `b82af5fefecb0074af4838179461f6f384726d67920635dec436cad135c9d92a`。说明测试会抓缺失真实入口，不能由测试setup手注入蒙混。

第一次将非幂等loader用于node:test时，测试子进程重复注册loader，第二层看到已还原的原件SHA而报 `candidate source changed`；该次1042 negative日志只是工具装载失败，**不计作有效源负控**。保留原错日志，随后只允许候选/原件两种精确SHA的幂等loader得出上面的有效0≠1结果，无生产改动。

写入者另报旧main/wings两个文件5项通过、首轮错误cwd的3项失败保留；本独审未将它们冒充自己的29项或全套通过。

## CPU图及源码绑定

已亲看最终cpu-contact-1045三幅after（此前1037旧图也已看）：开门正视、开门斜视、闭门正视。能看到目标单叶列方向、69帽与三处未生成位；闭门旁叶仍无本次装饰，不是另一叶完成。CPU是基色/顶点色z-buffer，颜色金属感、光照阴影/纹理及实际GPU效果未验。

导出对象是**两个门叶的实际门组件**，before24三角→after9132三角，不是全午门/全世界。before是同一次真实构建导出时只剔除精确新帽组的反事实旧外观；旧几何另由be395保全签名支撑，不能称独立旧checkout截图。同组before/after相机相同。未嵌入源照片；不是同机位照片配准。

1036首轮开门视角被另一片真实叶遮挡，失败视图保留；1037只将诊断相机移到两叶之间，未删另一叶或修改开角。早轮metadata更新后曾1042重导出并与1037输入相同，其旧proof与复用说明保留。随后1044/1045接触修复是真几何变化，另重新导出并栅格化全部6幅图，未将1037旧PNG冒称最终几何。

独立核最终 `cpu-contact-1045/PROOF.json` 的所有sourceHashes与当前字节一致；我又以最终源码运行export-cpu到 `/tmp/wumen-right-leaf-independent-export-1046`，6个压缩三角输入及PROOF共7文件与写入者1045终态逐字相同。归档6幅PNG与私有终态PNG逐字相同，最终3幅after已亲看；最终proof SHA `26c2bbdce30eca1c306f0e236d88ff9be40b9e4f3196d43151c731dfe47669af`。首4红、真正接触红、最终29日志gzip解压均等于原件。源590/QA4终冻结全符。首次接触测试启动因路径/cwd错误而未运行的日志不当真RED。最终证据索引和提交若随后新增本报告，需要另作尾核，不把当前检查时间偷换成之后的提交身份。

## 仍需诚实保留的门禁

本报告支持有限开发候选的单叶视觉细化，不代表全城运行、累计full/batch、三base构建、浏览器GPU/性能已通过。新增约9108三角的总体性能未测。旧R159的210失败没有因这28项局部通过而消失。官文门洞尺寸与实际测量面/地坪P1、内拱/门框、其余叶和整个午门原有问题均保留。无main更改、无上传/发布操作由本审核执行。

本报告替代未归档的1044旧草稿（16mm/1mm-gap版本）；该旧草稿不代表1045最终几何验收。最终结论仅对应以上明确SHA、29项及重新渲染图。
