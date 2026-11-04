# 景福宫西侧文峰：局部、可回滚的模型拟合

基线82304a1a7f221ac85e4b66a101e1f1a73b380d37。新 helper 和 ZoneBase 一次调用；不改公共物理、不加传送/地图/房间。I29 第11项只增加局部证据，整宫未验收。

来源：故宫官网 [景福宫](https://www.dpm.org.cn/explore/building/236571.html)；陈玉华《景福宫前话文峰》，《紫禁城》1984年第3期，[官网入口](https://www.dpm.org.cn/building/talk/223680.html)，[第35页图文](https://img.dpm.org.cn/Uploads/pdf/2205/T00035_00.pdf) 与[后续彩版](https://img.dpm.org.cn/Uploads/pdf/2205/T00035_01.pdf)。彩版文峰有部分边缘被裁切，示意画不是测绘，不能据此称完整扫描复原。

官文给出八角汉白玉座约2.5×4.2×1m、低铜栏约0.3m及立石约4.5m。实际模型座外廓采用这一比例，石座坐标(-319.8,479.5)、石的轮廓/六孔/隐藏面、材料色和栏杆构件数均为合理拟合。实际总最高约5.54m，非精确测绘。未刻诗文，未补院墙、周围门或其他景物。

- `node --test tests/r164-jingfu-wenfeng/component.test.mjs`：真实组件、孔洞双面射线、几何和接触、只读/错位/占用源、重复、资源失败和重试。
- `node --test tests/r164-jingfu-wenfeng/identity-ledger.test.mjs`：29项身份、0新增整项验收、冻结823源码只差唯一import/调用。
- `WENFENG_EVIDENCE_DIR=... node --test tests/r164-jingfu-wenfeng/production-zone.test.mjs`：真实宁寿单区，所有823旧对象/数据/物理/屋顶摘要，64绕行/斜行、16阻挡、8高处降落并离开、旧累计路线。

`baseline.capture.mjs` 只允许 HEAD 正好823且src/data零跟踪差异，已在挂接前执行。它不是每次测试自动重录。冻结ZoneBase源码SHA256为34466e969fe6e0323aa25d3579e22b71897e883eeb79920feec522b91d145ec4。

测试路线为脚本转向的真实控制器，不等于任意按键/持续冲刺全覆盖。CPU预览是离线几何示意，不是浏览器/GPU截图。完整World、浏览器、GPU、手机、Node20均未验。没有运行被拒浏览器。
