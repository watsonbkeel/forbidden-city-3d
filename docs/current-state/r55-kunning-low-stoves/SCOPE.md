# R55 · 坤宁宫 S 层低连续三锅灶

## 交付范围与结论

冻结基线 `edd1d6de15ad1393a45d6da8712e37ac3d8dc388`。只替换可选 S 家具资产的旧两座高灶、地上方火口及 `COL_stove`，不在 B 层另叠灶。候选模型为 `kunning-v6-5adbf53a3114.glb`；旧 `kunning-v6-0c83b4364eef.glb` 完整保留。

现模型是一块低连续台面、三个实际环形嵌口、三块平木盖和盖下承托圈。台面与盖顶均在局部 y=0.43m。基础材料仅浅灰台面、暗红木边/盖、暗铁环，不添加未知把手、浮雕、食物、明火或灯。旧毗卢罩原样保留，不称其已精复原。

这是有图证的局部形制修正，不是完整灶间复原、现场测绘或当前展陈/开放情况说明。

## 已实际查看的来源与尺寸限定

王文涛《紫禁城中灶具的种类形制与使用功能的调查》，《故宫学刊·2019》。

- [官方 PDF，印刷 p501](https://img.dpm.org.cn/Uploads/File/2020/11/13/u5fae21c07c127.pdf#page=3)：整页图4/文字。
- [印刷 p502](https://img.dpm.org.cn/Uploads/File/2020/11/13/u5fae21c07c127.pdf#page=4)：整页和图5原嵌图207×148像素。支持低连续浅灰台面、暗红前沿、嵌入且有盖的圆口；放大页图没有创造新细节。
- [印刷 p508，第10页汇总表](https://img.dpm.org.cn/Uploads/File/2020/11/13/u5fae21c07c127.pdf#page=10)：独立复核发现并实际查看，明确区分长跨面阔、宽2160mm。因此不再笼统说2160的“宽”含义完全未明；它不是三锅排列方向的总长度。

文献给出地上高430mm，锅口直径1050/1360/1160mm、深340/780/760mm。三口直径合计3570mm，不能把2160mm硬当横向总长。文献长未提供数值；与现 B 壳的坐标/比例映射、锅次序和细部仍未核实。2019为刊物年，2020为文件路径日期，照片拍摄日未知。

模型适配仍为 4.00×2.30×0.43m：其中长4.00、深2.30、间距、盖厚35mm和各锅东西顺序是可逆拟合，尤其模型深2.30并不等于文献宽2.16。地上高0.43采用文献值，但以既有合同地面标高为datum，不将保留的 B 地面绘制约定说成测绘。仅文献尺度有出处，不声称整套米制尺寸精确复原。坑、地下锅腹、火口、石阶、柴穴、烟道、活动盖机制均未做；原论文图片不复制进产品。

## 有界几何、资源及保留证据

- 无改动基线导出与原 GLB 全字节 SHA256 相同；最终源二次导出也完全一致。见 `proof.json`。
- renderable triangles 4656 → 7952，净增3296，小于本片4000上限。可见 mesh primitive 11 → 12；8代理/96代理三角不变；无纹理/新灯。
- 编码289196 → 427780字节；decoded buffer 252704 → 389456字节。这不是浏览器/GPU常驻显存或帧率测量。
- 移除地上旧灶376可见三角，新增3672可见三角。剩余4364三角（4280可见+84其它代理）逐三角保持位置、normal、UV、绕序、材料身份和节点变换，非目标材质JSON也完全相同。旧罩、喜床、屏、三面炕、神幔、囍字及7个其它代理均不改变。
- `COL_stove` 旧局部包络 min[-7.25,0,4.5] max[-3.05,1.9,7.05]；新 min[-7.22,0,4.625] max[-3.22,.43,6.925]。
- 新低灶中心较原区域中心向-x挪7cm，仅本地灶体/锅口/盖和本代理移动，罩不动。新右沿-3.22距原北炕左沿约-3.20净2cm。初版5cm重叠已移除，最终实际三角与保留S家具无体积交叠。
- 环口曾有40/44角离散轮廓不一致的0.37–1.84mm裂缝；复核后共用角列表。12个角点实GLB射线由落至.35m改为命中.43m，回归及红证据保留。盖的22mm径向暗缝是显式拟合，底下有真实铁座，不是悬空盖。

## 已执行验证，不冒称整合完成

`green.tap`：37/37专项通过。包含真实GLB解码、生成合同/源hash/manifest统计、上述精确保留、低灶实际表面与接口射线、真实InteriorLoader安装/淡入/重复加载/卸载/重载/释放、网络失败、合同失败和迟到取消回B。

同一真实后三宫片段、CollisionManager、生产 FirstPersonControls 运行：
- 16条合法往返：10/60Hz × 走/冲刺 × W/S，另同组合 W+D/S+D。逐帧身体无碰撞，不触发rescue；只用原地面2.00/2.16和门槛2.26。
- 8个故意撞灶接近：从地面出发的身体被低台阻挡，不横穿、无抬脚或新增WALK。新灶前世界z=390.725，半径.5的身体停在不超过390.225处。
- 10/60Hz真实起跳可落到可见台面，最后约2秒稳定脚高2.59（原floorY2.16 + .43），没有高透明墙或落穿。不是将台面登记成救援地面。

`route-overlay.svg`为实际控制器轨迹与真实B/S碰撞盒叠合，原始轨迹和摘要同目录。没有第二次整座世界构建。93角色及globalGeometryGeneration重绑由统一owner在其既有W执行，本片不以独立小场景替代其验收。

旧套件未改：同命令冻结R54为19通过/1失败，当前18通过/2失败。共同失败是慈宁旧夹具缺cfg；新增固定F3十二三角快照失败（8036≠4740）是授权灶替换导致的过期总量限制，由新逐三角保留测试收敛验证。未改历史快照或放宽全局碰撞来制造全绿。

## 视觉检查

`docs/validation/r55-kunning-low-stoves/` 的 before/neutral/base-materials 三阶段、front-eye/oblique-top/room-eye 三同机位，全部来自实际旧/新GLB和实际Kunning B builder三角。先看统一灰材质形体，再看基础材质。灰模是同资产渲染材质覆盖，不声称存在另一套生产白模。

这些是CPU透视z-buffer图，不是浏览器/GPU截图。B采用中性审阅色，高于8m的屋顶三角剔除以见内景，实际低位天花、墙柱不挪动；纹理、实时光照、阴影和手机表现未验收。室内机位原柱遮挡如实保留，不为图像移柱。源图不是同相机可精确配准照片，不能当测量匹配。

## 复现、接入和回滚

```sh
blender -b -P assets-src/interiors/kunning.py -- /tmp/kunning-r55.glb
python tools/r55-package-kunning.py /tmp/kunning-r55.glb
R55_WRITE_EVIDENCE=1 node --test tests/r55-kunning-low-stoves.test.mjs tests/r55-kunning-low-stoves-world.test.mjs
python tools/r55-kunning-route-overlay.py
node tools/r55-kunning-evidence.mjs /tmp/kunning-r55-views
for f in /tmp/kunning-r55-views/{before,neutral,base-materials}-*.json.gz; do python tools/r55-kunning-raster.py "$f" "${f%.json.gz}.png"; done
```

统一owner从 `tests/lib/r55-kunning-world.mjs` 导入 `actualKunningRoot`、`assertKunningStovesInWorld`、`R55_KUNNING_OBSERVATION_ROUTE` 和新旧包络。先在同一个W及同一个interiors中以layer B捕获未加载快照，精确URL分发真正新GLB，等生产淡入结束再以layer S断言，卸载后再次B断言。helper既不创建世界也不创建CharacterSystem；对照解码树签名后释放。非坤宁collider/walkable在快照与回退间须不另行改变（养心S先卸载再取本轮B快照）。

回滚应还原本片source/manifest版本以重新引用保留的 `kunning-v6-0c83b4364eef.glb`，不是删除新资产或篡改Loader。未修改B壳、公共生成器、Loader、profile、registry、角色数据、main或Pages。本分支只交有界提交供owner整合。
