# 文渊阁池桥整栏：集成建议（不含部署授权变化）

基线 `c9b25a71`，独立分支/worktree `r158-wenyuan-review`。本候选未改 `SouthWaterSystem.js`、`Collision.js`、`RemainingOuterHalls.js`、任何 zone JSON/main 或部署。

## 1. SouthWaterSystem.js — 仅既有桥的栏替换

- import `buildWenyuanPondBridgeRails` from `./WenyuanPondBridgeRails.js`。
- 和 `wuyingRails` 并列设 `wenyuanRails=[]`。
- 在 `buildArch()` 的 `if(culvert)return;` 后、原 Wuying 分支前添加：

```js
if (b.id === 'wenyuan-pond') {
  const fitted = buildWenyuanPondBridgeRails(library, b);
  masonry.add(fitted.group);
  colliders.push(...fitted.colliders);
  wenyuanRails.push(fitted.metadata);
  return;
}
```

- 输出 group 加 `group.userData.wenyuanPondRails=wenyuanRails`。
- 不改 `southWaterProfile()`、桥尺寸/位置/railEndInset、32个坡面、桥拱、水域、池岸或其他桥。
- 专属构造器全参数 fail-closed；34个 triangle owner 的几何与可见三角完全一致，材质复用既有 marble。

## 2. Collision.js — 必须独立审核后再接入

import `canRecoverInwardFromWenyuanRail` from `../scene/palace/special/WenyuanPondBridgeRails.js`。

只在现有 `this.rivers.every(river => ...)` 内，在 Wuying 条件后追加：

```js
|| canRecoverInwardFromWenyuanRail(this, river, from, position, radius, fromFeetY, feetY)
```

保留原 `canCrossFubiPool && canCrossLinxiPool && rivers.every(...) && moats.every(...)` 运算边界及后续静态/动态实体碰撞顺序。

必要性：6m 真实下落到新栏顶后，旧二维水域半径边界会困住玩家。恢复函数只允许此桥、34个完整签发且未改动的三角 owner、32个原坡面、真实全身体向下接触（含精确相切，与竖直 resolver 一致）、半径0.5、<=0.251m单向向内水平子步，且不增高。该授权只松开水域布尔条件，不绕过静态墙/人物/三角实体；不增加隐形地面。

## QA 预演

`tests/photo-fidelity/batches/r158-wenyuan/integration-hook.mjs` 仅 Node QA loader，在内存预演上述两个接入点；已接入生产时自动跳过，不写生产文件。

```sh
node --test --test-concurrency=1 tests/photo-fidelity/batches/r158-wenyuan/*.test.mjs
```

独立 Astra 已对该候选与精确 QA hook 收验（见 REVIEW.md）。这不替代集成后的重跑与浏览器/发布门禁，不是可发布结论。
