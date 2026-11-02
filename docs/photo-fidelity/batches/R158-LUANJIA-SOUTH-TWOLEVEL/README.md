# R158 銮驾南十间：空置双层游戏适配

父2026-11-02 01:20明确授权，基底761d98e8（含已审东翼正常接线及三截图修复），独立r158-luanjia-south-twolevel-0121。只有两新运行模块和B三行分发，**没有安装ZoneBase生产hook、没有全应用build/上传**。

## 已证文字与未证室内
[故宫官网236525](https://www.dpm.org.cn/explore/building/236525.html)本轮再读确认东五间、南十间、黄瓦硬山及内部两层；并未提供本体室内图或实际门梯位。本候选保留原南十间46×9m拟合外壳、屋面/墩柱，**沿原偏置闭板local x=2.27而非十间中央砖墩**，将闭板与背后的唯一实际整墙同步改成2.2×2.7m门洞。北向/此门位/3.3m楼板/20级/.165m级高/.33m常规踏深/1.2m真实顶端平台/2.2m梯宽/1.1m护墙全是空置游戏适配，不是历史内构或现实开放许可。原房屋位置/尺寸拟合限制不消失；不添加内陈、窗饰、失存房或连接东西翼的虚构桥。

## 可见与碰撞同步
仅替换原南翼long-wall--1与unverified-closed-panel两对唯一mesh/triangle owner。其余20原南翼mesh/owner、全部东翼内外对象和原walkable引用保留。新68闭体：3门洞墙段、3切片楼板、20实梯、42安全护墙。45用完整最终可见三角，23实梯/板使用字面Float32同界Box；每块楼板上面真实walkBox且rescue:false，下方原生flat-soffit阻顶。南翼总physical88（65 triangle＋23 box），没有空气大盒、虚坡、救援楼层或屋顶修改。

`LuanjiaSouthContact.js`独立私有23面授权，不混东翼身份。只在新适配器实际发布成功后认证原owner/引用/边界；移位、隐藏、缺重改、复制真实面/owner、跳跃、高落、侧出、过快位移拒绝。3块自身平板仅用真实完整三角做脚至头连续SAT，再走原扫体/水/动态体检查，不为陌生overhead开放。这里**不是逐帧重验任意mesh顶点突变**。B只新增import/preserve/resolve三个入口，删这3行后逐字等761；Collision/FirstPerson、原旧认证名单及所有东翼源码、原南翼生成模块未改。前置守卫测试充分，但不夸称任意恶意事件/发布后异常自动回滚。

## 实际红绿与有限验收
- 6 missing-adapter断言真红→6组件绿。原真实实梯10Hz走路通过，跑下降峰1.306999995m真红，5个缺contact断言红；不是未测先改控制器。
- 追加南私有接触时复制了同名const导致一次4文件加载红，改唯一南变量后终态17新专项全绿；原记录保留，不计为功能红证据。
- **最终56/56**：17新（真实4走跑、跳顶/高落/侧栏/失效/复制/薄障碍/动态人/资源等）＋原东翼18＋旧B9/东华2/文渊10。独立B模块import与浏览器module bundle通过；没有整应用build。
- **真实World24接受路线/8465帧，峰0**：南新4/1550；东内4/1460、东外8/2383、南外8/3072完整帧SHA/摘要逐字与对应前驱相同。outer-east/loadAll:false及global实体，作者仅CourtKit before-finish QA安装南适配器，**不是已装正常生产入口**；东翼正常hook保持。所有新及保留帧在运行时逐帧检查，仅落摘要/完整帧hash，不声称保存完整原帧数组。
- 四张最终真实几何CPU已亲看：下层、实梯、上层开口/护墙、北外门。平色诊断非纹理/GPU/手机实机验收，只有可见几何方向检查。
- 原南翼直冲闭板4负例在本次批准开放此唯一门位后不再是应拒绝合同；旧两条外绕/门前止步8路径保全，新组件仍拒绝中央墩、旁墙、后墙及屋面。没有删其他阻挡绕过验收。

## 接入方式与复验
精确PROPOSED-SHARED-HOOK.patch只import＋在finishLuanjiaEastTwoLevel之后/kit.finish之前恰一次call；不要在生产hook后再次QA注入。World支持NORMAL_INSTALLED=1：此时零prototype调用，强制唯一南/东metadata及各23认证面，无fallback。累计保新4＋既有东内4/东外8/南外8，单次clean build由唯一集成人完成。

```sh
node --test --test-concurrency=1 tests/r158-luanjia-south-twolevel/{component,contact,routes,vertical}.test.mjs
EAST_BASELINE=/tmp/r158-east-interior-cumulative-0044/world.json SOUTH_BASELINE=/workspace/scratch/02a8023d1a85/r158-luanjia-south-evidence-2051/world-summary.json EVIDENCE_OUT=/tmp/south-twolevel-world.json node --test tests/r158-luanjia-south-twolevel/world.test.mjs
# 正常接线后上条只增加 NORMAL_INSTALLED=1；不要另装wrapper。
node --test --test-concurrency=1 tests/r158-luanjia-south-twolevel/{component,contact,routes,vertical}.test.mjs tests/r158-luanjia-east-twolevel/{component,contact,routes,vertical}.test.mjs tests/photo-fidelity/batches/b-principal-stair-contact.test.mjs tests/r158-donghua/contact.test.mjs tests/r158-wenyuan-stair-contact/contact.test.mjs
```

原件仅/tmp/r158-luanjia-south-twolevel-0121非持久本地；远端只本说明、命令、SHA与自制PNG，未上传官方原图或原日志。合跑环境复用EVIDENCE_OUT使local-terminal.json最终是文渊旧测试输出，不冒称南新4原帧；南新局部请读local-final.json，World请读world.json。没有新试玩包、部署、main/branches改动。
