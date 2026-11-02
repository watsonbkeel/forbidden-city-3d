# 文渊阁碑亭：独立有限候选（有限组件/入口验证完成，待累计构建）

原41项 `FC-F23B7824D4`。基础为 acc36（本地 d1c66 同树），不修改用户 branches/main。

官方文渊阁页明确东侧黄瓦盔顶碑亭与一通碑；本人已看故宫刊页011第8图，选择实红围护/南门/灰石脚，而非通用敞四柱亭。照片不能给出当前游戏坐标、米制尺寸、碑背或细刻，因此位置(-212.5,-132.8)、6m亭身、8m檐宽、.25m低台和素碑尺寸均为可回滚工程拟合。只保一通碑的可辨轮廓，不生成或猜写具体碑文。门叶折入用于互动，不代表现实参观权限。

- 新模块 `WenyuanStelePavilion.js`，正常 ZoneBase 末端调用一次。
- 原文渊阁、桥、水域、院墙、所有既有物理/控制器/数据保持。新实体只增加自己的实际三角碰撞；屋顶不使用填满亭内空气的包围盒。低台是可见实心Box及其真实顶面支承。
- 实际基线World扫描8.5m方形预留未碰旧实体或水域；南侧z=-145仍是水池，不造水面捷径，入口沿现桥北岸转入。
- 屋顶轮廓/简化色域和柱墙比例是照片合理拟合，不能说精确复原；CPU是原几何基色，不含真实纹理/GPU/手机光影验收。

## 验证口径
仅必要组件、普通已加载outer-east World 的新亭入口/绕行及原文渊入口。最终组件6/6、正常已加载outer-east World 12/12往返（4379帧）及6实体/水域拒绝通过。新亭8条峰0.247278m；原阁4条955帧峰0.251007m，全部frames逐字等之前1645累计原件。屋顶/灰带修正前后的12条完整rows也相等。模块浏览器bundle通过，完整应用构建保留到本次集中集成，不声称已全站构建/GPU通过。原始日志/逐帧数据/官图PDF仅本地保全，远端只摘要、命令、SHA及自制CPU图。

## 来源
- https://www.dpm.org.cn/explore/building/236513.html
- https://www.dpm.org.cn/Uploads/File/pdf/a7/67/b3/a767b32d6015563d8947b50650c815cb.pdf
  本地PDF SHA256 `55149c215bd4dffe8e448a7e024d64bb3a94ed2c09fcca40fa93f56ae8b2286d`，图8自身碑亭；拍摄日期未知。

## 精确命令与本地原迹

```sh
node --max-old-space-size=384 --test tests/r158-wenyuan-stele/component.test.mjs
EVIDENCE_OUT=../r158-wenyuan-stele-evidence-1723/world-final.json node --max-old-space-size=1024 --test --test-concurrency=1 tests/r158-wenyuan-stele/world.test.mjs
node --max-old-space-size=1024 scripts/r158-wenyuan-stele/cpu.mjs ../r158-wenyuan-stele-evidence-1723/cpu-final
./node_modules/.bin/esbuild src/scene/palace/special/WenyuanStelePavilion.js --bundle --format=esm --platform=browser --external:three --outfile=/tmp/r158-wenyuan-stele-bundle.mjs
```

CPU exporter的before来自同级保留的d1c66树，是相同机位普通ZoneBase构造；不是用删除本亭的候选充当古版原件。两图实际基色，借用屋瓦材质白底、没有采样黄色瓦纹理，因此不能当实际颜色验收。4张最终图已亲看，斜视从院内而非院墙外拍摄。

保留早期4条缺模块红、圆鼓顶轮廓红、灰带与梁共面红及修正后的6绿；初次CPU未初始化离线DOM而失败，修脚本后终态绿。首斜机位在院墙外遮住亭，不用来假称侧面已看；最终改院内两版同机位。原件均在`../r158-wenyuan-stele-evidence-1723`，`VERIFICATION.json`仅绑定长度/哈希，非远端原始帧可用声明。没有更新旧试玩ZIP、branches/main或Pages。
