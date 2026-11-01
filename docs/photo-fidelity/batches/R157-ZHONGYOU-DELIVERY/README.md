# 中右门：完整主体开发交付

**对象 FC-85E0528ECA；状态：可运行主体候选，等待用户实机视觉确认。**

这不是新增零件版本。当前专用中右门已完整接入生产地图：六轴门厅、完整屋顶、南透窗/北实面、实际开启的双叶、南北长坡及栏杆、北现代覆板和相邻墙口。本轮不重复改正确几何，只补齐可启动包和过时台账的现态说明。用户新口径：小于 0.3 m 且不影响通行的差异不追修；优先明显视觉与真实通行。

## 立即运行

```sh
npm ci
VITE_BASE=/ npm run build
node scripts/package-production.mjs /absolute/path/to/NEW-zhongyou-package
cd /absolute/path/to/NEW-zhongyou-package
node start.mjs
```

打开打印的本地网址，地图/传送选择「中右门」（世界 X=80、Z=-12.2）。沿中央门道南北通行，端部窄廊不是额外通门。真实用户地图传送落点/浏览器画面仍待确认，不能把下面的控制器测试当用户点击已验。

本轮已生成独立包 `zhongyou-runnable-package-0130`：139 文件、43,449,876 字节；准确清单见 ROOT-PACKAGE-MANIFEST.json。包服务器真实 HTTP 请求 HTML/build-info/HD manifest 均 200，服务已停止。此本地路径不是永久下载链接，远端源码分支可按上式重建。

## 当前证据（不是历史冒充新测）

基线 `2cb15fdece44c98aa60fa35e17668c6b1f0b0951`。生产 src/data 未修改。

| 最小门槛 | 本轮结果 |
|---|---|
| 本门主体/开闭/窗/端廊/真实支承/资源 | 24/24 断言 |
| 实际 World 南北往返 | 1 测试内 12/12 组合，同精确基线审计者原日志复用；是穿越，不宣称精准停步 |
| 实际 World 高处落脚 | 1 测试内 30/30 组合 |
| 实际 World 墙缝跳跃 | 1 测试内 8/8 组合 |
| 构建 | `/`、`/forbidden-city-3d/`、`/gugong/` 均成功并核 build identity |
| 可启动打包 | 首红缺 `release/r146-fix/start.mjs`；补同一 localhost server 后原命令成功，真实 HTTP 200 |
| 当前完整 CPU 视图 | 五视图、21,256 完整实际 merged 三角；basecolor，不含纹理/光影，非 GPU |
| 浏览器实机 | 未通过：系统 Chromium 启动页面前 socket 权限错误；未绕过限制 |

保留 `R146-fix` 是真实累计运行时的 release.json，不冒称新整城版本。`ROOT-BUILD-INFO.json` 与各 base 记录标识实际 sourceCommit/sourceFingerprint；说明/包装支持不改变场景指纹。

## 来源与差异

历史三官方全景为 1665（南）、1623（北外）、1615（北近/厅）。旧 18 面像素缓存失联，不称找回。
本轮官方 `vpDetail` 新快照明确恢复：1623 → `1943147945208365056`，1615 → `1943147058721243136`；原响应已留。1665 已知 `1943153407207194624`。新取像素/独审若有另列，不倒写为历史原件。

已知近景简化：分段描金侧框、细雕与栏饰、顶回栏准确跨数；隐藏梁架、绝对高程和精确开叶角未测绘。125°是工程拟合，灰色北覆板明确现代构件。CPU白色画面来自未采样纹理的诊断，不代表真实材质全部为白。

## 台账和未通过项

Canonical QUEUE 仅本 ID 新增 currentImplementation/currentDelivery；原 facets/currentCycleAccepted/sourceEvidence/scopeReview 等原字段完整保留并注明历史基线，不再把旧“三间generic/.45无栏”当当前源码现状。R58-A 派生快照同步同 ID，其余对象不动。

queue validate-progress 通过。全结构 validator 仍红：其它对象 FC-88674ADACB 原有两条未登记 source ID（R71-M-FIG17/P161）；此次未改相应源字段，保留真实红，不扩修无关历史。

**没有声称用户验收、所有细部复原、GPU/手机性能通过、37 项全部完成或全城零问题。**

## 回滚与分支

不修改 main，不部署。所有场景代码保持基线；本轮仅包装支持、现态记录和必要证据。启动前保留旧包，回滚时停止新服务器后从旧目录启动，不覆盖旧文件。开发分支提交和远端回读身份在交付回执记录，不把尚未上传的状态写成已备份。
