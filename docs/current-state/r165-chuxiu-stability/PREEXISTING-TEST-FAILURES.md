# 本轮发现的既有测试失败

`tests/r72-bed-registry.test.mjs` 的“30 beds … all 28 distinct women”仍断言28个普通床位actorId，但R118以来一位储秀宫妃子使用独立共享床认证，不再占普通床位登记，实际普通分配27。

本轮执行得到27≠28。直接从用户main b7ef2a4fa85db0b859cf2d57f2b02779ba2ec153读取 NightBeds、SharedRestSlots、night-beds.json、actors.json、registry和原测试，均与当前字节一致，故非本次改动产生。

没有删除、跳过或降低旧断言。新增 coverage.test 验证27位普通分配＋原共享妃子覆盖全部28位女性，108角色与皇帝/妃子稳定ID保留。旧断言作为历史失败如实列出，不把220项说成全部通过。

前序候选另有两项旧宁寿侧阶快照红，本轮未重跑；其历史记录仍保留。不得把历史诊断或未跑测试计成本轮通过。
