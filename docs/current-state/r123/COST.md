# R123 成本，不是性能优化

最终运行源 `3cf969f6115745cde365ddaf72dd7236705f676711a789d1a8a13dca79118d08`。Node24.19、本地真实TextureLibrary/Canvas解码；不测网络/WebGL/手机全帧。全部raw保留在 `reports/r123-chuxiu/cost/`、`final-startup/`。

## R120 → R123 实际west-six，双档各3交替fresh process对

| 指标 | R120 | R123 |
|---|---:|---:|
| finished triangles |107527|110603 (+3076)|
| geometry ArrayBuffer bytes |10313952|10609248 (+295296)|
| merged mesh / unique materials |96/96|98/98|
| kit owned materials |94|96|
| texture objects / 逻辑decodedRGBA bytes |36 /29415424|不变|
| collider / walkable / room / mapItem |1176/95/51/36|1223/101/53/38|
| 有限scope owners |4|8|

高档buildCPU配对增量中位 **34.888ms**，三对分别34.888/61.580/30.890ms；低档 **64.272ms**，64.272/35.932/71.061ms。区级all-ready时序有decode噪声，原样保存，不能据个别更短值宣称加建筑后提速。两档均使用本区原SD43文件；全应用high/HD另测。各对记录geometry与owned材料恰一次dispose。

普通box仅6个double标量的payload56448→58656B；新增主地板2source faces顶点标量144B另列。**不含**JS对象、triangle模板/索引、CM复制、其他字段和临时分配，不是完整heap/总持有，更不是VRAM。纹理逻辑像素不等于实际GPU mip/driver分配。

## 最终完整双routine 60Hz（8566帧）
- all-ready世界CPU6424.599ms；CharacterSystem construction391.074ms，其中私有导航387.452ms。
- 新段7417样本：P50 .162ms、**P95 2.299ms、P99 13.570ms、max29.052ms**。这是两作息update CPU，不是wholeframe，明显尾峰仍未解决。
- 私有导航711colliders/106walkables，numericBytesEstimate123936仅既有估计，不含完整JS拥有图；817live owner proof/48235rows。
- `memory.ready`历史driver字段实际在路线结束采集，必须读为**end-route**：heapUsed475648016B、arrayBuffers343560663B；不是启动readyheap/资源净增。dispose后native/共享引用也不直接代表泄漏或全部已回收。
- 不重新启用R120已拒NR1/NR1b，不按这次高尾峰修改阈值或挑样。

## Fresh全部准备好/生命周期
- low/SD allReady7240.319ms；high/HD7577.480ms。setup边界分别7232.989/7570.032ms，主项包括全部图片和三paint成熟，未把异步等待移出。
- 初始7个区全部构建/预备，无首访后台建区等待；后续普通缓存淘汰/重建保持。
- production Teleport.go 首进入CPU setup：low68.378–103.052ms，high63.223–113.597ms，**不是走动FPS**。
- 普通return/rebuild：low933.227–1656.068ms，high947.099–1768.973ms。
- 独立TTL expiry：low2234.207ms、high2399.505ms。秒级最坏不藏在普通return均值里，不称无卡顿。
- startup资源inventory只覆盖driver列明可达roots；character/interior/historical lamps/flightTour私有对象并未完整纳入，不称全应用完整heap。GPU/mobile仍未验。
