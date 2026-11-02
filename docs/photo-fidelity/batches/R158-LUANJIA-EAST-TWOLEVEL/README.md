# R158 銮驾东五间：空置双层游戏体验试点

Base `91fdf605f5cd096318cbe6fd38a56ecd4875494b`，独立小树 `r158-luanjia-east-twolevel-2348`。父23:47批准前述最小设计；23:55另批准仅新真实23面的私有局部接触。只新建两runtime模块及B三行前缀，不改南翼、东翼原厂模块、ZoneBase共享hook、数据、Collision或FirstPerson。

## 官文与游戏适配
[官网236525](https://www.dpm.org.cn/explore/building/236525.html)只确认东五间、黄瓦硬山、内部上下两层；没有本体室内官照、楼板高度、梯位、门位或现行开放证据。现东翼25×9m/中心/朝向均继承原工程壳，不改屋顶。楼板顶3.3m、厚.16m；20个实体踏步（常规踏面.33m、升高.165m，末级为1.2m真实平落脚台）、2.2m梯宽与1.1m安全挡墙，以及沿原拟合红闭板位置的2.2×2.7m入口，全为**可逆游戏工程拟合，不是历史室内复原或现实开放许可**。

保持空置，无新窗、仪仗、库架、房间分隔、失去建筑或连通南翼的桥。地图附“空置两层游戏适配（非室内复原）”，实际合并architecture metadata含详细适配/未知声明。`wholeObjectAccepted=false`和未核官照状态保持。该试点不把原41项整组变为历史实景完成。

## 可见与实体
真实切开原闭板背后的整砖墙，只替换该墙/闭板两对唯一原mesh/owner；其他15东翼原mesh、南翼和旧碰撞引用保留。先构建完整候选再发布，输入错源/重复/变换/原owner错配/冻结元数据在修改前拒绝；不夸称任意恶意dispose事件或late-publish异常事务回滚。

新68个闭合可见盒：3门洞墙段、3切洞楼板、20实梯和42防护段；每件单独实际owner。20踏步＋3楼板使用与最终Float32可见盒**字面同界**的原生Box，不用整屋大盒填空气；其余45件用完整最终三角。楼板3个flat-soffit严格同可见实体上下界，原生顶头止于楼下约1.439m，`rescue:false`不从楼下吸上楼。梯井没有整块假楼板或隐形坡。

首轮triangle踏面在.5m身体碰撞前、.3m原生脚查询后出现首级拒绝，原件保留；切换字面Box后走路通过、跑步下降出现1.307m真红。楼板顶头负控随后又抓到Box缺少上行顶头，于是只给实际3平板标原生flat-soffit，并增加真实顶端落脚台。中途失败不是验收通过。

## 私有23面接触
`LuanjiaEastContact.js`仅在本适配器成功发布后认证20实际踏面＋3实际切片楼板；不分配任何支承、不加虚拟坡、不扩旧65/东华/文华/箭亭/南三所/文渊名单。实际宿主、原始面引用、clone后的私有证书、全部新实体及精确边界逐次核对；缺/重/改/复制或实体删除即失效。

普通低帧率行跑只在连续完整脚印覆盖、真实地面、既有最大速度范围内贴合实际离散踏面。跳跃、上升、高落、侧出及楼下无权吸附。真实薄障碍保留连续扫体拒绝。

既有通用扫体不支持overhead：对**这3块认证字面平板**，先以其原可见完整三角做full-feet-to-eye连续SAT，再复用原扫体检查其他实体；绑定原CollisionManager的端点、水与动态检查始终保留。绝不对未知/其他overhead开放例外，不改全局运动政策。

## 有限验证与边界
作者未安装生产hook、未跑全站build/GPU/移动端。World使用真实91fdf场景/原生控制器与实际材质接口、outer-east及全局实体，**仅before-finish QA安装新适配器**；不是正常接线已通过。正常集成另由唯一集成人验证。

- 新局部18项：4行跑往返1460帧峰0，顶头跳跃止于1.439m后回地；高落先airborne、自然落实际足印踏面2.475m；侧栏拒绝；复制/缺重改面、薄阻体拒绝。
- 实际World：新4条两层往返1460帧峰0；原东翼外路8条2383帧每条完整帧SHA与2037基线逐字相同；原东华4条诊断完整结果逐字同基线。到达与旧诊断口径分开，不冒称全部旧诊断皆到达。
- 原B9＋东华2＋文渊10共21项定向最终全绿，结果见PINS；首次因稀疏树缺2个既有fixture失败，原日志保留，补物化原字节后重跑，不改旧断言。
- 4张实际几何CPU已亲看，平色/无GPU贴图口径；楼下、上梯、楼上梯井与外入口。所有原始小记录仅/tmp本地，PINS绑定SHA，不宣称已远端备份完整原帧；只记录逐帧断言、完整帧hash及摘要，未落完整帧JSON。

## 唯一集成人接线
B三行已在候选提交中，逐diff摘取；共享hook只交以下patch：
```js
import {finishLuanjiaEastTwoLevel} from '../palace/special/LuanjiaEastTwoLevel.js';
// 现buildLuanjiaEastWing与buildLuanjiaSouthWing均完成后、kit.finish前恰一次
finishLuanjiaEastTwoLevel(this.kit,this.zoneJson);
```
禁止安装后再用QA注入叠加；本轮World test支持 `NORMAL_INSTALLED=1`，此模式绝不安装prototype hook，强制实际合并metadata/23认证面存在，无fallback。

```sh
node --test --test-concurrency=1 tests/r158-luanjia-east-twolevel/component.test.mjs tests/r158-luanjia-east-twolevel/contact.test.mjs tests/r158-luanjia-east-twolevel/routes.test.mjs tests/r158-luanjia-east-twolevel/vertical.test.mjs
BASELINE_REPORT=/path/to/2037/luanjia-world.json EVIDENCE_OUT=/tmp/luanjia-pilot.json node --test tests/r158-luanjia-east-twolevel/world.test.mjs
# 接线后仅上条命令增加 NORMAL_INSTALLED=1
```

最终原件：`component-identity-final.*`（18/18）、`old-contact-final.*`（21/21）、`world-identity-final.*`（exit0）；CPU最终源metadata调整后的完整几何/相机字节与4亲看PNG所用流逐字相同，见`cpu-full-stream-equality.json`。最终状态为作者隔离可审候选，等待Astra及正常接线。
