# Task2 2347：独立初审（阻断项待后继修订）

对象：HEAD5610、freeze-2347的14路径、source600、QA4428，逐SHA均匹配，600源逐Git HEAD一致。仅新增离线 upper-assembly.mjs/test；无World/FP/CPU/CM新注册。

独立原19测试19/19，exit0，TAP16.340秒。作者36为旧Task1 17+新实体19，不是36新测。六既定SHA负控原TAP各1实际失败已只读核，未与正例合并。

本轮有4项需修，故暂不放行完整实体门：

1. **P1 实际渲染回退**：两横连各6梁，原源码和实际捕获castShadow/receiveShadow全部true，新组件12梁全部false。新box helper调用未传copy；现屋面shadow测试只覆盖200个屋面/28角色对象，不含横连梁。`actual-state-probe.json`逐梁记录。
2. **P1 真实错误清理缺口**：合法公开onResource回调在第一次调用抛出，当前catch正常传播错误但source注册ledger未完成。通过真实B finish截取565个几何/材质/贴图资源，只有1个被回收、564个未回收。私人探针在记录后主动回收剩余项，未残留运行任务。需确保已捕获B的全资源即使在首次回调/早期登记失败也有清理所有权，不把未登记资源从分母剔除。该探针只证明这个确定场景，不泛称任意JS异常都已验。
3. **P1 QA盲区：闭体**：SHA锁定仅将 `upperInstances[0].closedBody.visible=false`，全部原19仍19/19。六body frame合同只核父group，不能代替实际闭合实体/普通围护/梁的完整属性、局部与world位姿、材质与有效执行状态。
4. **P1 QA盲区：接口标记**：独立第二SHA loader仅将首marker.position.x+=3，原19仍19/19。计数8与LineSegments类型不足以认证8个非柱参考身份/位置/几何/可见性。须对Task1每条ID/所属reference/XYZ逐项对应，不把标记重新当实体柱。

两漏检由各自单一修改、完整原19测独立跑得，未改源码或测试，输入SHA均145f31ce…671ba6。原TAP/loader/命令/exit在本目录；这是当前测试的漏检，不冒称修改已落产品或新的实体正确。

## 已有证据可以保留

- 整体组已经不是孤立fan小件：104周边柱+24横连柱、8非柱reference、6闭体、10层172面/trim、28角色、完整U187cells/12slopes与五口/两帽组、保留主楼在同root。
- 原B目标根detached，不在新root中叠层；原A保持独立，不由candidate dispose。A/B实际shared metadata问题经历真红后定向复制，最终前驱完整签名相等；此own-object图检查排除functions/prototypes/listeners，不是JS安全沙箱。
- 主楼/牌匾记录与有效world矩阵、原452注册行/16支承在声明字段范围保持；新root身份/metadata明确变更。原注册数组只是非安装的旧source证据，不代表新形体物理。
- 104柱属性bytes/半径/高程模板保留；10fan与soffit tw逐Float32+worldMatrix边点集合精确。28角色完整index/position/UV与朝向、NE的Y/depth/material/缓冲/2-3-2及两横连84顶点/index/Y等已有针对性测试。
- 实体接头、全新180柱脚承托、跨实例干涉、物理替换/新增、真实台面FP、生产TextureLibrary/finish/GPU仍未验。不能用旧188脚或工程rig路线替代。

作者已获知，2347输入读审结束后仅释放新builder/test有限TDD；原600及其他12输入继续保留。后继结果必须新freeze，保本轮原绿与两个漏检绿，不重写为已通过终态。
