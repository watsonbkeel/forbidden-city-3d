# R96 首显接棒修复独立复核

新三源精确hash见source.sha256/hash-check.log：System902f1b5、Queuea4e3e796、Adapterd100c724。其余几何/家具机制不变。

只读diff确认：成功近处绑定才让出本次advance给Promise发布，下一次仅可抢先一个负优先级coarse资源；旧priorityTurns公平债不重置；pending/error不主动让出；hidden全cancel清handoff；没有额外RAF/微任务工作循环或增大准备预算。d²优先级统一，detail排在显示范围内绑定之后。

独立queue3项通过：第4FIFO债在coarse接棒后立即偿还；24近metadata+24coarse连续情况下oldest远任务不晚于第7次选择，49任务均完成；pending/error/hidden取消与partial finally正确。不是无限长不可抢占generator的等待时间保证，每个生成任务仍须有限且步骤有界。

新hash实际回归：
- task-cancellation：500共享key用户表/部分推进随机交错全过。
- cold-occupancy：真实后妃binding101帧，玩家占其脚位600帧模型照常预热但无实例/身体；第701帧让开，702显示且激活。
- rapid-map-low：真实储秀/养心来回、hidden和开关，1800帧0实例/身体/统计错配、无error。
- S-cold-seat-model：真实Taihe S + 新中和variant，正常往返；新姿态第7模拟帧实际提交，0隐形body、0count错配。

限定功能门可继续集成；这些模拟帧不等于实机秒。

fresh-process正式cold协议已只读审核：同driver分别import两版root，10新node交替5对，初始pool/batch/binding全0，无warmup，固定储秀/北京时间12:48/low/30Hz/600帧；首submittedActor同时核实际mesh count，所有样本和queue事件保留。范围是world已构建后的‘人物cold’，不是完整应用首载。旧同进程配对负结果保留；不能预断JIT是原因，也不能凭单次有利trace下性能结论。正式5对结果由writer随后运行，未写入本报告为已通过。
