# R158 传心殿值房暂定外壳

底 `97420d8d9742bccea11d1a77869e9b9aab67cf96`。原ID `FC-92B6D8420A`。仅新增 `ZhifangShell.js`，正常hook待唯一集成人；不是现代建筑照片复原，也不证明现存实体身份已查明。

## 依据边界
故宫建筑网页236526及黄燕虹2001官刊p21支持“传心殿后值房五间”。网页/文章同作者同源，不当两次独立证明。阿乐官刊p1非测绘草图将“值房”画为北端横排，可作为暂定相对布局；不是尺度图。**没有自身现况立面照片；屋顶型、瓦色、朝向、门窗均未证**。不从主殿黄瓦硬山传递给值房。

父明确批准这些未知项目均标工程拟合后继续做暂定壳。因此本候选采用中性灰色两坡硬山状壳、南向柱线、素实墙；这只是选择，**不是史实判断或实物颜色**。六条柱线表达官文五间，无门扇/窗格/吻兽/彩画/室内用途复原。封闭游戏外壳不等于现实全实墙或禁止开放的证据，不另造无依据穿越门。

`currentExistenceVerified/modernFacadeVerified/roofVerified/tileColorVerified/orientationVerified`均false；地图标注 `值房（官文五间；屋顶朝向暂定；无现况图）`。祝版房、神厨保持未建/身份未决，不能拿本候选解决其曲尺房互认冲突。

## 位置和物理
中心(-236.5,-166)，宽18.5m、深6m、檐3.9m、拟合脊5.8m；所有米制为工程拟合。完整网格含屋檐、台边限于X[-247,-226],Z[-170,-160],y<8。无院北墙，不宣称沿河狭带开放新出口。既有主殿、景行、治牲、井亭、原路与河道不动。

地面石板顶y=0的真实实体，所有可见墙柱顶都以自身三角形绑定碰撞；0新walkable，无虚面/接触例外或全局控制器修改。闭壳仅供外观/绕行。

先实际扫描才写源：loadAll:false加载outer-east及当时global实体，非全分区；旧AABB占用0，903个0.5m身体/水域样本全部允许。当前几何、路线及CPU终态见SUMMARY；原始日志/逐帧数据仅本地并列SHA，不复制大源图。

## 重现与集成
非cone稀疏作者树仅12MB。测试期间 `public` 临时只读符号链接指向既有集成树资源，未改变任何公共资源；链接不提交，冻结前移除并重施稀疏。正常完整集成树直接用其已有public资源。作者树重现需先恢复同样的只读资源链接或使用已有完整树，不得因低盘大拷贝资源。
```
node tests/r158-zhifang/scan.mjs
node --test tests/r158-zhifang/component.test.mjs
EVIDENCE_OUT=docs/photo-fidelity/r158-zhifang/world.json node --test tests/r158-zhifang/world.test.mjs
node tests/r158-zhifang/export-cpu.mjs docs/photo-fidelity/r158-zhifang/cpu
python tests/r158-zhifang/render-cpu.py docs/photo-fidelity/r158-zhifang/cpu/front.json.gz docs/photo-fidelity/r158-zhifang/cpu/front.png
python tests/r158-zhifang/render-cpu.py docs/photo-fidelity/r158-zhifang/cpu/oblique.json.gz docs/photo-fidelity/r158-zhifang/cpu/oblique.png
```
World只在QA before-finish加候选，原对象数组前缀/子对象不变；并非生产正常hook验收。注册测试是前置/重复/变换/冻结守卫，不声称晚发布失败回滚。CPU仅真实网格平色诊断，非GPU/手机/实景色彩验收。未跑全历史套件或Vite构建；唯一集成人在正常接线后做必要累计验证/构建。严格每阶段检查500MiB线；不上传8份raw，不产大文件/新包。

## 本候选终态
3/3组件通过（原3条missing-builder真RED保留）；5/5路线3185帧，脚地差峰0m，2/2南北闭墙拒绝。两次绕行分别10fps步行/60fps跑步；另3条原东华东西路、桥侧接近路、文华外夹道往返。6756三角、22碰撞组、0walkable；2小CPU已亲看，颜色与形制明确未证。没有构建/全历史套件/GPU或全分区声明。8原raw总量不足1MB保本地。测试公共资源链接已移除、稀疏reapply，无基线公共文件修改或删除。
