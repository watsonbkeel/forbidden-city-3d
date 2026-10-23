# R59-B · 东华门中央双门门钉行数有界修正

对象：FC-C8AD5BD621，outer-east/items/21。基线 commit：2b983ae82e50e23fd55bbe0845942a0a3855f8dd。

## 本次完成与未完成

实际查看官方完整图与由 9 个官方深变焦图块组成的中央门观察拼图。中央双门支持每叶 8 列、9 行的布局。拍摄日期未注明，URL 的 2008 不当作摄影日期。官方源图、拼图、图块均未进入本分支或 public；只保存 `reference-provenance.json` 的链接与 SHA-256。该页本次网络请求超时，后实际读取已有官方 HTML 缓存，确认图片与 tile XML 的关联及“八路九颗”文字。

本次只把真实现有 builder 的 portal-0 两叶通道朝向表面，由项目原图 8 列/10 行改为 8 列/9 行布局。精确目标 guard 包含区域、ordinal、声明、位置、姿态、三 portal 与原始两叶参数。两叶原先同为 rotation.y=π/2，但需要修改的面不同：第一叶 local +Z，第二叶 local -Z。实际世界射线证明这两面分别朝世界 -Z 和 +Z，不是凭名字/索引猜测。

- 状态：PARTIAL_COUNT_CORRECTED / BROWSER_VERIFY_PENDING，不是整栋东华门外观或室内 ACCEPTED。
- 保留每个 x 像素位置、完整狮首门环及上下边饰；仅删除项目原 1024 高图的 y=[136,234) 第二门钉行带，此带无门环。
- 余下 926 行铺满原有 y=0..6 门叶，纵向比例 1024/926≈1.1058326。这是明确披露的显示拟合，不是实测比例。没有复制左翼门 .47m 台基遮挡，也没有增加底部色块。
- 色彩、金环造型/位置、间距与形状比例仍是原项目图案加上述纵向重映射，未按官图标定。原狮首门环还会打断若干网格点，所以 8 列×9 行是行列布局，不冒称独立重建并核验了 72 颗门钉。
- 原开门姿态、每个三角形/顶点属性/法线/UV、边界、碰撞、支承与地图数据不变。两叶其余五面、左右 portal、所有西华门表面严格保留原材质。源贴图及其 THREE.Source 不变。
- 衍生颜色图/法线图与材质归现有 TextureLibrary maps 管理。同 lib 复用，跨 lib 隔离；重复调用不再改动；kit dispose 不抢先释放，library dispose 各释放一次。
- HD/SD 真实加载失败、64px fallback、缺 normal 或 material-only CPU fixture：保留原材料，记录 NOT_CORRECTED / SOURCE_UNAVAILABLE，不声称行数已改。

## 可复现证据

1. `original-red.log`：在新生产模块创建之前，测试实际构造旧生产门，真实读取 HD/SD 项目资源，均得到 10 !== 9。没有以 import missing 充作红测。
2. `verification.log`：19 项定向测试通过，包含全部上述边界、材质生命周期和真实失败路径。这里只跑相关测试，没有重复构造全世界或运行大套回归。
3. `actual-component-diagnostic.json`：分别记录 HD/SD 真图、完整生产 city gate + finish 的 3010 三角形。修前/修后同 quality 的所有几何/法线/UV hash 严格相等，physics hash 相等。合并材质桶 15→16，只有一个新 bucket；原共享图仍为 10 行。
4. `before-central-{north,south}-leaf.png` 与 `after-central-{north,south}-leaf.png`：同一相机、真实生产组件三角形/UV/项目图的 CPU 透视 z-buffer 片段，四图均实际查看。原门每叶 10 行，修改后 9 行，完整上下边框可见。没有官方照片像素。
5. `before-runtime-albedo.png` / `after-runtime-albedo.png`：本地运行时从项目资源导出的颜色图，不是官方参考。

相机：eye=(-370.98,1.7,-257)，地面 y=0，通道内无碰撞；北叶 target=(-370.98,2.25,-254.515)，南叶 target=(-370.98,2.25,-259.485)，FOV=108°，900×650。片段为完整实际 city-gate 组件的 CPU 投影，不是孤立贴图板，也不是浏览器截图。没有 GPU normal-map 光照、实时阴影、浏览器抗锯齿或浏览器接缝验收。

真实世界射线在合并前后分别验证所有行样本（修前两叶各 10 个，修后各 9 个），样本确实落到真实 gold 像素及相应实际三角形，末行与 y≈.012 边饰可见。HD/SD 均通过。没有为了掩盖下缘遮挡而移动门、UV 或摄影机高度。

## 集成 owner 精确 hook

本 worker 没有修改共享 `EastWestCityGate.js` 或 `ZoneBase.js`，也没有修改 main、Pages、权限、人物、路径或左翼模块。

在 `src/scene/zones/ZoneBase.js` 增加：

```js
import { applyDonghuaCentralDoorFront } from '../palace/special/DonghuaCentralDoorFront.js';
```

将 `buildCityGate(item)` 原有单行 cityGateProfile 分支替换为：

```js
if (item.cityGateProfile !== undefined) {
  const frame = buildEastWestCityGate(this.kit, item);
  applyDonghuaCentralDoorFront(this.kit, frame, {
    zoneId: this.zoneJson.id,
    itemIndex: this.zoneJson.items.indexOf(item),
    item,
  });
  return frame;
}
```

不会改动其他原有分支。生产调度本身尚待 owner 集成；本分支证据是实际 builder 组件 + helper + production finish，不将它冒称完整生产 dispatcher 已集成。

纯消费者 `tests/lib/r59-donghua-world-check.mjs` 导出 `assertDonghuaCentralDoorFrontInWorld(W)`。传入已经存在且正确加载门贴图的实际 W；函数不加载贴图、不创建 scene、不重建世界、不启动测试。它核查唯一 root 记录、合并后的 4 个真实 skin 三角形、source 隔离、8 列/9 行像素、合法视点与所有行的实际射线。可接到 owner 的单次全世界验证复用 W。若 W 只有 material-only CPU 库，则不应让消费者假装通过；应给 W 绑定已存在的真实门资源加载桥。

## 命令与下一步

```sh
node --test tests/r59-donghua-door-count.test.mjs tests/r59-donghua-door-front.test.mjs tests/r59-donghua-world-consumer.test.mjs
node tests/r59-donghua-door-diagnostic.mjs
```

继续由集成 owner 加 hook，再把消费者接入已建 W。缺失项：实际浏览器/GPU同相机前后图、接缝/贴图方向实机验收、色彩/门环/间距/比例校准、其余门面和整栋外观/室内。已知 Chromium socket EPERM 和 bwrap 拒绝保持原状，本任务没有重试、绕过或读取被禁止路径。
