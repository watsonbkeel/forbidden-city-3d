# R96 人物模型驻留小组（未最终验收）
源SHA见checkpoint-source.sha256；家具基于33e7865独检功能门，人物另审。
- 地面显示40入45出、预备60入驻留70出；飞行以飞机真实XZ显示120入140出/预备180/驻留220。工程窗口不冒称实机秒数保证。
- 108逻辑角色/作息/位置继续，逻辑seat metrics纯读取；模型按当前真实sample与当前pose/seat/femalePose/LOD key准备，共享用户表完整后才取消无用户render任务。
- Renderer实际提交仍是唯一近4m动态体依据。可保留当前粗模型的闲置batch count=0；离驻留域或身份改变释放其GPU克隆引用，不删除其他zone仍使用的共享CPU模板。
- portable R95模型合同fixture由scripts/r96-characters/generate-contact-fixture.mjs生成，全部旧template/pose/seat/LOD的属性hash、index、userdata精确保留。
- fake world语义对照（不是实际宫城证据）：正确完整108逻辑registry远处绑定，R95自动生成12模型而候选0；新相机进入激活真实batch、missing-resource同步acquire=0、远离释放batch且逻辑binding身份/时钟保留。最初2角色fixture被registry正确拒绝，其原始日志保留但不当有效功能RED；有效旧版RED见distant-model-baseline-red.tap。
- 自身16项功能通过（最后新增teleport组），R95十项首显/实际提交合同仍通过。UI22项中21过，旧r51夜间文案1失败在R95原样复现；不改旧expected抹红。
- 待：实际完整world/B/S/飞行/占位恢复独检与生命周期、正式CPU/驻留成本、皇帝中和模块、最终累计回归/构建。GPU/手机无证据仍NOT_RUN。
