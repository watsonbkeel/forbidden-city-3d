# R159 修正候选：父集成 hook 与门禁

原c0b230d3不可集成；P1/P2及旧数据撤销见`REVIEW-CORRECTIONS.md`。本树仍不接生产入口。

## 唯一必要入口（父 Agent 操作）
`src/scene/palace/special/JiaotaiDisplaySetting.js`添加：

```js
import {buildJiaotaiFrontVessels} from './JiaotaiFrontVessels.js';
```

现有`buildJiaotaiDisplaySetting`最后、`return record;`之前：

```js
if (x0 === 0 && y === 2.16 && z0 === 354.1) {
  buildJiaotaiFrontVessels(builder, shell);
}
```

`z0`为现有display frame，非入口ztb0。不要在搬移测试夹具无条件调用，也不要在merge后按颜色补一次。原record/真实低台此时已存在。

## 当前合同
- 只适用原位frame(0,2.16,354.1)，原BoxGeometry全index/position/normal/UV、低台自身旋转/缩放及实际4.8×.2×3.6包络/站位均验证。相同AABB角点下移也拒绝；不泛称检查所有未声明材质变化。
- 两件中心x±2.08，Z=真实低台前沿+.30，底=台面2.39000000149。**修订高1.0、径向.75，最宽.27**；仅是`PHOTO-FIT.json`中可见前沿/足点匹配的有界拟合，非测绘或后角标定。旧1.45/原径向已拒绝。
- 分离staging生成3共享闭体/1材质/两组；更新祖先世界矩阵再算6条可见小段AABB。全部col成功后才publish场景/ownedMaterials/标记。早/中/末col前、后抛错均回滚并可干净重试，缓存不留已dispose材质。
- 无新增walkable、救援面或全包围空气墙；AABB明确不是精确圆面/三角接触。材质0xa7b5b4只拟合浅冷金属外观，不证明银质。
- 6条世界包络不在原点：例如西圆足min约(1.945,2.39,355.465)、max约(2.215,2.500345,355.735)。整树手工顶点、metadata、实登记逐一相等。
- 正常finish/merge后再逐项验证实际合批顶点：它们须**精确等于登记边界的Float32量化值**。约355世界坐标的Float32半ULP可超1e-5，不能把这次验证适配误称物理变化；原始过严红保留。没有放宽控制器/碰撞。

## 已实际验证与复跑

- `node --test --test-concurrency=1 tests/r159/jiaotai-front-vessels.test.mjs`：15项。加原冠/前角/屋面8项，合计23项，见VALIDATION.json。
- `node scripts/r159/jiaotai-three-palace-proof.mjs [未接hook的基线root] [可选结果JSON]`：真实三宫readyScene、真实纹理、正常finish/merge。父hook后必须传保留的未接hook基线；脚本拒绝用已含候选的树冒充baseline。
- 原38例：四门钟漏后绕6 + 两侧阶/西低屋24 + 台前低台踏入归返8，全部到达。
- 新近绕行8例到x±2.15；另16个差分组，各包含baseline同路可达、候选真实器体阻挡、接触后退回成功。合计94次真实控制器回放：78次预期到达、16次预期阻挡；不是“62条全部到达”。帧帧身体净空检查未放宽。
- 原非目标合批几何、删除6个明确新owner后的原572碰撞顺序/属性、全部walkables精确保留。新6行逐一对真实合批可见顶点，原点负控。
- 4机位实际三宫前/后CPU（含1365×1720源比例机位），`EVIDENCE/`与CAPTURE绑定当时HEAD+dirty模块SHA/完整fingerprint；NotoSerifCJK仅CPU字形近似，非原书法。

旧c0b230d3图/13项/38次到达记录只作为被拒检查点保留，不能充作当时新器物理通过。正式父hook后的精确回归、生产build、GPU/手机、整殿验收仍未做；本候选待独审，整殿内外仍PARTIAL。
