# R375 三佛独立资源清理异常恢复

基于已上传 R374 `f31f02dff48a2cf03d30897e7da258515d6cfc16`，其托管全区结果0错误、28警告。R375尚未冻结、上传或托管复验。

## 问题与最小改动

真实 OriginalBuddhaRelief 返回的dispose先标记disposed，随后顺序释放geometry/materials/自有texture。geometry或某material的dispose监听器抛错时，剩余资源不会尝试清理，第二次调用又因disposed直接退出。真实central/side工厂共用该材料数组（各6材质），同样受影响。

本次仅改该处：仍先标记disposed保护重入；每项独立尝试清理；结束后以AggregateError保留原错误对象及顺序。拥有纹理时才尝试纹理dispose；借用纹理不清理。central/side wrapper仍在上层清理失败后尝试自有纹理并保留幂等/所有权；将内层错误对象和纹理错误按顺序合并，避免原finally覆盖早期错误。二次dispose不重试，不保证某个抛错监听器内部已完成释放；保证其他独立资源仍被尝试。

不改几何、贴图、loader、网络取消逻辑或默认OFF。CPU故障注入证明清理调用继续，不是GPU显存泄漏测量，也不是ERR_ABORTED根因或修复证据。

## 版本说明

README删除过时待上传头段，区分R374 QA证据与main R373 release身份；本分支release.json保留已核main的R373，不冒称线上R375。历史文档不删除。main合并由用户自行完成。

本地验证：新增真实工厂合同15/15，受影响的旧三佛构造/loader/所有权/卸载回归112/112。保留两轮红测：原实现7处失败、wrapper多故障2处失败。每次受控Node heap384MiB（非RSS硬限）；没有本地全世界或实际GPU测试。待独立复审及本提交托管全区复验，不把R374全绿继承为R375全绿。
