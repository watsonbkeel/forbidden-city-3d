# 午门两掖门外口薄饰面：独立组件阶段审查

结论：**当前有界组件可进入后续累计验证；不是整版、完整午门或发布通过。** 本审只读生产/QA，仅独立轻量组件复测；未运行 World、GPU 或构建。后续有限旧合同迁移与实际 World 仍待审。

## 身份与实际接线
- 工作树 `r157-restored-411214`，审查基准 `db1f6d26ac02338f65e99b220ea922418a3a54a7`。
- 原 590 个 src/data 路径逐字核，只有 `WumenLowerBase.js` 改动：import 新 helper 并在实际五门构建末尾调用。新增 `WumenSidePortalFaces.js`，生产总集合预期为 591。没有改柱、梁、屋顶、台基、洞宽、高程或门铰。
- 本轮核验 SHA256：Lower `d85a585607578f25cfb4e25b8f2db2ba39cd806241498bae1792344c8f52c1f6`；Faces `8267ba10d21fe4c8b69a0df1112e9170317b8dfd3a5a3e906aca39dd3f5ea92e`；新 fixture `3505358c00366c30cc6dc2a9facbe0f07f80e3a269b871456c41c1fc07c7a7b7`；新 9 项 test `5a6e0fd5b6aecdc69af53e78749543f75a562d1a345ceacc542a7ea676b01c02`。详见 `input-identities.json`。
- 新增 2 个独立所有者、32 mesh：22 黄面板、8 石框边、2 中性题额底。共享一个 BoxGeometry 和 3 自有材质，共 384 三角。不是预览安装器或手动注入生产结果。

## 照片、数量与坐标
逐侧亲看原近照及仅放大的原像素裁图；来源页面为 [Wu Door](https://condoret76.wixsite.com/forbiddencity/wu-door)。左原图 SHA `d2e7d060d4c295b59a2d2721d2abffbfb15018e3eed82b6c88e6f1233c7b372e`，右原图 SHA `370f55bedb974ef41d8002bc4fcc35d7dcacc957c3df671e6f6f86d9dbdac51f`。未向项目复制私有源照片。

- 左：11 格可直接辨认。右：11 格是合理拟合，但右末两个内部边界与白色流痕重叠，不能把每条白线认作接缝，也不能说 11 格均已独立认证。最终 source 注释、metadata 和 SOURCE-REGISTRATION 已区分两者。
- 两侧白石题额框可见。左文字可辨不代表本候选已恢复；右文字曝光不佳。本候选均不画字，中性底不是“历史石额无字”的断言。
- 左宽 5.48、右宽 5.36、面高 0.55 m，各按自侧照片和保留的 3.8 m 门口作工程比例适配。11 等分、4 mm 缝、45 mm 石框、120 mm 牌额间隔与统一颜色均为简化，不是测绘或逐板实测。15 mm 只是受限视觉皮层，不是照片中平额真实深度、挑檐/台阶或墙内构造。
- 东门 sign=-1，西门 sign=+1；新组采用 local +Z 为正面、Ry=-sign*π/2，与旧门框 local -Z 的朝庭法线相同。东面指 world +X，西面指 world -X。新组 local +X 对应照片左到右，勿因与旧门框旋转符号相反误判为倒面。
- 新组静态挂在 lower root，不挂门铰；开闭门不带动饰面。保留墙面 x=±40.6、洞口 z=-16.5、crown=5.4；后表面落在该既有墙面，最外凸不超过 15 mm。此为模型既有基准，不是重新认证这些米制值。

## 独立实测与原件保全
1. `component-and-lower-tap.tap`：新 9 + 原 lower 19 = **28/28，exit 0**。早一轮同集合默认 reporter 文本另存，不混作额外断言。
2. 从 db1 Git 精确抽取原 Lower，SHA `7ae6df03668ff6e6a1a655e714922a615985954283681cbb7ac6aa2602b0ec4a`，以独立只读 loader 重放。`baseline-proof.tap`：开/闭两态 **2/2**，各 723 个原记录、452 collider、16 支承逐字段复现 `before-db1.json`（SHA `4091cd7c02cf192ec23f055546935ffb6918e10a0c7fd4354f843a0e2dc68bc0`）。这不是用当前安装后的场景反录前驱。
3. 同精确前驱运行实际入口检测，`prehook-negative.tap` **exit 1，0 != 2**，真实缺 hook 负控；不是缺模块或导入异常。
4. 当前场景只在比较 clone 中删除已识别两新组，原场景仍有两组；两态原记录、物理及支承保持。723 条是原 `retainedSignature` 明列字段，不穷尽所有 Three 属性，且跳过旧单叶钉组；另以既有 `verifyStudFace` 核其 69 位置及实际变换，不应写成所有旧钉材质字段全量认证。
5. 真 `PalaceBuilder.finish` 用真实材质库合并，核 384 三角顶点及两建筑身份留存、同一物理数组值。原 lower 生命周期测试会监测新增共享几何与自有材质，确认真实 merge/dispose 各资源一次、借用库材质不销毁；失败回滚测试包含注册失败及 4 个资源 disposal listener 同时抛错，仍尝试完整退役并恢复 host/owned registry。

## 本审发现并闭合的 QA 盲区
最初 verifier 只锁声明 pose 与本地 Box 顶点，实际子矩阵漂移可漏检；材质 BackSide/roughness 漂移亦可漏检。作者新增负控真实出现 `Missing expected exception` RED，随后锁 child matrixAutoUpdate、实际 local/world matrix、FrontSide、roughness/metalness/opacity 等，独立上述 28/28 已通过。未改生产几何来迎合测试。

## CPU 证据边界
- 1349 首轮错误继承“ZHONGHE / night-seat”页脚，必须保留为未接受标签轮，不覆盖。1353 新页脚已亲看为实际午门全组件诊断。
- 独立复核 8 份 1353 三角导出 gzip 与 1349 逐字相同，8 图前 800 像素画面完全相同；变的是页脚和绑定新的注释源 SHA。最终各侧正/斜 A/B 相机相同。
- 完整三角行多重集逐项差：各视图原 **49,152** 行全部保留，仅新增 **384** 行至 **49,536**；详见 `cpu-rebinding-and-delta.json`。这里是数据级保留，不以截图观感替代几何测试。
- 已亲看东西正面、东西斜面及前驱对照，新增位置和朝庭关系合理。4 mm 接缝在现图约为亚像素，截图不能证明全部 11 格均清晰可见；由实际几何验证数量。白色旧墙是 CPU 无贴图材质显示，不是官方墙色。
- 仅 CPU 基色 / 几何诊断，未验浏览器、纹理、实时照明、阴影或 GPU。

## P0 / P1 / P2 与后续门槛
- **P0：本阶段未发现。**
- **P1：累计完整验证尚未闭合。** 已知原 590 精确源码 guard 会因合法新增第 591 文件和 Lower hook 报红，不能删除/放松 guard 或刷新旧 golden。拟新增精确 591 闭包及显式只读比较层后，必须保留首红、核每个旧消费者的有限迁移、原断言/实际路线不削弱。实际 raw World、完整非目标物理链和原门路、全套/构建结果均不由本组件报告代替。前序缺史 batch P1 也未因此消失。
- **P2：源与表现限制继续明确。** 右末两格界弱；所有米制拟合、颜色、缝与框尺寸非测绘；无文字复原；不恢复平额真实厚度；当前 CPU 缝宽欠分辨率。可以有界接受薄饰面工程候选，不能称两掖门或午门完成。

允许的下一步：在父协调的唯一重任务窗口里验证已认证候选及严格比较层；raw manager/动作绝不替换，先认证再只克隆删除两新组，绑定 clone tower，不混用原 tower 与 clone group。其余旧对象/物理仍须原合同完整验证。
