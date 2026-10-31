> 本页保存f43组件阶段原结论；后继累计World/full/batch/build终态见[cumulative-1049](cumulative-1049/README.md)，不倒改本页早期测试身份。

# 午门右掖门：一片已辨外表面的门钉局部实现

基线/回滚 be395c519ddf9a9050382a2cabb770c1f0d10a23；新开发分支 feat/r157-wumen-right-leaf-20261031。未改main、未部署、未上传；Astra终态独立29/29，有限本地候选接受；独立原源码负控实际红，报告INDEPENDENT-FINAL-REVIEW。不是整门/午门整项完成，不改变37对象严格完成0。

## 实际范围
只在既有 `west-yemen`（右/西掖门）hinge side+1 的外表面添加 **69个可见位钉帽**。两明确无钉位 r7c8/r8c8不补；r9c1护栏遮挡 UNKNOWN不造，不把它称作缺钉。r8c7独审确认有帽，已保留。照片行从上到下1–9，列左到右1–8；图证是72位置的8×9布局，不是现存72颗。未给其他三片侧门叶或背面复制，未作铺首/门环/格门、补配磨损或锁具。

石刻门名确认右掖门；摄影者、拍摄年未知，不能宣称2026现场。原图不入库，SOURCE-PHOTO记录URL/SHA；独立图证/矩阵报告不是生产验收。朱庆征古建部原文72总位与此自身图交叉佐证，不借用东华门贴图；原文门洞尺寸/地坪/断面仍未解，没有改洞尺寸。

## 朝向与拟合
右/西gate frame在x+40.6、localz−16.5，rotY+π/2。目标是hinge side+1，leaf local−Z外面，闭态法线world−X，开90°法线world+Z。照片列左→右对应leaf +X→−X；缺位不镜像。中间π/4铰角也核相对矩阵不变。

可见位置归一化适配现工程叶宽高；u=.065至.94，v=.035至.97，钉半径width×.0275、球冠高.015m为**工程拟合，不是源测绘**。当前叶1.78×5.2m继续不变。本次既不校正旧门比例，也不把这个拟合升级为真实历史尺寸。颜色/粗糙度为非采样材质拟合，CPU没有纹理/实时光照。

## 实体与物理边界
钉帽是装饰，不新增碰撞/地面。球冠从原叶外面−.11向外到−.125（最大15mm视觉外凸）；不宣称每个装饰帽均有碰撞。独立帽组作为同一hinge下与leaf同位兄弟，保持 `door-solid` 对应原.22m实叶实体，开闭共铰链。原452碰撞/16支承及723既有对象的已记录字段（geometry attr/index/groups、世界matrix、userData及列出材质字段）在开闭两态与hook前be395逐项摘要一致；该signature不穷尽castShadow/receiveShadow、texture map等全部Three属性，非目标源码字节不变另作限定。原点、通路、洞顶、其他叶、全台/马道不变。

第一版把帽作为leaf孩子，原19测试的四个“整个leaf包络=物理实体”断言红；不是掩掉红或扩大碰撞，重划明确的视觉装饰对象边界后原19逐字通过。旧红保留。全真实帽顶点/外法线/非零三角、15mm范围、相对leaf矩阵单独测试；不借兄弟组逃避视觉检查。

## 测试与真实生产路径
- 初TDD实入口缺组红；第一次baseline含主楼metadata内随机material UUID导致非目标不稳定，诊断明确只规范随机UUID后，在生产改前重录baseline，保原基线和红日志。
- 新10+原lower19 = **29/29**（focused-contact-1044；此前9+19的1040轮单独保留）。原lower19无修改。包括开/闭态、三种铰角、缺位、实际几何、资源退役一次、重复/非法host拒绝、旧物理/几何漂移负控。
- 共享verify新增隐藏组/组scale2/列翻转/删除r8c7/补缺位负控；祖先有效visible、group与leaf局部matrix及每个实际cap→leaf顶点均核。
- `canonical finish`使用真实PalaceBuilder.finish、realTextureLibrary、真实merge；两态实际合并单材质帽网格顶点精确等于69×132三角的来源实体。scope证据随architecture metadata进入生产（第一次未入meta先红，后仅新增组structure修复）。不是仅手动调用候选函数。
- 原leaf/其他对象与旧物理baseline不变，所有旧golden/原测试未改。完整full/World/浏览器GPU未跑；旧R159210失败未被宣告解决。

复跑：`node --expose-gc --max-old-space-size=512 --test --test-reporter=tap tests/photo-fidelity/batches/wumen-right-leaf-studs.test.mjs tests/photo-fidelity/batches/wumen-lower-five-portals.test.mjs`。

## CPU图证
cpu-1037三组前/后图，均实际buildGate门组件的三角形，不改叶姿态；“before”仅在导出时剔除精确新帽组，是已由be395非目标金样支持的反事实旧外观，不冒称独立旧checkout截图。同组before/after相机相同；无源照片像素、无GPU、非整城。

cpu-1036首轮开门正视从远处被另一片实际叶遮挡，完整保留，不算可见验收。1037只把诊断相机放到两叶之间，未删遮挡叶/修改门角。闭态图可见目标与旁边无钉旧叶，这是严格单片范围，不把另一片已完成。最后source metadata更新后1039重新导出六个压缩mesh输入逐字相等，保PROOF新旧身份，不重标旧PNG为新GPU。

源码最终冻结source-final-1045共590 src/data：既有仅LowerBase import/call/comment，新增WumenRightLeafStuds；精确去hook/还原注释后旧LowerBase逐字回到be395。QA最终独立1045冻结；最终审查与后续归档另列。

最终1042以最后helper重新导出六个输入，逐字=1037；PROOF-final-1042与CPU-REUSE-1042保留新摘要与复用边界。两门叶组件before24→after9132三角，非全门/World。独审已用SHA锁定be395旧LowerBase实际重建确认baseline开闭记录来自原版本，非反向录制。

额外旧主楼/翼亭接口两文件5/5（existing-main-wings-correct-cwd-1043），与28分开计数。首轮误从workspace执行，wing三子项因git rev-parse非仓库失败，main2过；源/断言不变，改在repo cwd运行即5/5。原失败日志保留，不冒称初轮通过。

接触尾检真实RED(-.111不等于木面-.11)→GREEN：取消原工程1mm空隙，帽赤道精确贴木面，外凸15mm；此为实际几何修改。原1037/1039/1042图证成为历史，不重标。cpu-contact-1045六输入/六PNG全重导出重渲染并亲看，source/QA以1045为准。新29/29与旧主楼/翼亭最终5/5分别通过，无World。第一次接触命令因cwd与相对前缀重复未启动/未写源，仅launch error而非有效测试红，原日志保留。

来源尾查：右掖门JPEG内EXIF DateTimeOriginal=2017:02:18 13:52:18（Nikon COOLPIX P310），左Wix为同日13:51:01；这是未独立认证的文件内元数据声明，不能据此锁定可靠摄年，更不能称2026现状。保留captureDate=null并另存metadata claim；生产source冻结不变。
