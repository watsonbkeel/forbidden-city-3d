# 武英殿前甬道板砖纹理修复

用户截图 `image(20261102-000352).png` 指向武英门至武英殿的月台甬道；画面牌匾为武英殿。不是武英门南面的三座石桥。基线为本地 `c376ef09`，等价远端 `aac4e3a3`。

## 真实根因和修复

- `WuyingMoonTerrace` 自建 `wuying-moon-causeway-surface` 原始 BufferGeometry 完全没有 UV。普通合批在其它同材质面有 UV 时补全零 UV，所以纹理虽加载，甬道只取一个纹素，成为大块灰面。
- 两处相接水平铺面原用 BoxGeometry 的 0–1 UV，一张纹理拉满大面；基座顶盖和独立铺面还正好共面。不能只改材质名称。
- 仅一个生产文件：三处铺面复用 `Environment.setupGround` 同一 `ground_brick` 材质配置（roughness=.88、metalness=0、tileSize=4）。不克隆贴图或改共享 repeat。
- 顶面 UV 按世界 X/−Z 的实际米数铺设；斜面沿坡距 `sqrt(1+slope²)` 积分，水平和斜面北接点同相位。斜向边也按真实长度，不拉长板砖。
- 两基座各只去掉与真实铺面重合的两片顶盖三角；保留侧面和原注册实心 AABB。没有添加浮层、抬高路面、改桥形、河线、通路或支承。
- 原白石栏、门前三桥及其它门坡未改；白石栏此前平色不是本次“地面板砖”修复范围。

## 证据和验证

- 新图形两项先 RED，第一次只补纹理后，水平铺面首射线命中旧基座材质仍 RED，随后才删四个重合顶盖并 GREEN。没有用改标签掩盖。
- 最终选定 **39/39**：新 UV/遮盖 2、基线物理及全部剩余三角形严格对比 1、HD/SD 文件加载 2、旧月台 25、旧形制 9。`final-39.log.gz` 为最终日志。
- 真实合批后的三处首个向下射线命中均是新板砖材质，且高度仍为原支承面；UV 面积非零、每条顶面三角边的 UV 米长与实际长度一致。
- Hall/gate 所有 colliders、walkables、rooms、mapItems 同 c376 逐字段 hash 一致；除指定四片原重复顶盖外，全部原位置三角形一致。
- 旧月台真实胶囊包括两侧阶、进殿、对侧返回以及中央甬道至武英门；没有恢复低地面救援。
- 实际 HD/SD WebP 颜色与法线通过未改的 TextureLibrary.load/configure/material 管线（仅文件 transport 用本地解码代替网络）；检查原纹理有板缝/纹理对比度、RepeatWrapping、sRGB 及共享 map 身份。SD normal 本来为256²，首次测试误假设至少512²而红，按实际文件规格纠正并保留日志。
- 前后图是同相机、真实合批局部门殿与 Environment 地面、原项目 WebP 的透视正确 CPU 贴图图。已亲看，灰面变成与周边同密度的清楚板砖；**不是 GPU/浏览器或用户设备验收**。
- Astra 只读审查未发现阻断：斜面保距、相位、共面处理、三面资源各合批释放一次、共享材质归属、通路范围均确认。生产源码在该审查前冻结；审后只增 QA/证据。

## 保留失败与边界

- 稀疏树最初缺三个原 tracked 证据 JSON，导致旧测试 ENOENT；从精确 c376 `git show` 原字节恢复后复核，未修改旧断言，不把缺件说成产品既有坏测试。
- 曾误启动 `r52-wuying-flight-descent.test.mjs`，内部构造 flightWorld，于文渊阁 `Wenyuan south veranda requires its exact augmented source` 失败；第二次组命令误带同文件也已终态。约00:08–00:09的时窗可能与其它重槽重叠，**不据此作性能声明**；随后未再启 World。该全城门禁不在此报通过。
- `npm test` 无脚本。本候选未单独全站 build；按唯一集成人排队要求交三 bug 累计 clean build，发布前由其执行。
- 未推送、不改 main/branches 或共享树。

## 复跑

```
node --test tests/r157-wuying-paving/*.test.mjs tests/r52-wuying-moon-terrace.test.mjs tests/r52-wuying-next-forms.test.mjs
node tests/r157-wuying-paving/export-textured.mjs after /tmp/wuying-after.json.gz
python3 tests/r157-wuying-paving/render-textured.py /tmp/wuying-after.json.gz /tmp/wuying-after.png
```

所需冻结旧证据为：`docs/current-state/r52-wuying-moon-terrace/surface-collision-delta.json`、`reports/r52-wuying-forms/before-fingerprints.json`、`reports/r52-wuying-forms/performance-successor/high-detail-contracts.json`。稀疏工作树只从基线恢复原字节，不另造基准。

## 累计上传边界
本组 evidence/*.gz 原日志仅本地保留，不进入累计远端净树；EVIDENCE.json 记录其长度/SHA，不等于远端原件可得。作者冻结提交不改，累计不推含原日志的中间祖先。
