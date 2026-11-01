# R157 累计：后右高台 / 中和小陈设 / 太和铜龟鹤

基线远端5b83065fd660fa5f7c68e8cbfa5266aa779a80e1；本地运行提交40ba814002ee6ece7ef2c926da219c122cb96c73。
依次整合：后右191a5259、铜龟鹤1d92b913、中和作者f0657dbf精确摘取为40ba8140。相对5b只有6个生产路径；全局控制器、碰撞管理器、场景布局/data及所有其它已交付实体不改。用户branches/main/Pages未修改。

## 本轮实际终态
- 76/76选定组件与真实中和片段控制路线：后右6+既有有效9、太和铜物4+日晷嘉量9、中和新6+原42。原rear历史98cfd572对象在父浅clone同样缺失，明确排除1条依赖历史Git的检查，不改该断言；历史中和5红1绿父同红按作者记录保留，不称全套绿。
- 同一个真正完整World：52/52循环往返、14381原帧。后右24/8004帧（.150333m），中右4/2096（.212778m），后左4/987（0），中和四门4/2122（0），太和四铜物原外围16/1172（0）。数值为本轮max|feet-ground|，不外推全城。
- 原后右32记录逐字等独立候选World，三组物体合批未造成该路线回归。实际World确认4铜物来源记录、26中和新实体三角owner，原后右横墙高位仍阻挡。没有注入provider/替代controller。
- 完整应用/gugong/构建605 modules、exit0；clean运行提交40ba8140，指纹9ff1ee398e68612c9171f2ddff809045bd2d6925a7aa0817b0c7143cf479b601，内部release仍R146-fix，如实保留。旧大chunk警告保留。

## 变化与边界
- 后右：自身官图的高灰台/宽长坡/白栏；原门/柱/南北独立面/叶完整升1.8，双坡宽8、长12。北坡是工程通行延续，非实测；后左、横墙、邻廊位置保留。
- 中和：只替两个过大旧鼎为细腿/浅托/小件，三腿数/器名/背面未知，不声称考古复原；26真实闭件三角碰撞，空隙不再用旧整盒封死。
- 太和：仅两旧扁球铜龟/两锥柱铜鹤替为可辨主轮廓，原位置、石座、39碰撞/0支承和其它陈设签名不变。固定代理内拟合，不追雕鳞；普通身体仍不能进入保留安全代理。
- 各候选自有图/平色CPU和原红/绿完整保留。CPU非GPU/真实材质手机验收；不称37项整体用户验收。历史全局zones等旧红未在本轮解决。前一份5b可试玩ZIP尚未包含这三改；须新累计包绑定新源码后才能宣称已分发。

## 复跑 / 回滚
```
node --test --test-concurrency=1 --test-skip-pattern='Rear-gate historical' tests/r157-houyou-high/component.test.mjs tests/photo-fidelity/batches/rear-axis-gates.test.mjs tests/r157-taihe-bronze/component.test.mjs tests/photo-fidelity/batches/taihe-terrace-instruments.test.mjs tests/photo-fidelity/batches/r157-zhonghe-stands.test.mjs tests/r55-zhonghe-routes.test.mjs
EVIDENCE_OUT=/tmp/r157-world52.json node --max-old-space-size=1024 --test tests/r157-cumulative-1408/world.test.mjs
VITE_BASE=/gugong/ npm run build
```
归档stored/rawSHA按原字节；源本来是.gz者rawSHA指其原压缩文件字节，不是再次解压后的正文。私有官方图片不归档为生产素材。回滚保留5b远端开发分支与17170995B累计包；不得改用户branches作为本轮发布手段。
