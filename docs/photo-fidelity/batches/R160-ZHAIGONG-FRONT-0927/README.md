# R160 斋宫前殿＋三间抱厦（有限候选）

基线 `1b91d942d3ce0c9643ecc7c5df91e30e54c19cd5` / tree `0366d4668c0df1094e62c540548f83d65cac289b`。仅新增一个专属模块；作者未装生产 hook，未运行全 build/GPU。原 E61 的斋宫 `FC-8D4739DF1E` 仅前殿局部，不把全斋宫/诚肃殿验收或计作新对象。

## 自身证据与拟合
- [故宫斋宫词条](https://www.dpm.org.cn/explore/building/236463.html)：五间主殿、黄琉璃瓦歇山顶、前出三间抱厦；中三间隔扇、两梢槛窗。
- [自身正面斜图](https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e98392602dde.jpg)：红柱前廊、低灰台、三处石阶及中央白栏的大形。图文独立本地 SHA 见 PINS；官图/HTML 不提交仓库。
- 位置、全部尺度、抱厦具体屋面/相接方式、隐藏背侧、叶数/简格、粗色及栏细节均工程拟合，不称测绘或现代整院复原。照片闭门，候选闭门但前廊可接近；无 room/map/内陈/后殿/配殿/现代彩鹿。
- 全几何界 `[-108.820179,-77.179821] × [238.78,264.5]`、最高 `11.059958m`，严在先验盒 `X[-110,-76] Z[238,267] Y[0,12]` 内（地面 Float32 误差约1.2e-8）。低台 .8m、三组四级 .2m/1m 真石阶，14 个真顶 `rescue:false`；不加认证/隐形坡。127 新 owner = 113 各 mesh 的真实三角体 + 14 石 Box，体与外观流组件逐一校验。

## 有限验证（不得把下面合写为全绿 World）
- 先验正常三分区 east-six/garden/axis-courts＋全局实体；`loadAll:false/reuseInactive:true`，非动态流式测试。98,221 相关可见三角与旧 collider/support 对盒相交均0；4,331 半米网格水/半径.5身体阻挡0。
- **10/10 轻项终态**：7形体/UV/owner/资源/守卫＋3真实快照和原 raw 有界契约。正常 finish/dispose 一次，拒重复/错区/变换/冻结数组；不声称任意 late-publish 异常原子回滚。
- 作者 QA 在 `CourtKit.finish` 前只给 east-six 注入一次。原 east-six 1348 collider/61 support、原可见流/room/map 保全哈希硬同。旧两长街的原腿30Hz走跑四往返 **3315帧完整对象同先验**（不是整条跨宫路线）。新三阶10Hz走/60Hz跑六往返 **371帧全部到达**，闭门/背墙/柱三负控拒绝。
- **原 World strict 进程 exit1 保留**：走峰 .102m；跑中央 .429778m，>.3 共10帧(.167s)，两侧各 .387667m/8帧(.133s)。中央峰在toe外.4215m、.133s后落地；侧峰在末级上、.2s后落地。上行原生抬脚插值可低于踏顶 .228m，不宣称脚点绝对零嵌入。用户实用授权接受短时跑落差，未改几何/共享物理。
- `ACCEPT_DOCUMENTED_RUNOFF=1` 为明确 opt-in 有界功能模式，仅本六组合与已知峰/帧界；默认仍严格 .3。离线测试证明原 strict 仍拒、有界仅接受记录范围。作者未再 World 重跑有界模式。
- 历史红全部保留：missing-builder 7红；误材质 `wood_door`→既有 `wood_column`；两构造 QA 错误（finish前null材质、快照引用随append增长）；离线帧数口算471→真实371。后两构造红不是产品通路失败。
- 两自制 CPU 为真实几何的平色 z-buffer，亲看五间/低抱厦/三阶粗形；无 GPU、纹理/灯光/手机或内部实景验收。

## 唯一集成人接线与命令
在 `src/scene/zones/ZoneBase.js` 导入 `buildZhaigongFrontHall`；所有已有 finalizer 后、`this.kit.finish()` 前恰一次：
```js
buildZhaigongFrontHall(this.kit, this.zoneJson.id);
```
保新增奉先接线；非 east-six 返回false。作者未动该文件。正常模式禁 QA 注入：
```sh
node --test tests/r160-zhaigong-front/component.test.mjs tests/r160-zhaigong-front/evidence.test.mjs
NORMAL=1 ACCEPT_DOCUMENTED_RUNOFF=1 OUT=/tmp/<unique-dir> node --test tests/r160-zhaigong-front/world.test.mjs
```
原件仅本地 `/tmp/r160-zhaigong-0922/`；`BASELINE` 默认 `scan.json.gz`，离线 `RAW` 默认 `world-native-gap-red.json.gz`。最终 world QA 相比已执行第三版仅原样抽出快照函数、增加显式有界契约；原输入/控制器/实体未变。全构建与正常接线由唯一集成人关闭。
