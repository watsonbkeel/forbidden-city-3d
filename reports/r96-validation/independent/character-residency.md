# R96 人物驻留独立功能审查

审查 checkpoint `bc0b8b02bb9cfc7e8be005eca5376c4636551b02` 的六个人物文件；精确 SHA256 在 source.sha256，逐项等同 writer checkpoint-source.sha256。只读产品源，测试在本目录。

## 限定判定
此人物驻留子模块已测功能可继续集成，未发现新增硬阻断。不是整个R96发布/性能门，尤其尚不涉及皇帝新太和↔中和行为。家具另有独立报告。

## 独立证据
- world-lifecycle-30：实际完整B world，2400模拟帧，储秀冷启动→走近→夜间→皇帝附近→高画质→关闭/开启。108逻辑对象均取得binding；0缺资源同步acquire；每帧统计visible等于真实InstancedMesh.count，附近已激活动态体均有实际提交模型，0差异/系统错误。11个批次geometry各dispose恰好一次，结束pool/root/dynamic全清。首maid249/后妃253帧仅本次CPU功能运行，不能换算为实机秒，未做正式配对性能结论。
- rapid-map-low：真实Teleport冷入口，储秀→养心→储秀，hidden恢复和开关，1800帧实际模型/近身体一致、无错误。结束78逻辑binding，30未激活区域pending，与loadAll:false语义相符；不谎称全部世界都已加载。后妃实际模型第370帧出现。
- cold-occupancy：完整真实world后妃binding第106帧出现时尚无模型，玩家站其真实脚位连续600帧。驻留模型正常预热，但0模型提交/0动态身体；玩家离开后下一帧707正常显示且激活身体。没有用逻辑对象代替实例证明。
- lease-sequence.test：500确定性随机显隐/姿态/LOD/区域组合，逐次检查全部批次引用守恒、零count隐藏、共享resource引用计数正确、所有已观察GPU几何clone只dispose一次。边界测试覆盖精确40/45/60/70及±1e-8，飞机→地面模式切换和XZ不受相机高度影响。
- task-cancellation.test：500随机完整用户表/遍历顺序/部分generator推进交错；仍有用户的共享key保持同一job，失去用户的key取消，不取消逻辑job，无陈旧完成；已启动任务均完整完成或finally释放。这里geometry生成是明确的小型假generator，测试的是生产System/Queue所有权协议，不冒充真实建模性能。
- 首次取消测试自造100000步不结束的非抢占逻辑job堵住后续工作，导致“至少10次partial cancel”覆盖计数不足；保留 fixture-starvation.tap。改为有限逻辑job后测试通过；这不是产品失败，也不是通过删断言隐藏错误。
- pose-fallback：4个精确姿态/seat/walking隔离反例继续通过；睡姿不能替站姿、folded不替walking、标准seat不替夜间低足seat，同pose/seat的粗LOD可暂显。

## 静态核查
main getViewState 在 flight.occupied 时读 FlightTour.position，该getter返回state.position，不用尾随相机中心。地面读camera XZ。UI模型与逻辑统计分开。资源池仍保留有上限的零引用CPU缓存（63项上限），离场释放的是活动批次与引用；不能宣传为所有CPU模型立即销毁。

## 分工及边界
writer另做S真实GLB加载/卸载、100m高飞机XZ合成轨迹和下机昼夜，记录在其 s-flight-functional.json；不是本审查者独立完整FlightState驾驶测试，也不是GPU实机。我的B集成与小单元不替代该限制。浏览器/GPU/手机、最终性能和新增皇帝路线尚待最终集成验收。
