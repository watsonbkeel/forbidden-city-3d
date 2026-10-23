# R62-E 景阳宫后殿（御书房）南立面 partial

目标 FC-8B02DC003C，原声明 east-six/items/38。基线 6b396800b6a03582aebf513fcef4966e9f5d0db3。此提交仅 additive helper、局部测试和证据，未修改 data、ZoneBase 或共享 CourtKit，未上传或发布。

## 来源与实际检查

- [故宫博物院景阳宫条目](https://www.dpm.org.cn/explore/building/236511.html)：后院正殿为御书房，五间、明间门、歇山顶；次梢间为槛墙槛窗。页面文字经缓存 HTML 正文实际读取。
- [官图 05 正面](https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d19e160e96.jpg)：已实际查看像素。蓝匾下中央门，两侧共四组高槛窗，红色长直条与局部阶梯式端部关系可见。
- [04 斜视](https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d19e15e107.jpg)、[06 井亭视图](https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d19e1640eb.jpg)：均已实际查看，辅助区分前殿与后殿、定位后院。未复制前殿三间槛窗样式。
- 官图只在私有参考缓存中读取；未纳入此提交、public、任何 ZIP。
- 先用真实旧生产构建器导出并查看 before/south、before/south-window，再构建 helper 并查看对应 after 两图。均为实际三角+HD albedo/UV 的局部 CPU 图片，不是浏览器、GPU 光照或全场景验收。

## 实现边界

buildJingyangRearFacade(kit, item, zoneId) 在分配资源前严格核对原声明、east-six zone、root 身份、无重复实例。仅允许原声明或显式 bays:5；其它额外字段和改动均拒绝。不修改传入 item。

内部 kit.hall({...item, bays:5, panelBuilder})，保留 x=-148.5、z=453.5、w=24、d=9.6、ph=.45、pad=.6、colH=6.08、原歇山屋面/台明/地板/天花/房间/家具。

南面四个非门间用高槛石色实体、红框和浅灰闭合凹面替换旧通用金色落地隔扇；红直条和简化阶梯端部为真实三角网格。每窗四大分组、每组三长直条仅为可回滚 FIT 控制，非测绘叶数/条数/精确纹样。条矩形先平面并集再挤出，去除内部重叠接触面，所有新增三角均有限且有正面积；全部局部边界在当前新窗代理内，不穿柱框。

## 最小接线建议（owner 执行）

在 ZoneBase 的 hall 分发中，绕过通用 baseline 构建、在其它可能冲突的替代构建前加入：

```js
import {buildJingyangRearFacade} from '../palace/special/JingyangRearFacade.js';
// Strict reviewed declaration binding; helper rejects any drift.
if (this.zoneJson.id === 'east-six' && this.zoneJson.items.indexOf(item) === 38) {
  return buildJingyangRearFacade(this.kit, item, this.zoneJson.id);
}
```

不需修改 data 的 bays；有效五间由 helper 严格声明控制。不要先建七间再加饰面，也不要保留旧七间代理。未添加 future inventory-policy 猜测接口；后殿无据家具仍是单独后续边界。

## 原柱、门、代理的变化

- bay 宽 24/7 → 4.8；柱半径 .24 → .336（同一 kit 规则）。两檐柱由 16 → 12。
- 旧每檐柱 X：[-12,-8.571428571,-5.142857143,-1.714285714,1.714285714,5.142857143,8.571428571,12]；新：[-12,-7.2,-2.4,2.4,7.2,12]。Z 仍为 ±4.8，柱高/柱心 Y 不变。
- 门所在 bay index 3 → 2，实际登记门点仍是世界 [-148.5,448.7]，门中心未移动。
- 两折叠门扇局部 X ±1.394285714 → ±1.984；Z -4.154285714 → -3.976；叶宽 .891428571 → 1.248；朝向仍 π/2。门槛宽 2.948571429 → 4.128；高度未变。
- 六块旧南窗代理 → 四块新窗代理；新窗中心 X [-9.6,-4.8,4.8,9.6]，每块覆盖 bay 宽 4.8，Z [-5.05,-4.55]。这些封闭窗并非通道。
- 总 collider 33 → 27。按精确坐标比较移除 22（16 柱+6 窗），加入 16（12 柱+4 窗），其余 11 保留。完整新旧坐标在 local-contract.json。
- walkables、room 含 doors/spawns/cover、mapItems 精确相同。8 块 generic 家具几何仍原样保留，不因此获得史实认证。
- 51 → 57 meshes；2080 → 13656 triangles（未合并统计，主要新增为实体窗条）。

## 验证与 owner W 消费

```sh
node --test tests/r62-jingyang-rear-facade.test.mjs
node tests/r62-jingyang-rear-report.mjs
node tests/zone-lint.cjs --no-geo
node --check src/scene/palace/special/JingyangRearFacade.js
```

6 项 focused tests 通过。含两次进入/室内前部横走/退出，真实 FirstPersonControls 在 10/60Hz 下分别 93/558 帧，地面起步、最大脚高 .45，无 rescue。真实生产 merge 后检查 4 窗 8 个三角命中、五间柱碰撞、中央门清空、材料生命周期。

tests/lib/r62-jingyang-rear-world-check.mjs 只消费 owner 已有 W，不创建/替换 world，不注册代理：

```js
assertJingyangRearFacadeInWorld(W);
replayJingyangRearFacadeInWorld(t, W, {fps:10});
replayJingyangRearFacadeInWorld(t, W, {fps:60});
```

JINGYANG_REAR_ROUTE 导出绝对坐标，全部在 local-contract.json。owner 应在最终单次既有 W 上运行，不能将本地结果冒充完整场景通过。

验证偏差透明记录：曾误运行一次 npm run test:zones，触发未接线 R61 的全区碰撞 lint（约3.7秒），已向 owner 报告且不重跑。它报武英门北出口、武英殿前门两个失败；test:anchors 报神武门 11m 偏差。新增 helper 尚未接线，不在这些命令的构建路径中。纯数据 --no-geo 通过，9 个已有 bounds 缝隙警告。未跑整套回归或 browser。

## 仍未解决 / 不得声称完成

- 精细格心复原、准确叶数/条数、接榫/材种、漆色、测绘尺寸未知；当前整体为 partial。
- 既有通用天花、彩画、门叶金色纹样及较高纯红门窗上额仍原样，尚未按官图逐项修正。南面窗仅在现有 shell 门窗高度范围内拟合，不是整面比例复原。
- 中央蓝匾未新建，未杜撰御笔、室内藏书或展陈；无新房间/NPC。
- 北面未见，不补纹样；原后墙保留。
- R39 generic 厅家具仍无据，未来须以明确政策和独立验证边界处理。
