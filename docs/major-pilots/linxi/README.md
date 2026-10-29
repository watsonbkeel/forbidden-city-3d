# 临溪亭：跨池券桥—矩形池—石栏整体包

**K区 FC-00B009500F，原需求第763行；累计父版本0aa1f79b。** 本包补此前明确缺失的桥池单元，不改变397必需对象/7展开组分母，不宣布整座临溪亭或慈宁花园完成。

## 实做及保留

- 用真实闭合、单孔贯通的砖石券桥替换原唯一实心矩形砖台；原石顶板保留，券顶和顶板底有限重叠30mm。券面浅石块分段是拟合，不是砖石砌法考证。
- 新增矩形池底、池岸、静态水面、两侧汉白玉望柱栏板及南北回折段。下栏板、镂空上段、拟合瓶形柱、压顶、望柱柱帽为实几何；不伪造雕纹。
- Environment真实地面减去且仅减去180模型平方米矩形孔，池桥下没有原铺地遮挡。尺寸为拟合，不是官方面积。
- 保留既有亭身、四面门窗、木护栏、屋顶宝顶、南北石阶、石顶板和所有原碰撞/行走面。新增174个碰撞盒仅对应石栏实体包络，不新增可走水面或隐形墙。
- 经复核发现玩家可跳越1.4m石栏，再落到引擎默认y=0虚空支承。已用真实CollisionManager红测试复现并修复：在既有非游泳水域策略中，仅排除本亭桥东西两片池面，按身体半径检查，保留中央桥和南北通路；不宣称新增游泳或池底探索。全局默认地面机制未重写。
- 构造失败会清理暂存新几何/水材质，原宿主不被改动；正常销毁不释放借用石材。

## 证据与边界

依据[故宫博物院临溪亭页面](https://www.dpm.org.cn/explore/building/236537.html)和两张已查看像素的自身官方图。文本支持矩形水池、单孔砖石券桥、东西临水、南北出阶及池畔汉白玉望柱栏板。源图、哈希、访问时间见`SOURCE-MANIFEST.json`；原图不进生产资源。

**拟合而非实测：** 20×9池廓、9.6×9桥台、6m孔跨、-.72起拱/.10拱顶、-1.15池底/-.55静态水位、栏杆分段/高厚/瓶形、对面不可辨细部和砌石块数。未证摄影日期、当前水况或开放状态；不据官网一般景观描述添加鱼、莲或“现时清澈”结论。

**仍未闭：** 继承屋顶过高/曲线与绿剪边近似、斗栱彩画、斜格门窗和琉璃花砖精饰、平顶花卉/蟠龙错视天花、原物牌匾与当前室内库存。官方方亭三间与既有9×8.4轮廓的差异仍在。现模型导览牌不能当实体匾额验收。南北花坛、香炉和周边林木不是本桥池新增完成项。完整8外部/6内部要素对应见`COVERAGE-MATRIX.json`。

## 验证

- 专项+历史R69宝顶隔离测试：**17/17通过**，见`final-targeted.tap`。包含闭合正体积、通孔射线、顶板关系、逐网格/物理保留、资源销毁和异常清理、真实地面孔及精确面积差、跳跃池面排除。
- 真实22色图+21法线图加载后的全外西路：24条10/60Hz南北双落地往返回环（走/跑、正/倒行、3横向偏移），8条揽胜门既定路线/池外周绕行回环；rescue关闭。22处石栏身体检查、6处入口净空、双侧腾空跨池拒绝；未称GPU测试。
- 全外西路非目标网格哈希一致，所有旧物理数据保留。143→144合批网格；396,251→405,957三角形（+9,706，约2.45%）；碰撞3811→3985，行走187、房间30不变。新几何预算16k内；不是帧率收益声明。
- R45额外历史集回退版本也复现两项失败：`all120 non-target halls retain complete R44 geometry and navigation signatures`、`independent 临溪亭 retains actual R44 roof/platform and established supports`。旧屋顶/历史全库快照漂移，未改基线凑绿。R69“仅宝顶变化”比较显式关闭本桥池；新整包独立默认开启测试。
- 全套current-state：**1115/1331通过，216失败**，与0aa1f79b完整基线失败名逐项相同、无新增失败名，仍非全仓绿。三基址构建完整终局另见`current-state-final.tap`、`suite-failure-comparison.json`、`build-verification.json`；不把专项通过当全仓通过。

## 复现

```sh
node --test tests/major-pilots/linxi/*.test.mjs tests/r69-k-linxi-finial.test.mjs
node --import ./scripts/major-pilots/linxi/legacy-rollback.mjs --test tests/r45-enclosure-layout.test.mjs tests/r45-independent-enclosures.test.mjs tests/r69-k-linxi-finial.test.mjs
node scripts/major-pilots/linxi/export-whole.mjs baseline
node scripts/major-pilots/linxi/export-whole.mjs candidate-final
node --test --test-concurrency=4 tests/current-state/*.test.mjs
```

`candidate-final`六视图从实际合批外西路及Environment地面、真实解码材质导出，非浏览器/GPU截图。`candidate`为早期输出；视觉形体相同但源指纹不同，不用作最终指纹证明。保留六份此前dirty桥报告；本地检查点，不修改main、不推送、不部署。
