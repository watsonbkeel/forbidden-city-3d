# R49B 验证结果：保留全套红结果

生产代码 11 文件在所有最终运行前冻结，aggregate SHA-256 为 `4fc88d73669e099f015faac3f5b4cc2b2afb13c9dff0d608e3734aebbc4d8300`，详见 production-frozen.sha256。旧测试未修改；补充入口和 fixture 分别冻结。

## 同口径基线及全套

- R49 337 入口权威完整基线来自 `reports/r49/final-validation/final-current.tap.gz`：5277 tests、5119 pass、158 fail，exit 1。337 入口字节与本候选所复用的旧测试相同；351 基线生产文件 hash 与 R49 精确相同，两个 reused-r49-*check.log 证明可复用，未无效重复同一全套。
- 候选同 337 + 9 新入口 = 346，2 并发：5265 tests、5085 pass、180 fail，实际 node exit 1，737241.199498ms，0 SIGKILL。原始 TAP 在 final-matched-inventory.tap.gz，exit-code.txt 是捕获的 node 退出码，不是后续 tail 的状态。
- 158 个原失败身份全部重现，无消失；22 个新增失败逐项见 failure-attribution.json，完整原始诊断与对照见 failure-comparison-full.json.gz。15 个为旧整殿/牌匾几何精确不变假设，1 个为旧单牌匾 atlas 假设，4 个为获准变化后的旧抱厦界面/高度假设，1 个为原源码守卫中止身体入口，1 个为文渊下檐可视问题尚未解决。
- 文渊的新增红项是旧 4m/8m 站立视点射向牌面下行先击中 `wenyuan_green_glazed_edge`，不是柱挡；本轮未证明该投影与官方视点一致，不能用“自然遮挡”免检，明确列入 UNFINISHED.md。
- 计数差异不是隐藏测试：5277 + 44 − 57 + 1 = 5265。原身体模块在 57 个断言注册前因 kit.js 旧 hash 守卫退出，形成 1 个文件级失败。

## 分别报告的补充检查

- 九个针对性入口 44/44 通过，独立复验 TAP 在 `../release/independent/global-targeted-final.tap`。同九入口也包含在上述 346 全套中。
- 新 `r49b-inherited-world-body.test.mjs`：57/57，exit 0，15227.44886ms。实际候选 buildWorld/ZoneBase、路线、支持三角和身体断言与原测试逐字相同；只新增供 SHA-256 校验的 R49B→R49 字符串逆差分，未执行或写回任何旧模块。独立审查/篡改拒绝证据见 `../release/independent/body-guard-adapter-review.*`。body-supplement.tap、body-world-report.json.gz 和 body-summary.json 保留实际路线结果。
- 新 `r49b-canopy-player-clearance.test.mjs`：2/2，exit 0，571.355692ms。对两个实际候选抱厦检查完整屋架、完整匾不侵入真实 PLAYER 站立/跳跃包络，中央接近带不新增阻挡，四根真实柱仍阻挡，柱脚仍在原台基。没有用旧源码 hash 代替改变后的建筑检测。
- 这两项是全套之后独立运行的 2 个补充入口；不是重写原180失败，也不将57和2补通过合并成“全库通过”。最终交付共 11 个新增 .test.mjs，9 个在 346 全套内，2 个作为明确单列的补充运行。所有旧337入口 SHA 仍不变。
- 构建：build-frozen.log，实际 exit 0。静态双檐完整框实际全三角0相交；抱厦、全局非牌几何、atlas和多视点报告见 release/。

## 无效诊断与边界

早期多并发诊断出现子进程 SIGKILL，部分运行被中止、或 shell 包装器最后 tail 返回0而未可靠保存 node 状态。诊断原始压缩日志和 diagnostic-run-index.json 保留但不作验收依据；不把 SIGKILL 推断为已证实 OOM，也不冒称未捕获的 node 退出码。最终权威运行及两次补充均显式保存实际 node exit。

全部为 CPU 几何/物理与真实材质资源检查，未重试受限 GPU/浏览器路径。R50人物锚点和视线尚待后续联合集成复核。
