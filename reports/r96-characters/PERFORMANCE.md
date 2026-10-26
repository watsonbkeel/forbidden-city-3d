# R96 人物成本：全部样本与方法边界

## 范围
CPU-only实际世界/CharacterSystem/InstancedMesh提交，不是GPU/手机、完整浏览器首载或真实秒数。默认1ms目标与pending .25ms保底未增大；单个JS步骤与GC不能抢占。

## 结果
- 最终 fresh-process 5个完整交替配对：`cold-isolated/summary.json`、`comparison.json`和10个逐帧原始样本；每次新Node、同driver/输入、初始pool/binding/batch=0，world构建后无人物warmup。后妃首显128/122/123/121/117→98/108/113/111/98，所有五对提前10–30模拟帧；实际模型提交与mesh.count逐帧一致。
- 首显工作约8123→6450步骤，准备CPU全部下降；600帧cold p95部分回退、max15.41vs13.56ms如实保留，不选最好一对。
- 原同进程五轮`paired-performance-rejected-first-display.json`显示首显明显回退，触发排序/接棒修复。修后`paired-performance.json`同进程五轮仍有1–32帧回退，全部原样保留；该方法复用模块/缓存，不能将它充作每版本独立cold，也不能反称差异已证实JIT所致。
- `first-model-trace-before/after`及`first-model-work-r95/r96`记录实际阶段/队列事件；确定性RED证明平方距离与米混排序、metadata完成后长任务抢先、第四次公平选择仍可能压住粗模。最小修复不提高预算、不抢占generator，独立公平债/占位/生命周期复验通过。
- 同机位稳定资源14→6共享几何项、860034→205068字节；这是该场景CPU池统计，不是全场景GPU显存保证。

所有慢样本和旧失败保留；运行时停止继续优化，后续R97仅处理剩余成本。

独立逐角色补充：宫女首显中位54→56模拟帧，五对差−4/+4/+8/+3/+1，并非每角色都更快。all600帧p95中位1.161→1.186ms；前300cold帧p95另为1.318→1.356ms，不混用统计范围。
