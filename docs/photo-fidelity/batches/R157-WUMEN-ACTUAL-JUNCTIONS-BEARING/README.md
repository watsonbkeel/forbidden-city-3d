# R157 午门：整组实际接缝与180柱脚诊断

**有限、未安装开发检查点。诊断实现通过；实体仍未验收。**

源前驱 `1e0a5a8e3284ed7613cfc94b29a5a933a12d246d`。本包新增4个离线QA文件；600个生产/data文件及旧4428个QA文件未变，新QA集合4432。未修改可见几何、碰撞、支承或共享控制器。无World、完整full/batch、build、GPU、实际生产安装声明；整对象新增仍0。

## 已证明与仍失败的事

| 项目 | 实际证据 | 不得据此声称 |
|---|---|---|
| 八对完整三角 | 63,912,112全笛卡尔；63,904,764严格AABB分离；7,348逐对记录 | 不能只凭AABB候选或报告bin批准接头 |
| 窄相 | 1,820穿交、5,403分离、125数值未决 | 穿交含亭body/翼屋面及body/link，非已证无害tuck |
| 主楼—两横连 | 每侧真实最小距离0.1749996304512038m；独立全下界/有理见证 | **接缝仍未闭合**，不改主楼、不填隐藏桥 |
| 同层构造边 | 10层fan/soffit/bracket各40点精确同 | fan是底面，不是walkable或承力梁架 |
| 梁带残差 | 4亭约−7.5101853e−7m；2翼约+1.4305115e−8m | 不把微重叠/微间隙归零 |
| 180实际柱脚 | 52主楼+104外柱+24横连，187实际draw顶面 | 非旧188库存；8未知接口标记不是柱 |
| 完整足迹承托 | **16正缺口，6>1e−8㎡，最大4.557105e−8㎡** | **承托未通过**；1e−8仅历史报告阈值 |
| 射线/脚高 | 2340射线均命中；最大Y残差9.894371e−8m | 中心/顶点射线绿不能覆盖完整足迹缺口 |

84个保留主楼退化三角仍占完整分母；它们与两link各68,208组合是交叉统计，不重复相加。零面积未决、无量纲边界带、两算法原始答复均留存。不能裁切、隐藏或扩大几何以消除这些诊断。

## 测试分母与独审

- 作者最终选定12文件 **130/130**，35.685秒，RSS440820KiB，Node24.22.1、384MBheap。完整status/title Counter精确=原105+Task3新17+承托新8，无删失。
- Astra独跑Task3 **17/17**、3个SHA锁错误实现各1数学红；另以不同算法独核全AABB、稳定交叉/分离及距离下界和精确见证。
- Astra独跑承托 **8/8**；exact Fraction重算16/6，面积最大算术差约1.62e−22㎡；实际源180/187/2340身份及一ULP负控核实。
- 本包docs运输 **4/4** 单列，不能混成原130或独测分母。

正式报告原字节见 `independent/junctions/REVIEW-0030.md` 与 `independent/bearing/REVIEW-0038.md`。原首红、加载/路径错误、SIGKILL及后继真红均保留，见 `HISTORY-AND-LIMITS.md`。

## 完整大证据，不上传超大blob

两份完整原NDJSON共44,106,131B，压缩后按已审49152-byte base64分片模式存为 **25+49=74块**。首轮/最终轮经逐字相同验证后逻辑引用同一份数据；不只保存摘要。`ARCHIVE-PINS.json`固定raw/gzip/Git blob/manifest身份；`evidence-transport.mjs`私有不可变pins调用既有 `readVerifiedChunkedGzip`，原gzip不存在时逐块核验，损坏原件不救援。所有块约≤64KiB文本，没有原22MB/21MB文件进入Git。 兼容通用reader的 `originalGitBlobSHA1` 字段仅表示本轮新生成gzip的Git算法摘要，不声称该gzip曾作为历史对象提交；原证据身份以完整raw字节SHA256为准。

从仓库根验证：
```sh
node --max-old-space-size=384 --test --test-reporter=tap docs/photo-fidelity/batches/R157-WUMEN-ACTUAL-JUNCTIONS-BEARING/evidence-transport.test.mjs
```
程序调用 `readArtifact('entities')` / `readArtifact('pairs')` 返回完整原字节；也支持 `ARCHIVE-PINS.json` 中四个首/终逻辑路径。不存在“从新结果重写旧原件”。`ARCHIVE-RECEIPT.json`记录172个原件身份、物理编码与来源；`EVIDENCE-SHA256.json`仅自排除。

## 后续硬门

先审真实owner/旧支承替换和多slab接收域，不把旧14试块当实际台面。任何可见共享边精度修复须显式列geometry/ordinary/support共同delta；禁止padding或隐形支承消除16缺口。大型接缝、穿交/未决、真实承托、实际CM与完整台面FP、全局新锚点/南墙/马道接口仍未闭合。原10缺史ref/38未执行P1与早期full213红、batch10红继承，不声称完整无历史QA可重现。

远端状态：**本检查点PENDING**。已核前驱备份为 `5cb5fa31387d91d5b08a44b7b8ebc78bc567495d`；主线/main/Pages未改。
