# R158 FC-D4F3E359DE 西所中殿：文字大形候选

Base `901eddb194b4658eb1401362dd73bc5c6ce26b56`，独立树 `r158-west-middle-0151`。只新增一个运行模块 `NansansuoWestMiddleHall.js`，不改任何旧源/data/共享hook；不重绑旧北item13，不改现六host以及中、东独立中殿。正式ID只新一条记录，不把旧北壳复制改名。

## 来源及未验范围
故宫官网236452正文明确三所形制相同、各前后三进，中殿与后殿五间绿琉璃硬山。作者本人看过官方鸟瞰、示意map以及7996；**7996的标题是中所中殿，不是西所本体照片**。鸟瞰/示意只辅助序列，不是测绘。西所此体的当代身份、精确位置、尺寸、窗格、背面均未验证。

拟合中心(-251.8,53.5)、19×7.5m、檐4.4/脊7m，保持先验包络X[-261.8,-241.8] Z[48.5,58.5]。五间绿色硬山是文字支持；红框/灰台/四窗场与素闭叶仅同形类别工程适配，不声称西殿现况。metadata明确currentIdentityVerified=false、officialPhotoIdentityVerified=false、locationVerified=false、rebindsItem13=false、wholeCourtyardAccepted=false。无内饰、无现开放许可、无井亭/院墙推测。

## 实体与通路
41个实际可见Float32三角owner、7196三角、0新walkable/room，不加隐形坡、不修改控制器。前后闭墙是真实可见实体，z59横路保空。注册有错区/变换/冻结/重复前置守卫及正常finish/dispose测试，不宣称任意晚发布事务回滚。

先实际901基线World扫描：旧碰撞交叠0，861个0.5m身体/水点全清，z59横路61点清。仅outer-east加载+当时global，非全分区。
3条缺builder真RED后，3/3组件终态绿。实际原生World16/16接受路线3590帧，峰.1253948877m位于既有北阶；z59双向、两侧绕行、原西前入口/西北入口在10/60走跑均到达，另2闭墙负例真实拒绝。QA注入前后保全部旧数组前缀引用、所有旧children/metadata（含六host和中东体）不变。2CPU亲看、图注完整；它是平色几何诊断，不是GPU或照片还原验收。

## 唯一累计接线
作者未装生产hook、未全应用build。精确patch在本目录，只import及东所中殿之后的唯一call `buildNansansuoWestMiddleHall(this.kit,this.zoneJson)`。正常累计必须运行下列World时设置`NORMAL_INSTALLED=1`，此时QA wrapper不安装、calls必须0，实际合批西ID/map唯一记录与旧六host/中东记录硬断言仍在；不要在正常hook之后重复注入。

```sh
node --test tests/r158-west-middle/component.test.mjs
EVIDENCE_OUT=/tmp/r158-west-middle-0151/world.json.gz node --test tests/r158-west-middle/world.test.mjs
# 正常集成：上条额外 NORMAL_INSTALLED=1，且使用新输出位置保作者原件。
node tests/r158-west-middle/export-cpu.mjs /tmp/r158-west-middle-0151/cpu
python3 tests/r158-west-middle/render-cpu.py /tmp/r158-west-middle-0151/cpu/front.json.gz <front.png>
python3 tests/r158-west-middle/render-cpu.py /tmp/r158-west-middle-0151/cpu/oblique.json.gz <oblique.png>
```
项目无裸npm test脚本，本次按父授权仅有限组件/World，不跑全城、构建或飞行大套件。原始TAP/帧/几何仅/tmp非持久保全，PINS绑定长度/SHA，远端只摘要/命令/哈希与自制PNG；官方像素不入本提交。无上传/main/branches/部署。后续正常集成/build仍归唯一集成人。
