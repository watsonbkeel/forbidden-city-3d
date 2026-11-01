# 午门真实南台上的连续跳跃（有界候选）

父本：`10ccdc3f40b11f18253ac4d7e72f9ea28de18989`。隔离 detached 工作树，不修改 main/远端分支，不推送；交唯一集成人整合。

## 最小修改

仅调整 `WumenSouthDeckBoundary.js` 脚面高度谓词：

- 原：12.3m ±0.08m接触带，导致台上跳起后约1秒水平停顿。
- 新：脚面 `[12.22, 12.3 + PLAYER.JUMP_VELOCITY²/(2*PLAYER.GRAVITY) + .08]`，当前上限 **14.23142857m**。这取自已有7.2m/s起跳、14m/s²重力，不提高跳高。

所有原来的真实安装器来源身份、当前注册存活owner、原box/源box精确匹配、完整半径脚印被相邻真实台面并集覆盖均保持。地面/台下、超正常跳高、台外/中央凹口、移除任一必要cell、卸载、复制伪owner仍拒绝。Collision、FirstPerson、constants、几何、支承和高程无修改。

这是“有限真实支承上方、正常跳高内”的空间许可，不记录或认证必须从本台起跳的历史状态；不会凭原起点令玩家飞离实际台面。现有水平细分≤radius/2与整脚印覆盖让玩家不能跨缺失cell，其他实体/水/边界仍各自执行。

本记录替代上一南界修复记录中的“跳起后暂止水平移动”限制；上一记录作为历史保留。

## 验证

- 新测试先在旧10cc生产实现上2/2失败：10Hz普通跳9空中帧8暂停；旧60Hz只读诊断60帧59暂停。
- 新目标8/8通过（原边界6项＋新增2项）。原先“feet13为空中必须拒绝”的负例按新授权改为feet14.3（超当前最高正常跳高）仍拒绝，不删除台外/无owner等限制。
- 新实际FirstPerson16组合：双侧×10/60Hz×走/跑×南北双向；空中暂停帧0、逻辑身体接触0、正常落地12.3m。峰值10Hz13.8m、60Hz14.0916667m；保留本来离开真实台边即阻挡的行为。
- 与原午门assembly/routes/wall-junction/real-library/descent共同回归 **22/22通过**；build通过。npm test不存在默认脚本。
- Astra独审8/8通过；额外六条长空中sweep指向外侧/南端/中空/对翼均未逃出真实支承。移去真实x=46.1–49.9支承cell后，从两侧有效支承端点发起的空中扫掠停在x45.5，不能跳过缺口；无阻断发现。
- 本轮未重复浏览器/全World门禁。前轮Chromium socket环境阻塞，以及父基线zones武英/寿安净空和Unsupported furniture-domain shape失败保留，不冒称全套绿。

日志 `/tmp/wumen-jump-audit-20261101/`：red.txt/red-final.txt、green-second.txt、final-targeted.txt、related.txt、build.txt、npm-test.txt。独审 `/tmp/wumen-jump-independent-review.log`。不上传原始日志。

## 集成范围

- `src/scene/palace/special/WumenSouthDeckBoundary.js`：唯一生产变更
- `tests/photo-fidelity/batches/wumen-south-deck-boundary.test.mjs`：更新超跳高负例
- `tests/photo-fidelity/batches/wumen-south-deck-jump.test.mjs`：新增实际跳跃及有限空域负例
- 本说明
