# R259 大佛堂“萬壽無疆”主匾：有限组件 WIP

2026-11-10。新增实际主匾组件与固定文字素材；ASSET和GREEN有限检查通过，VISUAL整阶段失败。不是整堂、当前博物馆陈设、全宿主资源或可发布版本验收；不增加建筑整体验收数，不修改main或部署。

## 直接来源与现代近似

- 王家鹏，2015《慈宁宫大佛堂调查记》，印刷页306正文、307图24：明间正中主匾，整匾纵144cm、横386.5cm、厚4.5cm。来源：https://img.dpm.org.cn/Uploads/File/2020/02/26/u5e56176b64d88.pdf 。图24金/黄色地、黑色繁体字；画面左至右为“疆無壽萬”，语义右至左“萬壽無疆”。照片是室外临时支放，不是原挂位测量。已亲看该图及印刷页301的仙楼立面/剖面；后者不提供完整主匾安装测量。
- 2014论文印刷页080正文再次记“仙楼佛龛顶上悬挂”及同一整匾尺寸。来源：https://img.dpm.org.cn/Uploads/File/2018/06/04/u5b153792a88ab.pdf 。仅确证相对位置，不确证本模型挂高、前后深度或吊件。
- 产品PNG为本次自行栅格化的现代语义文字，不裁切、上传或再分发官方照片。使用已安装NotoSansCJK-Regular.ttc face3，实际名称Noto Sans CJK TC Regular、Version2.004；不是康熙原迹、刺绣、题款或纹饰复刻，不依赖浏览器系统字体fallback。
- 实际字体名表版权为©2014–2021 Adobe；安装包字体归属同时列Google2010–2012。完整适用SIL Open Font License1.1、字体SHA、来源与现代近似声明随public中的SOURCE-LICENSE.txt保存，未混入Debian包装GPL正文。未分发字体二进制或字体子集；OFL明确不要求字体生成的文档采用OFL。

## 已实现范围与拟合位置

独立DafotangMainPlaque.js创建2网格、14三角：素背薄板与单面文字平面；专用2材质、1纹理。总外包络严格按3.865×1.44×.045m，框色带在纹理内部，不在来源尺寸外继续扩框。正面与南表面共面，负polygonOffset处理深度，不增加物理厚度。背面无复制文字。

固定产品素材：
- public/textures/dafotang/wanshou-wujiang-modern-tc-r259.png：768×286 RGB、11151B，SHA256 8b814c7439788f2eb0f4bedbe08f7e674de18120d0bb4f1d38e1175943f8e70e。
- 对应wanshou-wujiang-modern-tc-r259.SOURCE-LICENSE.txt：5997B，SHA256 0eb3f5c26fc702117dc11b64f2e5d5bc1dbef27ec0476dbe7eb4f091c287bac9。

安装中心[0,7.25,4.4]、朝南-Z；本地+X是南侧观看者左/西。外包络x±1.9325、y6.53..7.97、z4.3775..4.4225。除整匾尺寸外，挂高/深度/方位、素背、简色带及配色均为MODEL_FIT_NOT_SURVEY。未伪造吊索或挂钩。

源代码关系：现龛顶6.45，候选底6.53留.08；天花底8.20，顶7.97留.23。纵梁在z±2.7，最近横梁在x±3.264285714，不能把梁底7.90当成覆盖全室的平面。安装前要求现有顶枋完整实际包络、龛组identity/visibility和实际梁叶存在，并逐旧Mesh临时计算world AABB；不写旧geometry.boundingBox。Object3D正常矩阵缓存/dirty flag刷新属于明确允许的检查缓存工作，不称拒绝路径完全零副作用。

这些是有限组件/合成宿主包络检查。未加载或测量本版本真实整堂宿主；未通过真实宿主的遮挡、可达性或悬挂结构验收。主匾作为装饰不新增colliders、walkables或rooms，不提供支撑/阻挡承诺，飞行相机可以穿过；底6.53只支持当前地面观察拟合，非全堂可达性证明。

RemainingOuterHalls只新增一个import及一次大佛堂条件调用，位于现有梁/承檐环之后、屋顶之前。保留原外“大佛堂”匾、佛像/三佛/韦陀、双塔、东西墙框、照片机制、旧房间和导航；GatePlaques与TriangleSupport不改。

## 字符、资源与生命周期的有限通过结果

RED只观测一次预期缺失组件断言；不声称26个合同逐项执行过RED。自包含新测试先于组件编写，随后在准入前补强异常与处置合同。

ASSET唯一一次通过：真实PNG保存、Pillow解码同字节与像素回读、TC face3/cmap、4个不同可见墨迹区和来源许可均通过。采样RSS64471040B、waited/final64602112B，CPU .569816s，含清理wall .577430s，stdout128B、stderr0；leader reaped、最终组空。已亲看PNG，四繁体字可辨，无方框、裁字或伪印款。该项不证明3D朝向或浏览器加载。

GREEN唯一一次26/26：新主匾8项，旧东框/西格面/双塔18项全部保留。两份旧host-hash测试仅严格逆掉新增import/call两行，再核原SHA，其余原断言不变。采样RSS99397632B、waited/final99586048B，CPU .627145s，含清理wall .359038s，stdout6811B、stderr0且未截断；leader reaped、最终组空，各独立资源/功能/postpin门通过。

新合同覆盖总外包络/实际UV与朝南法线、素背、两Vite base路径、hidden→ready/failed/disposed、错误尺寸/抛错getter、处置后的迟到回调、几何先处置而不可复活、keep重挂/重复拒绝、所有权一次清理、发布与同步请求失败回滚、龛/顶枋x/z变更及障碍拒绝、当前函数字节接线顺序和固定PNG/许可SHA。ImageLoader受控回调只验证生命周期，不冒充真实PNG解码；字形证据来自ASSET。

从仓库根目录，GREEN实际执行的组件入口等价于：

```sh
node --max-old-space-size=128 --max-semi-space-size=8 --test --test-isolation=none --test-concurrency=1 --test-reporter=tap tests/current-state/dafotang-main-plaque.test.mjs tests/current-state/dafotang-east-cabinets.test.mjs tests/current-state/dafotang-west-cabinet-height.test.mjs tests/current-state/dafotang-wood-pagodas.test.mjs
```

这条普通Node命令自身不提供外部RSS192MiB、CPU10s、wall20s、日志、磁盘或QA目录资源门；本次通过还依赖独立的一次性监督器。它不是全项目测试、构建、真实整堂host或GPU命令。仅文档记录，不表示已获重新执行许可。

## VISUAL：失败保留，不追认为通过

唯一准入运行使用实际主匾在支撑盒合成宿主上的顶点/索引/UV导出，再以真实原PNG作CPU重心采样，固定正面384×192、斜面384×240；没有手绘文字替代或Canvas调用记录。Node导出成功2网格/14三角、4618B。Python已写两张PNG后，因pretty格式VISUAL-VIEWS.json超过既定8192B输出上限，在写清单前抛错退出；清单没有产生，VISUAL.result.json为FAILED。

原件两图分别5874B与8417B。作者、协调者和独审已亲看：正面和斜侧均可人工辨认“疆無壽萬”、金底黑字及简边，未见明显镜像、裁字或边框裁切。这仅是对失败运行遗留图片的人工观察，不替代完整阶段验收。冻结脚本与异常行显示，真实PNG解码、两视角bbox/probe和素背断言已在清单写入前按顺序走完；但具体数值未落盘，正/斜图片、投影余量、几何/素材身份和可见素背等清单后验门与完成摘要未完成。不能据前置断言走完或图片存在而追认为通过。

各资源独立事实仍保留：
- Node：采样RSS42336256B，waited44531712B，CPU .100114s，含清理wall .102061s，exit0。
- Python：采样RSS22470656B，累计waited上界44531712B，CPU .566075s，含清理wall .577581s，exit1。
- 两子进程合计CPU .666189s，总wall .679963s，峰44531712B；两leader reaped、最终组均空；stdout136B、stderr1276B。RSS/CPU/wall/日志大小/磁盘/QA总量门通过；VISUAL-VIEWS.json单文件8192B输出限额确实失败，并非所有限额通过，整阶段仍失败。
- 23项仓库输入、17项系统输入、6项准入artifact、32项旧阶段文件的postpin均保持。没有修改、重试、降分辨率、补清单或提高限制。

## 未实装与尚未验收

未制作历史书法/绣线、边龙/印款/题款、测绘吊挂、历史背面细节；未据主匾补齐小佛像、罗汉/擦擦、照片授权或整堂完整陈设。没有以此新增完成余16项。

原R255真实host192MiB资源失败继续有效。旧R256唯一512MiB诊断峰201.484MiB超过原192MiB门，机会已用，既非本版本host结果，也不冲销旧失败。本版本全host、Kit.finish/World、完整回归、构建、浏览器/GPU/真实设备和发布均未验收。正式381/397、余16、R179及恢复3/4状态不因本组件而改变。当前仅保全真实产品WIP，不能据此合并main或部署。
