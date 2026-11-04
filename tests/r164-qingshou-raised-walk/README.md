# 庆寿堂组群南端甬道

基线ee19cd0d013735cf44075cc1b8c6f1d5c178f399。官文236539与官图8395支持抬高石甬道和侧阶；这里只连接两处已有模型台明。2.6m宽、4.75m长、0.5m高和两侧各四级均为通行拟合。两同名I29对象身份边界未解决，不新造第三/四院或宣称整组完成。

- 轻量：node --test --test-concurrency=1 tests/r164-qingshou-raised-walk/{component,navigation,controller,lifecycle,go,source,ledger}.test.mjs
- 实际宁寿：node --test tests/r164-qingshou-raised-walk/production-zone.test.mjs
- CPU三角示意：node tests/r164-qingshou-raised-walk/preview.mjs /path/to/preview.png，不是GPU光照/纹理验收。

真实FirstPerson/CollisionManager/Teleport；时间、输入/视角及go的ZoneManager为夹具，生产单区另用真实ZoneBase。84正向/绕行/前后连接、8原窗阻挡；脚本转弯减速，不等于任意持续冲刺。旧源模型完整冻结摘要对ee19；仅两条接近路线各前两点、共四点被新石面覆盖的高度通过严格断言后归一，无旧几何/物理排除。源文件只允许各一import/调用。

初次绕行端点z430距旧台明边0.45m，小于玩家半径0.5m，旧台明本会托脚；改到真地面z430.3，不改物理。独审发现BoxGeometry构造内写UV后抛错可漏释放未登记本体；现校验只用标准typed-array，渲染BufferGeometry先登记后填属性，1/3/9次非空UV故障与九块全部属性/索引/groups对标准Box逐字节对照均覆盖。原地图/前端正式名和公共Teleport守卫不改，缺少真实石面仍拒绝庆寿传送。

完整World、浏览器/GPU/手机、Node20、Mac温度及测绘尺寸未验。已存在景祺门楣跳跃边界不在本轮修复。历史单区入口以各自原时点为基线；本轮生产入口覆盖完整ee19旧对象及全部累计通路，不把有意新增物理称旧字节完全未增。
