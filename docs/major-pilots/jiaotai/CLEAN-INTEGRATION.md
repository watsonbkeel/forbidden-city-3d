# 交泰整包：干净累计线整合

2026-10-28 17:58 UTC冻结。

- 基线：已验累计 `316666959c91e774991c379369bd60cfa573bdd0`，非旧R32/独立R146热修树。
- 实验现场保留于 `r127-r136-cumulative`，不重置、不合入其实验物理/古华/体和候选。
- 干净开发分支：`feat/whole-scope-jiaotai-20261028`。仅4个运行源文件：RoofBuilder、SquareHalls、JiaotaiCrownCandidate、JiaotaiFrontTerminalCandidate；其它src/data/public既有blob与基线逐一相同。
- 新增冠部依赖Three.js，新增端兽依赖Three.js及基线已有HallWalkingBeasts.js，使用原屋顶生成/合批；没有加入通用碰撞、地面、MergeUtils或NPC变更。精确blob/SHA见 `reports/major-pilots/jiaotai-clean/SOURCE-WHITELIST.json`。
- R146-fix Environment、EnvironmentVisualOwnership、SharedRestNavigation与独立e3efba2b逐字节相同。

## 本目录实际结果
- `focused.tap`：17/17。真正默认激活，canonical输入保护、其它亭默认零差异、四脊/后角、原室内/四门/东西侧阶/西低屋绕行、原碰撞/行走表全保。
- `r146-environment-roundtrip.tap`：2/2。真实随相机天空/远景+太和S内景；10/30/60Hz每程714/2139/4277帧，21:00西北床同睡、06:00回原座；真实建筑/地面源篡改仍拒。
- `canonical-default-boundary.tap`：26/26（17目标+9既有方殿），默认激活严格限原位(0,354.1)、19×19及屋顶基高8.36；搬移旧测试夹具保持旧行为，显式错误覆盖仍拒。
- `current-state.tap`：首轮1313项/1089通过/224失败，不是可比结论：并行3模块SIGKILL、稀疏研究补丁/目录及符号链接限制造成环境失真，另5项真默认范围过宽已修。已恢复基线真实文档/补丁目录（不再用文档symlink）。单并发`current-state-serial.tap`结果1331项/1115通过/216失败：215同名旧失败；新增1个旧R58补丁上下文模块失败（顶层await的Hookup context changed），替代原同名rehearsal旧失败及其后1个通过用例，故不是无新增失败或全绿。未注册的legacy-layer用例另单独直接通过，未据此伪改整套计数。基线原标准1332项、1116通过、216失败；必须比较失败名而非只减计数。缺研究源文件的既有失败不表示产品损坏，也不抹除。
- `r146-daytime-submission.log`：2人物×低/高4例真实实例提交，12条人物前方建筑CPU射线通过；高档随后运行是暖cache，不称冷高档加载瞬时。
- 三路径/gugong/、/forbidden-city-3d/、根路径各137文件完整HTTP/hash通过；源53697a6d，指纹`cb2d9893511e53f6c4cf87546c66762da24aa1f37075899be89123ae6dd35e86`，构建sourceDirty=false。继承release文字R146-fix不表示原独立热修包：三个buildId分别fb13f33a5ff3、9fae45d78cc2、5c98a839d994。
- 已复制10张同机位CPU前后/屋顶/西侧/内景图及来源摘要；旧图来自经过独审的候选几何，当前仅接入/元数据变化，不冒充重新GPU截图。

## 未验与边界
本轮只改善可证冠脊组合，不含东侧低屋/不可见背面及内饰/真实雕刻/全屋比例测绘；前两角像为简化形体而非雕刻复原。真实GPU、手机、高处落地接触未验。原完整需求397必需对象及7扩展组仍未全闭合，不能将本包当全殿/全宫完成。此为用户授权累计大版内部工作，不另造用户需合并的小版本。
