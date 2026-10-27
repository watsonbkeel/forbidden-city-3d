# R115 新增五项历史源合同失败 — 独立因果分诊

2026-10-26 20:16 UTC；候选 `3a6c86a332394463914db947ae7ed98b68b93375`。本报告不把失败改成通过，也不授权改 expected 或新增历史归一化。

原完整运行 1290 = 1114 PASS + 176 FAIL，0 cancel/skip；旧 163 失败名称多重集全部保留、无消失，新增 13。顶层原异常仍为 `zToe` 两次与 `lib.aspect` 两次，无新增顶层异常。原 raw SHA256 `fd6985682705641466b8f009fbdaf0ed56464e7603634016ae5d4621b1a1307b`，完整回读见 `current-state-readback.json`。

## 五条源合同的实际原因
1. `r32-source-retention.test.mjs:123`：QianqingDisplay 的历史 R32 投影预期 6462 字节，而 R112 已批准登记器架实体的当前文件 7685 字节；完整 SHA 从 `1066882fa79171ae478eaa2003fb3b639f6cf73b29d321d2576ee069191a2e95` 变为 `1fd504b8f26f249235c1def87b43f5aadba2901877634cfcd4b7c810cc3a6240`。旧断言继续准确拒绝未知身份。
2. `r34-source-retention.test.mjs:89`：ChuxiuCourtyard 在 R113 已批准布局/室内联动后，从旧 `50f9bedda75da00eaa8d487e64acd46a319f06312e923237bf95f5657d48ee0e` 变为 `2bbbbcbd77d61f829259b3eb0fb977fa0b655a36676402869ab75eee8d051774`，旧 R34 完整身份拒绝。
3. YikunSideAccess 标题对应 line98 的缺失输入断言，实际在枚举到 Chuxiu 时先抛身份错误，未到达故意缺失 Yikun 的回调。Yikun 当前源本身精确等 R110，直接绑定历史身份通过。
4. R34 inventory/dispatch 测试 line102 首句仍先被同一个 Chuxiu 完整身份挡住，未证明新增任意路径或派发放宽。
5. R34 fine asset/config 测试 line133，故意损坏太和配置的诊断同样被更早的 Chuxiu 旧身份拦截；太和配置源与 R110 逐字节一致，不能按测试标题误报模型绑定损坏。

只读独立诊断 `source-contract-diagnostic.mjs` 从 R110 确认完整历史 Chuxiu 字节，仅在测试 helper 的 read 回调中替换这一输入：完整 R34 inventory 随即精确返回原5项；故意缺失 Yikun 能产生原预期 missing 异常；故意改太和配置能产生原预期 config 异常。未修改产品、测试、fixture 或 expected；该反事实只定位三级联原因，不是候选的历史合同 PASS。原测试仍有这五个 FAIL，运行功能由独立的当前源局部门证明，而非本反事实。

另八条 R63 compound24 实路失败由局部审核员独立追因，未在本报告归类成 Environment 夹具、旧债或可忽略；R115 本地门仍等待其结论及后续产物验证。
