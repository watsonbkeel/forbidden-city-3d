# P1-U · 传送与导航 UX（推荐模型：gpt-6.1-sol high；交叉审：sonnet5.5）

> 前置：P0 已合入 main。
> worktree：`git worktree add ../fc-p1-ux -b feat/p1-ux`

## 背景
1:1 后午门到神武门约 850m，步行 5m/s 需近 3 分钟。必须提供快速移动手段，否则无人走完。

## 所有权文件
- `src/ui/Minimap.js`、`src/ui/SettingsMenu.js`、新建 `src/ui/Teleport.js`
- `src/controls/FirstPerson.js` **仅允许**新增 `teleportTo(x, z, lookAtX, lookAtZ)` 方法；不改碰撞/步进逻辑
- `src/config/constants.js` **仅允许**新增 `TELEPORT` 段与调整 `PLAYER.SPRINT_SPEED`
- `main.js` 仅允许接入 Teleport 实例

## 任务
### U-1 小地图传送
- 小地图（M 键 / 移动端右上角）点击任一建筑名 → 传送到该建筑**正门前 8m**，面向建筑。
- 传送前 `ZoneManager.ensureLoaded(zoneId)`，等构建完成再移动（显示 "前往 xx…" 遮罩，≤ 1s）。
- 传送后 `CollisionManager.getGroundHeight` 校正 y，避免落入台基。

### U-2 快捷传送点
- `TELEPORT.POINTS`：午门、太和殿、乾清宫、御花园、东六宫、西六宫、宁寿宫、神武门（8 个）
- 桌面：数字键 1-8；移动端：小地图底部一排图标。

### U-3 导览路线（可选，时间够再做）
- `TELEPORT.ROUTES`：中轴线 / 东六宫 / 宁寿宫 三条路线，按顺序自动传送 + 每点停留 5s，可随时打断。

### U-4 步速
- 1:1 后把 `SPRINT_SPEED` 提到 12，`JOYSTICK_RUN_SPEED` 提到 9。stepwalk 以 10 帧低帧率跑一遍确认不穿台基。

### U-5 位置提示升级
- 左上角 location-panel 增加 "所在区 › 所在建筑" 两级，数据来自 ZoneManager 当前区 + 现有 `getCurrentLocation`。

## 验收
- [ ] 小地图点击任一名字可传送，落地不卡台基、不穿墙
- [ ] 8 个快捷点全部可用，跨区传送时 PerfHUD 显示目标区已加载
- [ ] stepwalk + regression 全绿
- [ ] 移动端（Chrome 设备模拟 iPhone）传送图标可点、不遮挡方向盘
- [ ] `docs/agent-tasks/REPORTS/P1-U.md`

## 禁止
- 不改碰撞逻辑、不改 ZoneManager 内部实现（只调它的公开方法）
