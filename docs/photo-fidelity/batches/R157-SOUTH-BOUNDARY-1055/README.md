# 庭院南界四段：保留实墙，有限外观拟合

基线 fefdd450；仅 axis-courts 原9/11两条横墙的灰砖/红墙分界由1m改为既有昭德、贞度门台高3.216m。是照片与现门台关联的**工程估算，非实测**。原墙总高7m、X/Z包络、门洞、普通碰撞/可走面保持；38–41四段廊主体、门身/主通路、数据及所有其他对象不变。不新增第五段，不发明北向外廊或室内。

## 为什么撤掉北廊提议
新取官方公开group8/11的当前命名视点明确有“太和殿南庑（昭德门东）”和“太和殿南庑（贞度门西）”。其封面以及两门正面显示高灰砖台与连续红实墙，并不支持在这个面拆墙开廊。旧北点2092/2075封面朝太和殿，不显示目标背面，不能拿点位名当立面图证。原北向6.6m扩廊/削墙草案已撤销，未实施。

当前命名与四段位置关系得到新佐证，但1991/1992修缮记述的确切范围仍未核定；也不据这些图断言所有未见面无廊。

## 实测与图像
- 3/3组件：真实原灰砖/红墙体分割，原碰撞逐对象完全同，非目标默认墙与全部layout不变。
- 1顶层真实World测试，昭德/贞度各10/60Hz走/跑完整南北往返，共8/8到达、4695原帧；四处原闭墙负例仍拒绝。不是37项完整路线验收，未修改原阶梯/重力。
- 两角度前后CPU：来自实际门、四廊和横墙全部18572三角，**平色材质分类，不是真实贴图/GPU**。图中的原屋面/墙包络保持，不声称已复刻所有源图细节。
- `npm run build`：/gugong/ base、599模块、exit0；构建身份是基线fefdd+本轮dirty源码，详EVIDENCE，不伪称clean commit。

初版QA手动buildGate遗漏gateWidths登记，致横墙没生成；早component-red/first-green和早CPU属于QA错误，均保原日志，不充当真正产品红/视觉前态。纠正后的actual-red为真实分界1m断言红。首绿色包络精确比较遇4e-8m Float32舍入；只将可见box范围比较设1e-6，原物理rows仍完全相等，没有改碰撞或通行容差。

官方图只作私有研究，不在包中分发。GPU/手机/实机与历史精确还原未验。此前试玩ZIP仍是旧版，未自动更新；保留fefdd回滚。

复现（仓库根目录，依赖已安装）：
```sh
node --max-old-space-size=384 --test tests/r157-south-boundary/component.test.mjs
EVIDENCE_OUT=/tmp/r157-south-boundary-world.json node --max-old-space-size=1024 --test --test-concurrency=1 tests/r157-south-boundary/world.test.mjs
npm run build
```
无需为本外观项重新跑所有历史路线。原始官方metadata、真正红绿、错误QA日志、World原帧与构建日志均按原字节gzip留存；源码指纹见EVIDENCE。
