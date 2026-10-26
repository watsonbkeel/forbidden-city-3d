# R105 累计输入与证据复用独审

审查时间：2026-10-26 13:29 UTC。候选：35f5c008b1134231b73d39437b4973884bb6f7ee；基底：R104 7d878e42b2e53212aa7befb33a731ecda45bedac。

## 结论

限定输入保留与文档证据复用门通过，无新增功能硬阻断。不是最终构建、累计全套、远端上传或实机验收放行；这些由相应审计另核。本轮未重复旧物理大矩阵或正式成本测量。

## 实际核验

- 从基底 git ls-tree 独立枚举 src/data/main.js，共404文件，与候选冻结fixture路径集合严格相等。
- 逐项取基底git blob、当前磁盘字节及fixture bytes/SHA256三方比较，404/404精确匹配；不是只相信fixture自证。
- package.json/package-lock.json/vite.config.js/index.html相对基底无差异。公开身份/release/摘要及验证脚本、文档有预期变化，不宣称整个发布树相同。
- 读回本轮日志 interaction.tap 41/41、characters-emperor.tap 23/23、retention.tap 2/2；这是日志独立读取，不冒称由本审重新执行。
- tracked源码无未提交改动；仅node_modules未跟踪环境项，不纳入产品证据。

## 证据与口径

VALIDATION.md正确区分段内真实控制器CONTINUOUS、段起TELEPORT_SETUP、18m人工压力、模拟DOM以及人物作息；不称全宫一条连续玩家旅行。R104最终7源码与其225返回/1440帧memo等价链完整保留，因此既有144下降矩阵可复用而不必重跑。R96家具、R99路径、R100栏边、R103门路均保留限定旧问题，不把精确输入复用改写成修复所有缺陷。

微小澄清建议已告writer：16未grounded属于144压力矩阵中同一点10/60Hz×8向；10/30/60各5/8可退出属于另24退出恢复矩阵，两个计数不混称。

既有竖檐上沿airborne/vy0但可普通横移、落稳后再跳；旧域外墙/窄栏短暂穿入、Garden约+182ms、R104残余perch p95最高6.535408ms/max13.722394ms、GPU/手机/候选Node20未验继续公开。R97/R98未交付运行优化/形体不应通过R105编号变成完成。

本checkpoint的184/原current-state/三base/包/远端尚待，不根据本轻量门提前声称最终PASS。remote pending身份等待实际读回，不能写成本审验证过的远端结果。
