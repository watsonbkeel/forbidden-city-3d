# f43b 午门右掖门单叶：累计 World、冻结与终态门禁独立复核

2026-10-31 11:07 UTC，Astra `/root/review_chunked_qa`。本轮只读源码、原日志、冻结和构建产物，并做轻量Counter/摘要/构建入口验证；**没有并发或重跑World**。承接此前已独跑29项组件及单叶图证审核，本报告补累计门禁，不把重复执行的测试相加成新增覆盖。

## 结论

**累计验证有限通过；可保留当前开发候选及完整证据。** 实际World无新installer注入，单叶网格在最终累计场景中的位置与已审组件逐顶点一致；旧物理合同同轮通过。单轮87文件batch526/526、三个基址构建通过。完整current-state仍有210项既有失败，但(status,title)多重集与既有R159基准完全一致，没有新增/消失失败或取消。

这不是“所有测试全绿”、真实GPU/视觉/性能验收、远端恢复验证或部署成功；午门整项完成新增0。此前门洞断面/地坪、缺损摄年、其余门叶、上层/台基和全楼问题不因此关闭。

## 身份与冻结

运行生产身份：`f43b874a44c05247cd5431bac4141bcd1bab5a2b`；树 `/workspace/scratch/02a8023d1a85/r158-arrow-integrate`。本轮无生产变化，唯一新增QA为 `tests/photo-fidelity/batches/wumen-right-leaf-world.test.mjs`：

`5a95ec3590521023e4fe5daadbcab01d094c0ab22c097c2c72a85a3506495d08`

独立核对：

- 原 `R157-WUMEN-RIGHT-LEAF/source-final-1045.json` 的**590个src/data**全部SHA与运行后字节一致。
- `/tmp/wumen-right-cumulative-1049/qa-freeze-1052.json` 的**4255项tests/scripts**，集合精确等于 `git ls-files -z -- tests scripts` 加新consumer；每项SHA全符。不是只检查清单里已有条目，也没有缺文件过滤。
- 首次quoted-path清单漏12个中文路径图片，被明确保留为preliminary/incomplete，不能当正式freeze。正式UTF8/NUL集合包含这些文件。
- full/batch/build终态后再次核590/4255仍全符。
- 两个current-state生成的reports先gzip保留，再逐字还原HEAD；独核现文件=Git blob，gzip解压SHA=generated-output-restoration.json，未混入生产或新基线。

## 新累计World consumer核查

consumer直接调用既有 `buildR52World()`，未传createLibrary安装器、没有import/call `attachWumenRightLeafStuds`，也未向W.scene手加钉帽。该fixture执行真实 `PalaceBuilder.buildAll(PALACE_LAYOUT)`、Environment/Enclosure/Garden/ZoneManager及原CollisionManager；其CPU材质替身和JSON导入适配是既有QA设施，不是GPU环境。

在另一个实际单门组件中取得69帽，展开为**9108三角/27324顶点**，先经cap矩阵到午门局部，再加真实layout origin作为预期世界点。随后遍历新建World，要求：

1. 金帽材质合并mesh唯一；对应architecture记录唯一，69位、r7c8/r8c8缺帽、r9c1未知记录一致。
2. 每个实际顶点经mesh.matrixWorld变换后，与相同索引的组件预期点距离小于`1e-5 m`（10µm）。没有用bbox/数量替代全顶点对照，也没有仅比较metadata。
3. mesh、全部祖先及有效材质可见；隐藏真实mesh必失败，真实首顶点X移0.1m必失败，恢复后重验。
4. raw World为30882碰撞/1365支承。

**预期顶点来自“当前已独审的真实组件”，不是另一个独立源图golden。** 它验证组件→累计World的安装/合并/世界变换，需和此前图片/单叶矩阵/组件源负控一起理解，不能单独证明照片尺寸真实。

新consumer末尾按gold材质筛collider metadata的零计数是辅助断言；不能把它单独解释成完整无新增物理证明。强物理保全来自**同轮未改的 `tests/r159/cumulative-world.test.mjs`**：真实raw30882，认证独立金样的6个交泰新体及其完整row字段，再用既有严格55/武英126合同验证旧30876及其余物理，支承1365不变，并有目标/非目标row漂移负控。路线仍查询原W.cm，没有把比较视图当运行碰撞；乾清72/8记录及6条三宫路线同轮通过。

原 `world.tap` / `world.resource.json` 终态：**2/2，exit0，27.2706秒，maxRSS1659864KiB**。这是写入者真实执行、我只读核终态，不冒称本轮由我重跑。首次`/usr/bin/time`不存在造成的exit127保留，仅为启动错误，没有执行World，不是断言红。

## 完整current-state：独立Counter重算

三条命令沿用既有R159原117文件分片（main115+Qinan1+Zhaode1），没有改旧测试。独立从每份原TAP提取末尾计数及所有顶层(status,title)记录，并与既有R159/be395对应证据逐项比较：

| 分片 | tests / pass / fail | cancelled / skipped |
|---|---:|---:|
| main | 1190 / 981 / 209 | 0 / 0 |
| Qinan stair | 48 / 48 / 0 | 0 / 0 |
| Zhaode | 75 / 74 / 1 | 0 / 0 |
| 合计 | **1313 / 1103 / 210** | **0 / 0** |

完整(status,title)多重集相同，新增记录0、消失0；不是仅失败数相同。main/Zhaode原命令exit1，必须如实保留；不能写“原全套通过”。基准为既有已归档运行证据，本轮没有另开旧checkout全套重跑。

独立复算：`/tmp/wumen-right-cumulative-independent-full-1059.json`。

## Batch：本轮确为单一87文件命令526全绿

独立核本轮文件清单是旧85文件原顺序，加单叶组件test与World consumer两个新文件；共87唯一文件，无删漏/重复。

旧85基准是前次**复合覆盖515项**，不是一条历史全绿命令。我重新读取并核SHA：原84文件513项日志、8个依赖替换重跑及新bounded unit日志，按原placeholder/测试记录替换重建515条成功Counter；结果与写入者baseline Counter相同。

本轮原 `batch-1052.tap` 单命令终态：

- **526 tests / 526 pass / 0 fail / 0 cancel / 0 skip，exit0**。
- 相较旧515复合Counter，恰新增11条：新单叶组件10 + 新World1；删除0，旧状态标题没有迁移或消失。
- 时间377.45395秒，maxRSS1727012KiB；本轮没有用资源中断后补跑并集冒充单轮绿。
- TAP SHA256：`d1aa9c1a0659a4943704b4605b8a7fd1d3961d324d96f016219174ce8d99aa89`。

独立复算件：`/tmp/wumen-right-cumulative-independent-prior-counter-1101.json`、`/tmp/wumen-right-cumulative-independent-batch-1106.json`。新11标题还与当前两个新测试文件的顶层名称逐项相符，不只比较分母526。

## 三基址构建：独立产物核查

三条实际build命令各**568 modules、exit0**。我另执行只读 `verifyBuildSource` 和入口字节核验，未重新构建：

| base | buildId |
|---|---|
| `/gugong/` | `R146-fix-de7e6f9cdfaa` |
| `/forbidden-city-3d/` | `R146-fix-2ddd0c9f5600` |
| `/` | `R146-fix-547dead170db` |

共同runtime sourceFingerprint：

`f584da2138818a79208ab13ef51eef5e763b09c3cbcbd8e7bd87be9f63ffd313`

三份sourceCommit均f43b、sourceDirty=false（**只指runtime/build inputs**；新QA未提交不属于该集合，不伪称当时整树clean）。原release.json仍是R146-fix，此为既有release标签，不为本轮偷改版本号。

独立验证每份build-info/index/JS/CSS摘要、HTML/JS build identity、base路径及资源存在，全部与`build-entry-integrity.json`相符；实际JS入口同时包含新钉帽材质与architecture身份，未只核一个手写版本标签。产物能证明构建身份/路径完整，不能替代浏览器GPU和上线验收。

独立结果：`/tmp/wumen-right-cumulative-independent-build-1106.json`。

## P0–P2与交付边界

- P0/P1：本轮新增consumer/冻结/累计证据未发现新的阻断缺陷。
- P2 表述边界：组件顶点参考≠独立源gold；物理计数/材质筛选≠全row保全；旧85是复合覆盖，本轮87才是单命令绿；current-state210旧红仍在；runtime clean≠QA工作树当时全clean。这些均已向写入者说明，不通过改测试/刷golden遮掩。
- 先前真实单叶hook和69帽15mm视觉/物理边界报告继续有效。此次只扩大到累计World及门禁，未改变原图片接受范围、未给另三片叶/背面新增批准。
- 没有GPU、真实摄影机匹配、完整现场尺寸、远端无历史clone恢复或部署证明。不能将本报告用于宣称“午门全部完成”。

报告时全套/batch/build已终态，重任务槽释放。随后如只提交新增consumer及证据封装，应保持生产590和QA4255冻结身份；最终归档索引/提交由独立只读尾核确认，不把先前运行身份替换成之后的提交哈希。
