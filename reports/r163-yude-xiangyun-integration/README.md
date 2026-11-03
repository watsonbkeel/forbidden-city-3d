# 浴德殿＋香云亭累计集成验证

输入累计树r163-tiren-plaque-0333，运行源daead95366f04d466a96b4b6402b4d2f6a22387a，基于cf80d1677a385602333631849ad247d0b3cc4392。本次仅新增累计测试和证据，不改产品、不上传、不改main。两项原fixture、原失败、CPU图、构建及HTTP证据保持原路径和字节，不以累计结果覆盖。74个原始证据/测试与当前产品文件的blob和SHA256见original-evidence-integrity.json。

## 累计结果

- 组件/hook：11/11。冲突后的ZoneBase保留两个import、两个实际调用各一次，以及旧凝晖/崇敬/风雅存/高云情hook，调用发生于真实合批前。
- 新累计基线：从干净cf80的r163-ninghui-1023只读构建同一完整静态CPU World＋outer-west/west-six/garden，固定原顺序；确认没有两项新身份。SHA256 f2ab14018cfae7018f8922d7fd17fe90db7570cd61564cde615cf731436af2ef。旧碰撞/可走顶/记录等流及两区原屋顶分别与两候选原fixture交叉相等。
- 仅省略两项私有材质、实际owners/tops/建筑记录，以及明确变化的两处远屋顶；累计World与干净cf80严格比较，其余1006 mesh、84实例、19720旧owners、1365旧顶，以及几何属性/索引/矩阵/材质字段、地图、房间、区域和建筑记录完全一致。远屋顶另验精确三角多重集：west-six为21552旧＋756浴德＝22308；outer-west为59900旧＋6668香云＝66568。
- 两项同时出现且身份各一次：浴德11合批mesh/2816三角/117owners/3真实石顶；香云7合批mesh/10324三角/172owners/17真实石顶，无新旧实体正体积交叠，二者亦互不相交。
- 仅一次累计正常World，74.2秒通过，84条正路线、28条闭门/侧墙负例。包括浴德实阶/浅沿/原中院和墙侧绕行、崇敬旁路、原重华中殿真实入口往返8组合；香云四向小阶/浅台、宝华z388完整环路/六阶、z406横向及相邻来源视点连接。
- 原中殿入口依旧可走入.75米旧室内地面；30fps每组合1帧、60fps每组合2帧历史接触与独立原基线逐帧及owner盒一致，不称零接触。其余新增/邻路按原断言native接触0。未改变控制器或既有碰撞。
- 范围外负控：旧顶点1mm、旧owner盒1mm、额外地图行均能触发旧范围不相等；三项临时变更全部恢复后再次核对基线，然后才跑路线。

## 干净累计包

唯一新包：/workspace/scratch/02a8023d1a85/r163-yude-xiangyun-daead953-clean-1120。

- 显式统一VITE_BASE=/gugong/，sourceDirty=false，源daead953，不混用单项base=/和base=/gugong/的dist。
- 742模块，8.18秒构建成功，保留大包警告及npm环境提示。
- BuildId R163-bacb14d67efa；sourceFingerprint 026e713b918366bc69792c8b7ea1b811be43782ef40b14326f41327edbff4c09。
- HTML/JS/元数据及当前运行源指纹校验一致，两项FC身份存在于同一编译入口。
- 本地HTTP以/gugong/实际路径逐137文件核对SHA256、长度、MIME，共44,391,054bytes；根200、缺文件404。不是远端发布或GPU执行结果。

## 保留边界

累计新增验证没有失败/重试；原候选的RED、短时脚高滞后断言失败、材质释放失败和CPU proof脚本错误原样保留。所有本轮原始日志留本地，提交无损gzip与SHA清单。未运行全套历史测试，既存Tiren/Hongyi失败和B-principal基线差异没有被改写或宣称已修复。

原单项各5张CPU图保留原产品来源及hash，未冒称累计GPU图；两项组件源码未变、累计旧场景流严格保留。浴德仍是文字/平面和同类风格拟合，无具名全立面、无抑斋内景；香云未做室内/当前金塔库存。坐标/尺寸/隐面和简化构件为工程拟合，两项均不声称现实开放或整项完成。

GPU/browser/PBR、移动端、全区流式、全部历史套测、远端HTTP/Pages和现实开放未验。证据提交后不再启动重型任务，资源窗口已释放。

## 复现

在干净cf80单独树可用时，仅先读一次新累计基线：

```
TMPDIR=/workspace/scratch/02a8023d1a85 NODE_OPTIONS=--max-old-space-size=3072 node tests/r163-yude-xiangyun-integration/capture-baseline.mjs ../r163-ninghui-1023
```

已固定fixture无需反复重捕。主验证均串行：

```
node --test --test-concurrency=1 tests/r163-yude-west.test.mjs tests/r163-xiangyun.test.mjs tests/r163-yude-xiangyun-integration/hooks.test.mjs
TMPDIR=/workspace/scratch/02a8023d1a85 NODE_OPTIONS=--max-old-space-size=3072 node --test --test-concurrency=1 tests/r163-yude-xiangyun-integration/normal.test.mjs
TMPDIR=/workspace/scratch/02a8023d1a85 VITE_BASE=/gugong/ npm run build -- --outDir <全新累计输出目录>
node tests/r163-yude-xiangyun-integration/http-verify.mjs /workspace/scratch/02a8023d1a85/r163-yude-xiangyun-daead953-clean-1120
```

HTTP验证器固定本次运行源daead953和base；新构建若是仅证据提交后的新HEAD，应另保留本包记录而非覆盖。构建源检查使用scripts/build-identity.mjs的verifyBuildSource，不能仅看提交号相近。
