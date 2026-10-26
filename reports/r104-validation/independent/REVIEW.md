# R104 独立累计审计 — 最终构建待验

当前验证绑定 `2c7beb40da20c31d61107497ea165c5ce6ccd76f`，基底 R103 `4189623a9ec29f1b58bcb0c00c1b3e177b9517d3`。旧 03af 候选及其新增高处全困/门叶埋入失败另存 REVIEW-03af-BLOCKED.md，未抹除。

## 最新累计门
新运行完整重跑184：R89 47、R90 11、R92 116、R93 10，全部通过，失败/取消/跳过0，前后 tracked clean。详见 cumulative-readback.json / cumulative-final-run.log；不能把旧03af结果混绑后继。

运行差异精确7路径：ningshou.json、ZoneBase、XiqingGate、FurnitureMotion、Collision、XiqingRoofSurface、XiqingRoofExact；其余src/data/main精确R103，详见runtime-retention.json。Furniture算法新增显式门域/roof组合，最后同步prefix memo只在surface垂直求解内存重复binary64静态查询，不缓存动态parts/边界。新物理合同由局部独审承担，不以既有区域184冒充局部完整证明。

## 独立局部门与保留限制
`r104-gates-independent/REVIEW.md` 最终绑定2c7beb40：实际生产3×1008三角源逐点对应合批Float32，每屋988正面/20严格零面积；d969 144下降、24竖檐恢复、18檐下撞顶及地面18路线，无新增穿面/全困。最后memo按225组完整返回与2×720帧逐值等价复用，不谎称所有矩阵在新hash重新执行。

真实竖檐口一个压力点16/144不grounded/不能原地跳，10/30/60每组5/8方向可退出、随后grounded且能再跳；root明确接受，不制造隐藏edge floor。18m系清晰压力初态，不是已证明普通游玩可到达屋顶。3处旧墙告警从合法同状态重播4帧精确R103，不凭“旧”直接忽略。

严重旧perch尾CPU p95约37–43ms/max77ms已保留；去重后p95约5–6.54ms/max13.72ms，不能以中心<2ms冒充全面性能改善。最终门组build+finish+dispose中位2.964→14.144ms，不含邻墙/完整世界；低档同样生成。公开应区分最终成本与旧1eac无roof +5.916672ms样本。GPU/手机未验。

## 主线保留及下一门
fresh main 11:08UTC仍96f658fd；额外报告blob d60303b28ec4df0f69508cd501573c71d176ceef。17历史README行/作者/快速开始/双llms一致通过。未写产品/main/Pages。

待166固定fixture自身HEAD预检、原1290失败完整多重集、三base137HTTP、139目录包、最终buildSource/runtime/freeze身份及尾文档复读。当前不是最终上传许可。
