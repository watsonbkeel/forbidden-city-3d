# R163 后继累计：延春阁南上栏浅色转棒（仅本地，未上传）

## 身份与范围
从本地基础 `d689182a667974cafdd166fbcfc28efe366c638c` 单独起累计工作树，仅接作者候选 `090e3cb6`；本树等价摘取为 `1ad69ee8241da2d64428211e68f7e173605f1666`，两者树完全相同。后续仅README、QA与证据变化，生产代码仍只改 `YanchunSouthPhotoFit.js` 和 `RemainingOuterHalls.js` 的单一调用。

25根既有南面上栏方棒换闭合简化转棒、2横杆浅色；2根与南端完全同位的既有侧栏方棒仅同色，保留其方形。834件其他mesh、旧位置/高度/包络及所有碰撞、walkable、room、region和地图保留。无屋裙支撑、全局物理或路线改造；无新的高层到达/屋顶下机能力。原英华真碑、双侧通行和已有屋顶轮廓追加保留。

源照片、拟合边界、作者RED/GREEN、前后同机位CPU图和首次独审见 [作者证据](../../../../reports/r163-yanchun-rail/README.md)。25是保留模型重复数，浅色与转棒轮廓来自实看照片；米制尺寸、色值、具体剖面不是测绘、数棒或精雕复原。源照片不上传。

## 本轮必要验证
- `target-normal.tap`: 新视觉/保留3＋旧R66牌匾/撤回标记2＋正常累计World1，6/6通过，0skip。
- 正常World额外逐项保护英华已有38个owners（角色/顺序/数值box），原non-rescue台顶、1条architecture元数据、4合批mesh/970三角/原包络，以及旧outer-west轮廓精确前缀和已验英华真屋顶尾部。所有既有Yanchun碰撞/导航行不从流校验剔除。
- `ground-entry.tap`: 10/60Hz×走/跑×正/倒8个实际入口往返通过。
- `build.txt`: 全新dist、721模块构建通过，既有chunk体积警告保留。运行输入clean，构建归属摘取提交1ad69ee8；随后仅文档/QA不改运行输入。
- `http-verify.json`: `/gugong/`本地137文件HTTP200、字节数/SHA-256全部精确，未知地址404；不是外部站点部署。
- 初次扩展owners保护只因生产`triangleInstance`引用的Three.js mesh UUID每次随机而失败。`target-normal-uuid-harness-fail.tap`完整保留；测试仅规范化id末尾UUID，角色/顺序/box数值和其余对象均逐项精确比较，无生产修改，不把旧错误擦掉。

首次完整历史套件因稀疏缺历史docs/assets而失败的日志仍保存在作者证据；本轮不盲重跑历史全套、不改旧锁或声称全绿。英华基础归档40/40属于d689阶段，不伪装成本后继已完整重跑。GPU/PBR、手机、全流式和整建筑复原仍未验，旧殿阶问题不消失。

## 交付限制
本地分支 `feat/r163-yanchun-cumulative-2232`，基础与作者版本均保留可回滚。上游唯一create_tree尚须集成负责人拿到确定回执、回读父身份后，才可另行准备后继上传；本工作没有任何远端写、main变更、部署或凭据/权限修改。不能用本地提交SHA冒称远端父或完整远端树一致。

## 原始日志保真例外
完整`git diff --cached --check`因首次UUID验证失败原始日志第32、368行仅有空白而退出2（见`staged-diff-check.txt`）。保留该日志原始字节，不为“全净”改写失败证据。生产/测试/脚本、README与JSON文件的限定diff-check退出0；不得把本累计描述为完整diff-check全净。
