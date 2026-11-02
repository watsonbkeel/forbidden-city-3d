# 主敬殿北四窗湾 — 自身北立面照片的有限拟合

基线 remote899b9668 / local9f67ee10。唯一新增运行模块`ZhujingNorthWindows.js`，正常ZoneBase在现`finishWenhuaCentralDoors`之后单次调用。不是改通用hall，也不是重新装修整主敬。

## 依据、实际差距及取舍
本人亲看故宫文华殿建筑页236531的`s65d5b6eae46b8.jpg`：从文渊池桥方向向南看到后殿北立面，四个侧湾为高位小红格窗、其下大段红实墙与低砖带，而现模型为四块通用落地槅扇盒。原网页图题统称“文华殿”；后殿/主敬北面的对应来自桥池与工字殿拓扑，不虚构照片自带独立主敬标签。拍摄日未知，上传年月不等于拍摄日期。

仅将四块原闭合不透明北槅扇的**原盒包络内部**改为连续暗背板、低砖带/红墙、两小扇框及简化菱格。窗宽约2.26m/高1.6m、贴近原pane上沿的分界均为照片工程比例，不称测绘或完整传统纹样。首轮CPU小窗偏低，亲看官图后只提高新窗到现位置；首轮图原件保留。不改屋顶/柱网/南面/侧墙/展陈、旧台阶和任何datum。

官图中央门闭合，模型原中央开放路线**继续保留**，不拿现实闭门照片封已有游戏路径，也不宣称现实允许入内。北向正视图中的室内现展陈仍原样；本项不认证其现状库存/北阶下降表现。

## 真实物理边界
旧48collider全部原引用、原3walkable与房间/map记录保留。原四湾代理只到4.2m，而原可见封闭pane约到5.93m，实测cameraY6.2的高位身体原可穿过上部。按父批准，仅为四个**真实连续不透明背板**新增4完整12三角owner（`zhujing-north-backing:0/1/3/4`），与实际背板三角逐点相同；不填窗后房内空气、不注册新支持、不动Collision/FirstPerson/其他接触规则。当前52collider/3walkable。不是“物理全不变”。正常低位闭湾代理保留，高位四点现在真阻挡，中央通过点与原版一致。

每个新可见顶点仍在原pane盒内；旧非目标顶层对象/网格属性、原物理签名均保持。私有新材质/几何不改共享原材质；源缺失/重复/位移/改几何/借用buffer拒绝。资源验证限已测输入前拒绝与正常merge/dispose，不夸称所有异常事件/late-publish事务均已认证。

## 终态证据
- 初4项真实missing-finalizer红；先出现fixture误取不存在的zone.halls错误，原件另留，不当产品红。授权增加背板前，3绿2真红（缺4owner、高位仍穿）。后一个triangle API测试路径错误修为实际owner.template，不放宽几何断言。
- 最终**7/7**（6组件+1实际控制器测试）终态。中央北门原1.2m台面上4条10/60行跑短往返，110帧，before/after全rows逐字同、脚差0；不是北阶路线。
- 普通无注入ZoneBase/实际outer-east World **4/4、3014帧、脚差峰0**，文华→穿廊→主敬原四路线全rows逐字等1821已验版；正常唯一四窗记录/4新owner和4高位闭湾拒绝均断言。`loadAll:false`只加载outer-east与既有global场景，不冒称全分区。
-4张最终同镜位CPU已亲看：35,670→38,694三角；同camera/轮廓包络，窗墙大形改善。是平色分类/无贴图诊断，不是GPU/PBR截图。CPU初次未做旧牌匾atlas失败已留，导出补正常atlas，不隐删建筑几何。首低窗试图与最终高窗图均本地保留。
-本候选未另跑整应用build，留单次累计构建；未GPU/手机/用户目验/整殿验收。旧历史套件不称修复。官方像素/fullraw只本地；Git仅短文/pins、源码测试与4自制PNG。

## 命令
```sh
E=../r158-zhujing-north-evidence-1937
ROUTE_OUT=$E/central-routes.json node --max-old-space-size=1024 --test --test-concurrency=1 tests/r158-zhujing-north/component.test.mjs tests/r158-zhujing-north/routes.test.mjs
BASELINE_REPORT=../r158-wenhua-route-evidence-1821/world-final.json EVIDENCE_OUT=$E/world-final.json node --max-old-space-size=1024 --test tests/r158-zhujing-north/world.test.mjs
node tests/r158-zhujing-north/export-cpu.mjs $E/cpu
python3 tests/r158-zhujing-north/render-cpu.py $E/cpu/after-north.json.gz $E/cpu/after-north.png
```
仅最终两生产路径及对应QA进入后继；不改main/branches/Pages或替换旧试玩包。需要本地基线报告的逐帧比较不能冒称远端原帧已公开。
