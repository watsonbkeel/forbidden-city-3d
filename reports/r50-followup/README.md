# R50 人物准备与女性样例后继候选

## 状态与范围

本候选从已交付但未启用的 R50 分离，保留原版本回滚。不是人物首版完整验收，不部署 Pages，不合并 main 或独立牌匾修正。生产 CHARACTER_ROLLOUT_APPROVED 仍为 false；38 个 required 逻辑人物仍在配置与诊断中，没有为隐藏失败删配额。

用户已于 2026-10-22 03:58:03 UTC 确认此前男性三姿与修正宝座坐姿的简化写实方向。女性 candidate-05 的实际模型图于 04:28:42 UTC、炕坐/动作于 04:34:25 UTC 提供，尚未收到该项明确确认。历史资料的具体限制独立保留，不能用风格认可替代史实结论。

## 实际改动

- 初次模板生成、真实三角支承、座面/整鞋接触、连续路径及碰撞查询变为可恢复小步工作，唯一入口是既有 CharacterSystem.update。没有新增 RAF、每人定时器或复制全世界的 worker。
- 同一个实际姿态/座位变体的三个 LOD 都准备好后才提交 binding，禁止半成品资源出现和转镜时同步冷生成。第一模板的成本计入总 NPC 更新。
- 队列每步前读真实时钟，并有有限工作量；取消、世界/人物代次校验和提交前支承快照复核避免旧结果变绿。完成态缓存会检查真实 owner、祖先、几何/材质及局部碰撞/路线转弯范围。
- 同一同步 Manager 遍历共享只读快照，finally 在队列推进前清除，绝不跨 update 复用。
- 就绪后 0.35 秒屏门淡入，仍受主角优先、日夜与关闭门禁控制；LOD/画质切换不会重新淡出。HUD 只读展示 ready/pending/error，不重置全局 renderer.info。
- 后妃与宫女修改了袍袖/门襟、发式轮廓、自然个体面形与身份纹样，保留 1.70 m 校准和全部支承尺度。90 组男性几何与冻结版字节相同，36 组女性有独立候选基线；未篡改旧性能重构基线。

## 冷准备 CPU 实测与代价

环境为云端 Linux x64、Node v24.19.0、AMD EPYC 9V74；不是用户设备或移动真机。实际保留世界有 23253 个碰撞记录、1075 个 walkable。高/低档共用 1 ms 总 NPC update 协作目标；真实 nominal 16.667 ms timer 分开调用，而非把紧循环除以 60 冒充等待时间。

| 最终主要运行 | 皇帝首次 ready | 全部 38 ready | NPC update p95 | 最大 update | 累计 update 墙时 |
|---|---:|---:|---:|---:|---:|
| 高档 cold | 1.048 s | 7.920 s | 1.236 ms | 4.595 ms | 524.818 ms |
| 低档 cold | 0.995 s | 8.445 s | 1.242 ms | 16.121 ms | 574.966 ms |
| 高档显式世界重绑定 | 0.374 s | 4.699 s | 1.100 ms | 1.298 ms | 301.314 ms |
| 低档显式世界重绑定 | 0.504 s | 5.296 s | 1.138 ms | 4.613 ms | 347.957 ms |

两档缓存开关重开约 35 ms 全部 ready，仍重新执行就绪淡入。ready 不是已完全显现；首次可见在下一次提交，完全显现再需约 0.35 秒。

原同步版本留存冷准备约 262–443 ms 的单次停顿；新方案拆分工作，不等于减少总 CPU。上述累计更新约 525–575 ms，另外 process CPU 还包括剖析检查、GC 等。更小的低档 0.6 ms 预算实测使完整等待增长到 25.6 s，已拒绝该默认值；对应原始数据保留。不能只报 p95 隐藏总等待或最大值。

16.121 ms 尾部发生在一次 collider-cell 步，单步 15.085 ms。随后使用额外 Node GC observer / process CPU 采样的诊断运行未复现该尾部，cold 最大 4.129 ms、p95 1.383 ms、全 ready 10.535 s；两个 >4 ms 样本无 GC 事件重叠。仪表不同、就绪也有波动，不能把复测最好值替换主运行，更不能据此认定原尾部是 GC 或已消失。此方案提供确定工作量与真实时间检查，不提供硬性 1 ms 墙时保证。

所有数字均为 CPU 的完整 NPC update（含准备和提交），不是 WebGL render、完整应用帧时、FPS、GPU draw-call A/B 或手机性能。文档要求的每路线 30 s 预热 + 60 s ×3 GPU/整帧 A/B 仍未获得合规设备证据，不能标通过。

## 正确性与回归

- 本轮完整人物定向 158/158 通过；Vite build 通过，保留既有大包警告。此数字不是全仓库测试结果。
- 冻结建筑/zone/Collision/InteriorLoader 等 182 项源文件哈希保持不变。
- 独立工作边界/缓存复核 29/29，通过连同既有轻量测试的 53/53。覆盖场景移除、隐藏、祖先移动/旋转/缩放、geometry 替换、中途提交窗口、异常恢复、同帧共享与跨帧失效。
- 实际世界增量回归 27/27，含真实太和 B/S 替换 20 轮、人物开关 20 轮、后台恢复无 30 秒追赶、唯一 ID/实例与资源引用检查。
- 冻结同步 / 新同步 / 新分帧的 38 人真实绑定与 148 个路径采样值无差异；796 个实际三角 owner / normal / material side / group / drawRange 独立检查。绑定阶段各 954 次支承查询；额外 public path 查询后旧 954、新同步 1714、新分帧 1714，保留该缓存键/查询成本差异。
- R49 定向覆盖本轮 183/183 通过，分两次留证：首轮 126 项通过，但 inherited-world-body 在人为 384 MiB Node heap 上限触顶而未注册 57 项；按该既有测试已验证的系统默认 heap、单进程仅补跑此文件，57/57 通过（15.89 s）。OOM 原日志保留；没有改测试或生产，也不将 OOM 当作断言失败或首次就全过。
- 既有完整老测试库基线为 5277 项、5119 pass、158 fail；旧 R50 同口径失败身份完全一致。此后继未重跑那套全库，不把既有红说成全绿。

## 缓存与视觉边界

常规 Three.js attribute/version、owner/祖先 transform/visibility 变化及现有碰撞集合 append/remove-by-tag/replacement 已覆盖。直接原地改数组数据却不更新 attribute.version，或原地改现有 collider/walkable box 却不更新集合，调用者须显式 world.invalidate()。不修改冻结建筑与碰撞接口去掩盖这一约定。

女性历史依据仅限故宫博物院官方《月曼清游图》（1738）和《古铜色百蝶纹织金缎绵袍》（1750）中可支持的部分。前者有理想化绘画传统，不能当作每名人物的真实宫女服制名册；后者为后妃常服，不能直接证明所有燕居/宫女服饰。低髻具体结构与宫女服制仍有演绎，未冒称史料逐项通过。官方原始图像/PDF只作研究，不再分发。

readiness-visual-v1 是真实模型和哈希核验宝座缓存的 CPU 逐像素 4×4 discard 参考，无人物阴影；不是 GPU 截图、真实加载全过程或历史复原证明。女性 candidate-05 与旧 C1 原图不得覆盖。样例字节更新说明见 sample-revision-note.md。

## 复现入口

- node --max-old-space-size=384 --test --test-concurrency=1 tests/p3c-*.test.mjs
- npm run build
- P3C_PROFILE_REALTIME=1 P3C_PROFILE_QUALITY=high node --max-old-space-size=384 scripts/p3c-profile-incremental.mjs <new-output.json>
- 上述 quality 改 low；诊断另加 P3C_PROFILE_DIAGNOSTICS=1，保留独立文件与仪表差异。
- 实际世界旧/新 oracle 脚本引用本地冻结 R50 worktree，须先备好该独立版本，不能以当前副本假装旧实现。

此轮未改 package.json 或 lock。原 R50 唯一新增 QA 依赖 @napi-rs/canvas@0.1.100 继续保留为 devDependency，生产不捆绑 canvas；未增加其他依赖。

发布包中的原始 .tap/.log 日志以无损 .gz 保存，原始字节不修饰。publication-evidence-manifest.json 列出原始/压缩路径及哈希；用 gzip -dc <file.tap.gz> 查看。女性大体积动画逐帧中间数组、初期样例及馆方研究原图不发布，但交付的 candidate-05 图片本身保持原字节。

## 证据运输包装修订（独立于生产实现）

原 314751a381bdbf159a3dd5bdb3c92fcbe7240700 和其工作树保持不变。本包装不是原文件在仓库内存储字节不变：两份自动测试 oracle 改为 gzip 二进制分片容器，每片不超过 120000 bytes，索引记录顺序、每片 SHA256、完整 gzip SHA256、原 JSON SHA256 和原 Git blob 身份。测试仅把入口改为校验分片→concat→gunzip→JSON.parse，126 组原基线、36 组女性候选及其全部断言不改，也没有重新生成 oracle。

- kit-preparation-baseline.json.gz.index.json：25 片，共 2,923,523 bytes（原 4,155,008）。
- female-refinement-baseline.json.gz.index.json：8 片，共 865,560 bytes（原 1,216,649）。
- 冷计时、早期计时、world-incremental-review 与 low-tail-diagnostic 的原 JSON 无损归档为同名 .json.gz。历史报告中的原文件 SHA 仍指解压后的原字节，不是压缩容器。
- 2,055,858 bytes 的 readiness-source 展开三角中间文件不再发布；保留真实图片、来源与逐像素校验。可从冻结几何与原宝座缓存重导出，createdAt 会变化，不冒称重生文件等于历史原字节。全部 candidate-05 文件保持不变。

校验：node scripts/p3c-verify-report-packaging.mjs --verify。若本地有原 314751 Git 对象，再加 --compare-source-commit，会逐字节对照原 blob。恢复：node scripts/p3c-verify-report-packaging.mjs --restore-dir /tmp/r50-restored-originals（目标目录必须尚不存在，不覆盖任何文件）。默认校验与测试不依赖未上传的本地 commit，只用已保存的原 SHA256 / Git blob 身份。

包装专项：node --test scripts/p3c-verify-report-packaging.test.mjs；包含缺片、错序、损坏、错误原 SHA、路径越界、恢复拒绝覆盖与防误重生。旧一次性捕获脚本不是重建验收 oracle 的入口，现有 .gz / .index.json 同样触发拒绝。详细映射见 report-packaging-manifest.json。原始缺文件红日志与修改后的全人物回归分开留证，不能把存储改动说成没有改测试文件。

截至 05:13 UTC 用户已提供新女性美术参考并要求重出，因此本包 candidate-05 仅保留为未批准的历史样例，不能视为待默认批准或最终女性外观。参考驱动的新模型在独立树开发，不包含在本次仅存储包装里。
