# R373 后左/后右门原源 QA 适配（待冻结、上传和 hosted 全区复验）

基于 R372 `5fc0cb10c019d89a641f548942025c3133c346d9`。1075 产品文件不变。不是新增三佛，也不宣称可合并或全区归零。

精确 axis-courts 原编号16/18、原对象身份、403 colliders/3 walkables、原可见 mesh geometry/matrix 指纹绑定。局部 fixture 包括原相邻墙，fullworld沿用全部邻居 CM，不删错误或白名单。

每门原控制器10/30/60Hz连续地面→12m坡→1.8m平台→另一12m坡→地面→返程，12 waypoint crossings，逐帧camera.y/x/z/feetY/groundY finite且feet>=0，最终地面真实raycast。不是完整渲染三角体逐帧不穿透证明。原controller平滑上下坡允许feet与groundY短暂不同，不能把两者严格相等误作合同。

保留原center→±8m净空、seed±4.7/radius16/forbid半4格网。seed高度取已绑定原CM的真实坡面，并与注册ramp精确线性定义核对。reachFrom仅新增finite非负初始feet诊断参数，其他调用默认0不变。额外要求真实坡脚±15.2以外4m净空，以及seed±15.9/radius27.2（坡脚外12m）BFS。旧feet0扫描/BFS单独报告；undefined legacy脚高标记无效，不再输入NaN做结论。

独立负例：原item复制、CM collider/support替换、source几何变动、frame位移、可见mesh删除、外来阻挡、地面删除、非法BFS高度。GPU/手机/完整路线未验，三佛网络取消与美术确认仍开放。R372实际7errors/28warnings，R373未跑hosted全区，不能预减错误。

本地受控合同测试23/23通过；旧R372回归结果另见记录。测试限时60秒、Node heap384MiB（不是RSS硬限）。尚未冻结、上传或运行hosted全区。
