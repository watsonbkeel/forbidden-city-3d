# 万春亭四向内围护：本地候选回执

安全父`ee0f31e1583ebe16dfc743f37cca0ecd6be42327`；分支`feat/wanchun-interior-safe-20261030`。源码运行指纹：
`6d53f6435848000b8b62cb84c51558f5fb9edbfe5a2b91e0659b4b0d2554b23e`。

官方万春亭自身六面全景支持红门上下分区、浅底金棂窗、绿黄龟背槛墙和蓝绿梁枋区域。实做60个现模型朝内面，全部原三角面并集保留，增加4个原创材质/贴图。数字是模型取面数，不是实测门窗叶数。**本次是表面分区候选，不是整亭实景验收；真实藻井、细木/浮雕、门姿及外侧仍未完成。**

## 实测
|检查|结果|
|---|---|
|新定向、异常注入、资源释放、真实合批metadata|最终10/10通过；初版身份、资源与渲染根错误的红日志保留|
|原R47实际全园四向通行|14/14通过；万春与千秋10/60Hz正/倒行及原千秋入口均保留，无rescue|
|完整current-state父本→候选|各1331项：1113通过、218失败、0取消/跳过；失败名称和顺序完全一致，新增/消失0|
|整园实际合批源面/物理/树保留|全部非实例三角形与法线多重集、全部碰撞/步行记录、34树实例矩阵及几何逐哈希一致|
|实际整园CPU提交统计|49→53网格，266216三角不变；新增4贴图基础RGBA8共2097152字节，不等于真实GPU资源/帧率|
|三正式基址内存编译|`/`、`/forbidden-city-3d/`、`/gugong/`全部通过，HTML/JS/build-info绑定同一上述源码指纹|
|同相机CPU实材质复核|原前/后/斜视/顶及四向内视；最终候选4226局部三角、14材质，指纹与三编译相同|

不是全仓全绿。218项旧失败仍是真实失败，不因本次无新增就统称无害；完整失败名及原始stdout留本地，不改老断言/夹具粉饰。最初R64单文件进程失败另保留，未充当通过依据。临时导出残缺导致的0项测试明确不计结果；实际1331对照是后续精确父源码加载hook的完整串行运行。

内存编译不写bundle、不复制public，不是可独立部署包或HTTP验证。CPU图不是浏览器/GPU/手机实测；本次没有重新尝试或绕过已有浏览器限制。新几何为零并不代表原亭高处、屋盖或全部原物理已认证。

## 复现与证据
- `node --test --test-reporter=tap tests/major-pilots/wanchun-interior.test.mjs`
- `node --test --test-reporter=tap --test-concurrency=1 tests/r47-garden-pair.test.mjs`
- current-state父/候选命令见RESUME；`node scripts/major-pilots/wanchun/compare-results.mjs`保存完整失败列表比较。
- `node scripts/major-pilots/wanchun/whole-garden-contract.mjs`
- `node scripts/major-pilots/wanchun/compile-memory.mjs`
- `node scripts/major-pilots/wanchun/export-whole.mjs candidate-final`

日志、JSON、原始红测和CPU图仅在`../wanchun-20261030-evidence/`；官方来源私存在`../source-recon-20261030-wanchun/`。本次提交不含原始reports、截图、官方照片或构建产物。截图是在本地提交前生成，绑定父HEAD加上述完整运行源码指纹；最终checkpoint对应关系另存外置`CHECKPOINT.json`。

## 回滚及下一步
`builder.wanchunInterior=false`完整跳过本次表面适配；原亭/千秋及所有物理不变。源码回滚以保留父commit或新回滚提交进行，不reset/clean旧WIP。main、远端开发线和Pages均未更新。

继续本亭深藻井前必须处理中央及四抱厦坡舌穿插、外鼓/内12窗关系；具体源面依赖、射线证据和最小门见RESUME。全量MASTER范围/分母与对象accepted状态没有缩减或提升。
