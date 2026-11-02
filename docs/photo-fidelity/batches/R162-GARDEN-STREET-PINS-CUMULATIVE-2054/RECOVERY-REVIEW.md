# R162 四门门簪正常累计独立只读复审

审查时间：2026-11-02 UTC。base `edc2de78ed62e82efd47555ef607c1a1071c8551`，HEAD `b831afc4c1f9efc3f1d954dd17f8f9b0eeed937a`。主工作树未修改，未上传、未部署。

## 结论
可作为当前窄范围的开发分支封存；不代表整门、R162 整版、GPU、手机或全流式验收。远端回读与 CI 由集成者独立完成后再声称。

- Critical：无。
- Important：无。
- Minor（不阻断）：累计 World 测试依赖未入库的绝对 `/tmp/garden-street-pins-cumulative-2045/baseline-with-near-starts.json.gz`，并固定覆写同目录 `world.json.gz`。当前会话可复现且证据诚实注明 raw 仅本地 hash 索引；但新 checkout 无法直接重跑。后续维护建议允许显式 baseline/output 参数或随档案保存可重建基线步骤，不须为此修改产品或撤销本次局部成果。

## 独立执行证据
- `node --test tests/r162-garden-street-pins/component.test.mjs tests/r162-garden-street-pins-cumulative-2045/world.test.mjs`：退出 0；30 tests / 30 pass / 0 fail / 0 skip。日志 `/tmp/r162-independent-tests.log`。
- `git diff --check edc2de78ed62e82efd47555ef607c1a1071c8551 HEAD`：退出 0，无输出。
- 扫描 `applyGardenStreetGatePins`：生产只有模块定义、ZoneBase 的唯一 import 与唯一 call。
- EVIDENCE.json 全索引核对：194 个可见文件的 bytes/SHA256 全相同；另 3 个历史文件因 sparse checkout 未落地，通过 `git show HEAD:<path>` 核对 bytes/SHA256 全相同。
- 本次 World 测试重写了其固定输出，但 `world.json.gz` SHA256 仍为 `de564fcedfe9a10b625f34684ce275c2d57d06b6ab48cc04f67450b5ba62933a`，与原 EVIDENCE 完全一致；未改变原证据字节。

## 审查观察
1. 四个 zone/index/kind/name/x/z/rot 精确元组之外无操作；匹配项的非默认尺寸提前拒绝。独立重复、冻结宿主/数组、变换/矩阵、几何/UV/normal/index/material 篡改测试全部通过；参考 gate 使用独立 material cache、共享纹理句柄但不 dispose 共享库。
2. 每门新增 4 个 pin group、8 个闭合实体 mesh、2 个私有材质；原 gate/roof/plaque 都保留。正常 finish 后四条唯一内部记录、16 簪、8 合并 mesh、1,088 三角。正常 finish/dispose 与 finish 前 dispose 测试确认私有资源各处置一次，不伤共享库。
3. 实际正常 World 对比基线：原 756 mesh 的记录流、24,019 colliders、1,298 walkables、maps/rooms/旧 architecture 完全一致；12 条完整行走报告保持一致。8 条原生 clear 起点往返成功，4 条原有墙内非法远起点明确保留为失败诊断，无洗绿。
4. 琼苑 local +Z 明示照片语境推断；长康摄向 UNKNOWN，local -Z 仅工程迁用、不宣称南北。六棱形、全部尺寸/色彩为 fit；内两簪 ±0.07 m 微调保持旧匾并留 0.01 m 净隙，符合用户低于 0.3 m、不妨通行的授权。未增加未知背面或新通用整门。
5. 实际查看 26-before 与四个 after CPU 图片：每门四枚红面金边实体均可见；长康原牌匾仍在，琼苑选定侧不凭空加匾。图片明确标注 fallback CPU/not GPU，不把工程图当现场照片或纹理验收。
6. 生产改动仅专用模块与两行 hook；未修改 UI，metadata 留在内部 architecture，原正式门名不变。作者 README 的 no-hook 属作者阶段，累计 README 已明确解释现阶段 hook，未夸大验收。没有发现需退回重做的证据矛盾。

限制：本复审未重新访问在线图录、未重新核定所有原始照片的历史拍摄方位，未独立重跑邻香亭或生产构建；这些不应冒称本次独立复审结果。当前本体功能与累计保全判定依据上述实际 30 项、源码与证据 hash 核对。
